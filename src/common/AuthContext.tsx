'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, logout as authLogout, User } from './auth'
import { getSupabaseClient } from './network'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  const refreshUser = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      setUser(null)
      return
    }
    
    try {
      // Fetch fresh user data from database
      const supabase = getSupabaseClient()
      const { data: freshUserData, error } = await supabase
        .from('users')
        .select('id, username, email, role, created_at, learning_style_id')
        .eq('id', currentUser.id)
        .single()
      
      if (error) {
        console.error('Error refreshing user data:', error)
        setUser(currentUser) // Fallback to cached data
        return
      }
      
      // Update localStorage with fresh data
      const updatedUser = {
        id: freshUserData.id,
        username: freshUserData.username,
        email: freshUserData.email,
        role: freshUserData.role,
        created_at: freshUserData.created_at,
        learning_style_id: freshUserData.learning_style_id
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        document.cookie = `currentUser=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400`
      }
      
      setUser(updatedUser)
    } catch (error) {
      console.error('Error in refreshUser:', error)
      setUser(currentUser) // Fallback to cached data
    }
  }

  useEffect(() => {
    // Use a small timeout to prevent flickering on fast connections
    const timer = setTimeout(async () => {
      setIsHydrated(true)
      await refreshUser()
      setIsLoading(false)
    }, 50) // Very brief delay to prevent flash

    return () => clearTimeout(timer)

    // Listen for storage changes to handle login/logout from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        refreshUser().catch(console.error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (user: User) => {
    setUser(user)
    
    // Redirect based on user role after login
    if (typeof window !== 'undefined') {
      const roleRoutes = {
        student: '/student',
        teacher: '/teacher',
        admin: '/admin'
      } as const
      
      const redirectPath = roleRoutes[user.role]
      if (redirectPath) {
        setTimeout(() => {
          window.location.href = redirectPath
        }, 100)
      }
    }
  }

  const logout = async () => {
    await authLogout()
    setUser(null)
    
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const value: AuthContextType = {
    user,
    isLoading: isLoading || !isHydrated,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
