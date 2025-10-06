'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Brain, X, ArrowRight } from 'lucide-react'

interface LearningStyleRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  returnUrl?: string
}

export default function LearningStyleRequiredModal({ 
  isOpen, 
  onClose, 
  returnUrl 
}: LearningStyleRequiredModalProps) {
  const router = useRouter()

  const handleTakeTest = () => {
    const testUrl = returnUrl 
      ? `/learning-style-test?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/learning-style-test'
    router.push(testUrl)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-green mr-3" />
              <h2 className="text-xl font-bold text-dark-gray">Learning Style Required</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-dark-gray mb-2">
                Personalized Learning Awaits!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To access learning content, quizzes, and tests, we need to understand your learning style first. 
                This helps us show you content designed specifically for how you learn best.
              </p>
            </div>

            <div className="bg-green/5 border border-green/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Content tailored to your learning style</li>
                <li>• Better learning outcomes</li>
                <li>• More engaging educational experience</li>
                <li>• Takes just 2-3 minutes to complete</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleTakeTest}
                className="w-full bg-green hover:bg-green/90 text-white px-6 py-3 rounded-lg font-medium text-center flex items-center justify-center"
              >
                Take Learning Style Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 px-6 py-2 text-sm"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
