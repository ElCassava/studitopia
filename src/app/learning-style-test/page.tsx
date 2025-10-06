'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { Brain, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'

interface TestChoice {
  id: string
  choice_text: string
  style_id: string
}

interface TestQuestion {
  id: string
  question_text: string
  image_url?: string
  learning_style_test_choices: TestChoice[]
}

interface LearningStyle {
  id: string
  name: string
  description: string
}

interface TestData {
  questions: TestQuestion[]
  learningStyles: LearningStyle[]
}

interface UserResponse {
  questionId: string
  choiceId: string
  timeTaken: number
}

export default function LearningStyleTestPage() {
  const { user, login } = useAuth()
  const router = useRouter()
  
  const [testData, setTestData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [selectedChoice, setSelectedChoice] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    fetchTestData()
  }, [user, router])

  const fetchTestData = async () => {
    try {
      const response = await fetch('/api/learning-style-test')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        return
      }
      
      setTestData(data)
      setStartTime(Date.now())
    } catch (error) {
      console.error('Error fetching test data:', error)
      setError('Failed to load the learning style test')
    } finally {
      setLoading(false)
    }
  }

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId)
  }

  const handleNext = () => {
    if (!selectedChoice || !testData) return
    
    const timeTaken = Date.now() - startTime
    const newResponse: UserResponse = {
      questionId: testData.questions[currentQuestion].id,
      choiceId: selectedChoice,
      timeTaken
    }
    
    setResponses([...responses, newResponse])
    
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedChoice('')
      setStartTime(Date.now())
    } else {
      // Last question, submit the test
      submitTest([...responses, newResponse])
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      // Remove the last response
      const newResponses = responses.slice(0, -1)
      setResponses(newResponses)
      setSelectedChoice('')
      setStartTime(Date.now())
    }
  }

  const submitTest = async (finalResponses: UserResponse[]) => {
    if (!user) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/learning-style-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          responses: finalResponses
        })
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        return
      }
      
      // Update user in auth context with new learning style
      const updatedUser = { ...user, learning_style_id: data.learningStyle.id }
      login(updatedUser)
      
      setResult(data)
    } catch (error) {
      console.error('Error submitting test:', error)
      setError('Failed to submit the test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = () => {
    // Redirect back to where they came from, or to courses
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
    router.push(returnUrl || '/courses')
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading learning style assessment...</div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={() => router.push('/courses')}
                className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (result) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green mx-auto mb-4" />
                <h1 className="font-feather text-3xl text-dark-gray mb-2">
                  Assessment Complete!
                </h1>
                <p className="text-gray-600">
                  Your learning style has been determined
                </p>
              </div>
              
              <div className="bg-green/10 border border-green/20 rounded-lg p-6 mb-6">
                <h2 className="font-bold text-2xl text-green mb-2">
                  {result.learningStyle.name} Learner
                </h2>
                <p className="text-gray-700">
                  {result.learningStyle.description}
                </p>
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                Based on your {result.totalResponses} responses, we've personalized your learning experience.
              </div>
              
              <button
                onClick={handleFinish}
                className="bg-green hover:bg-green/90 text-white px-8 py-3 rounded-lg font-medium text-lg flex items-center mx-auto"
              >
                Continue Learning
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!testData || testData.questions.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="text-gray-600 text-lg">No test questions available</div>
            </div>
          </div>
        </main>
      </>
    )
  }

  const question = testData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-green mr-3" />
              <h1 className="font-feather text-3xl text-dark-gray">
                Learning Style Assessment
              </h1>
            </div>
            <p className="text-gray-600">
              Help us personalize your learning experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {testData.questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm mb-8">
            <h2 className="font-bold text-xl text-dark-gray mb-6">
              {question.question_text}
            </h2>

            <div className="space-y-3">
              {question.learning_style_test_choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedChoice === choice.id
                      ? 'border-green bg-green/5 text-green'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedChoice === choice.id
                        ? 'border-green bg-green'
                        : 'border-gray-300'
                    }`}>
                      {selectedChoice === choice.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{choice.choice_text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedChoice || submitting}
              className="flex items-center bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : currentQuestion === testData.questions.length - 1 ? (
                <>
                  Complete Assessment
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
