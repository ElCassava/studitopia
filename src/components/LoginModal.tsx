'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { login } from '../common/auth'
import { useAuth } from '@/common/AuthContext'
import Image from 'next/image'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { refreshUser } = useAuth()
  const [step, setStep] = useState<"email" | "password">("email")
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setStep("password")
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await login(username, password)
      
      if (result.error) {
        setMessage(result.error.message)
      } else {
        setMessage('Login successful!')

        refreshUser()
        setTimeout(() => {
          onClose()
          setUsername('')
          setPassword('')
          setMessage('')
          setStep("email")
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex relative" style={{ width: '1010px', height: '606px' }}>
    
        {/* Close button (move here, absolute relative to parent) */}
        <button
          onClick={onClose}
          className="absolute top-4 left-6 text-light-gray text-3xl font-bold z-10"
        >
          ×
        </button>

        {/* Left: Mascot */}
        <div className="w-1/2 flex items-center justify-center bg-white">
          <Image
            src="/images/mascot/mascot2.png"
            alt="Studitopia Mascot"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        {/* Right: Green login form */}
        <div className="w-1/2 bg-green text-white flex flex-col justify-center px-10 py-8 relative rounded">
          

          {/* STEP 1: Email */}
          {step === "email" && (
            <>
              <h2 className="text-4xl font-feather font-bold mb-6">Log in to studitopia</h2>

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    EMAIL OR USERNAME
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded bg-white text-dark-gray focus:outline-none"
                    placeholder="student123@gmail.com"
                  />
                </div>
                
                {/* Next Button */}
                <Button
                  type="submit"
                  className="w-full bg-white text-bright-green font-semibold py-3 rounded shadow border-b-4 border-dark-gray"
                >
                  Next
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/70"></div>
                  <span className="text-sm">OR</span>
                  <div className="flex-1 h-px bg-white/70"></div>
                </div>

                {/* Google login */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white text-bright-green font-bold py-3 rounded shadow border-b-4 border-dark-gray"
                >
                  <Image src="/images/logo/google.png" alt="Google" width={20} height={20} />
                  Sign in with Google
                </button>

                {/* Facebook login */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white text-bright-green font-bold py-3 rounded shadow border-b-4 border-dark-gray"
                >
                  <Image src="/images/logo/facebook.png" alt="Facebook" width={20} height={20} />
                  Sign in with Facebook
                </button>
              </form>

              <p className="text-sm mt-6 text-center">
                New to studitopia?{' '}
                <button type="button" className="underline font-semibold text-white">
                  Sign up for free
                </button>
              </p>
            </>
          )}

          {/* STEP 2: Password */}
          {step === "password" && (
            <>
              <h2 className="text-3xl font-feather font-bold mb-3">Enter your password</h2>
              <p className="mb-4 text-sm text-white/80">
                {username.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c)}
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded bg-white text-dark-gray focus:outline-none pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-bright-green font-semibold py-3 rounded shadow border-b-4 border-dark-gray"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>
              </form>

              {message && (
                <div className={`mt-3 text-sm p-2 rounded ${
                  message.includes('successful') 
                    ? 'text-green bg-green-50' 
                    : 'text-red-500 bg-red-50'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-between mt-4 text-sm">
                <button type="button" onClick={() => setStep("email")} className="underline">
                  Sign in to different account?
                </button>
                <button type="button" className="underline">
                  Forgot password?
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginModal
