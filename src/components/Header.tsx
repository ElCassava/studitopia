'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import LoginModal from './LoginModal'
import { useAuth } from '@/common/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const Header = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user: currentUser, isLoading, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or near top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleLogout = async () => {
    await logout()
  }

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 w-full flex items-center justify-between px-[225px] py-4 bg-white shadow-sm text-dark-gray border-b border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
          <h1 className="text-3xl font-bold text-green text-bold font-feather lowercase">Studitopia</h1>
          
          {isLoading ? (
            // Loading state - show skeleton that matches the expected content size
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-12 h-5 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-5 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="w-14 h-5 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : currentUser ? (
            // Logged in state - Navigation style
            <nav className='flex items-center gap-8'>
              <Link href="/" className={`flex items-center gap-2 transition-colors ${
                pathname === '/' || pathname === '/student' || pathname === '/teacher' || pathname === '/admin'
                  ? 'text-green font-semibold' 
                  : 'text-gray-500/70 hover:text-gray-700'
              }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>
              
              <Link href="/courses" className={`flex items-center gap-2 transition-colors ${
                pathname === '/courses'
                  ? 'text-green font-semibold' 
                  : 'text-gray-500/70 hover:text-gray-700'
              }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="font-medium">Courses</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </nav>
          ) : (
            // Not logged in state
            <span className="flex gap-4">
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-bright-green text-white px-9 py-4 rounded-lg text-lg font-semibold border-b-4 border-green hover:bg-green transition-colors"
              >
                Login
              </Button>

              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-white text-bright-green px-9 py-4 rounded-lg text-lg font-semibold border border-light-gray border-b-4 hover:bg-green transition-colors"
              >
                Register
              </Button>
            </span>
          )}
      </header>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default Header