'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { login } from '../common/auth'
import { useAuth } from '@/common/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login: authLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await login(username, password)
      
      if (result.error) {
        setMessage(result.error.message)
      } else {
        setMessage('Login successful!')
        // Use AuthContext login to handle role-based redirect
        if (result.data?.user) {
          authLogin(result.data.user)
        }
        setTimeout(() => {
          onClose()
          setUsername('')
          setPassword('')
          setMessage('')
          onLoginSuccess?.()
        }, 1000)
      }
    } catch (err) {
      setMessage('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-lg" style={{ width: '1010px', height: '606px' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-dark-gray font-feather">Login to Studitopia</h2>
            <button
              onClick={onClose}
              className="text-dark-gray hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark-gray mb-2">
                  Username/Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
                  placeholder="Enter your username or email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-gray mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              {message && (
                <div className={`text-sm p-3 rounded ${
                  message.includes('successful') 
                    ? 'text-green bg-green-50' 
                    : 'text-red-500 bg-red-50'
                }`}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green hover:bg-green/90 text-white py-3 text-lg font-semibold"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <p className="text-center text-sm text-dark-gray">
                Don't have an account?{' '}
                <button type="button" className="text-green hover:underline font-semibold">
                  Sign up here
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
