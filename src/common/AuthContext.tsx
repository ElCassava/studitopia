'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, logout as authLogout, User } from './auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  const refreshUser = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }

  useEffect(() => {
    // Use a small timeout to prevent flickering on fast connections
    const timer = setTimeout(() => {
      setIsHydrated(true)
      refreshUser()
      setIsLoading(false)
    }, 50) // Very brief delay to prevent flash

    return () => clearTimeout(timer)

    // Listen for storage changes to handle login/logout from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        refreshUser()
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
