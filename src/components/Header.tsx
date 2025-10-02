'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import LoginModal from './LoginModal'
import { useAuth } from '@/common/AuthContext'

const Header = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user: currentUser, logout } = useAuth()

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
          
          {currentUser ? (
            // Logged in state
            <div className='flex items-center gap-4'>
              <span className="text-sm text-dark-gray">
                Welcome, <span className="font-semibold">{currentUser.username}</span>
              </span>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
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