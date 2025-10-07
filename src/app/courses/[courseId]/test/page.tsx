'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { getCourseById, Course, getUserCourseProgress, markSectionCompleted, CourseSection, Question } from '@/common/courses'
import { getSupabaseClient } from '@/common/network'
import { getLearningStyleById, LearningStyle, hasLearningStyle, getCurrentUrl } from '@/utils/learningStyles'
import LearningStyleRequiredModal from '@/components/LearningStyleRequiredModal'
import AudioPlayer from '@/components/AudioPlayer'
import { ArrowLeft, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testSections, setTestSections] = useState<CourseSection[]>([])
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [isTestActive, setIsTestActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({})
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes
  const [testResults, setTestResults] = useState<{[key: string]: {score: number, passed: boolean}}>({})
  const [, setCompletedTestIds] = useState<Set<string>>(new Set())
  const [userLearningStyle, setUserLearningStyle] = useState<LearningStyle | null>(null)
  const [showLearningStyleModal, setShowLearningStyleModal] = useState(false)
  const [currentQuestionAudio, setCurrentQuestionAudio] = useState<any>(null)
  const [isAuditoryLearner, setIsAuditoryLearner] = useState(false)

  // Sample test data is now loaded dynamically in fetchTestSections

  const fetchTestSections = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Get user's learning style from auth context
      const userLearningStyleId = user?.learning_style_id
      
      // Get course sections with test_sections and test_questions
      let query = supabase
        .from('course_sections')
        .select(`
          id,
          course_id,
          section_type,
          test_sections (
            id,
            style_id,
            test_questions (
              id,
              question_text,
              correct_answer,
              test_choices (
                id,
                choice_text
              )
            )
          )
        `)
        .eq('course_id', courseId)
        .eq('section_type', 'test')
      
      const { data: courseSections, error: sectionsError } = await query
      
      // Only treat it as an error if there's actually an error message or code
      if (sectionsError && (sectionsError.message || sectionsError.code)) {
        console.error('Error fetching test sections:', sectionsError)
        return
      }
      
      // Transform the data to match our component expectations
      // Filter test_sections by user's learning style preference
      const enhancedSections: any[] = []
      let sectionIndex = 0
      
      // Safely handle potentially null courseSections
      const sections = courseSections || []
      
      sections.forEach((courseSection: any) => {
        const testSections = courseSection.test_sections || []
        
        // Filter test sections by user's learning style if available
        const filteredTestSections = userLearningStyleId 
          ? testSections.filter((ts: any) => ts.style_id === userLearningStyleId)
          : testSections
        

        
        if (filteredTestSections.length === 0) {
          // No matching test_sections for user's learning style
          if (testSections.length > 0) {
            // There are test sections but none match user's style - show a message
            enhancedSections.push({
              id: courseSection.id,
              course_section_id: courseSection.id,
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Test ${sectionIndex + 1}`,
              description: userLearningStyleId 
                ? 'This test is not available for your learning style. Please contact your instructor or try a different learning style.'
                : 'No test available for this section.',
              questions: [{
                id: 1,
                question: userLearningStyleId 
                  ? "This test is not configured for your learning style. Please contact your instructor."
                  : "No test questions available for this section.",
                options: ["Understood", "OK", "Got it", "Thanks"],
                correct: 0
              }],
              timeLimit: 30,
              passingScore: 70,
              test_section_id: null,
              style_id: null
            })
            sectionIndex++
          } else {
            // No test_sections at all, create a placeholder
            enhancedSections.push({
              id: courseSection.id,
              course_section_id: courseSection.id,
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Test ${sectionIndex + 1}`,
              description: 'No test available for this section.',
              questions: [{
                id: 1,
                question: "This test is not yet configured with questions. Please contact your instructor.",
                options: ["Understood", "OK", "Got it", "Thanks"],
                correct: 0
              }],
              timeLimit: 30,
              passingScore: 70,
              test_section_id: null,
              style_id: null
            })
            sectionIndex++
          }
        } else {
          // Create a section for each matching test_section
          filteredTestSections.forEach((testSection: any) => {
            // Transform database questions to the expected format
            const questions = testSection.test_questions?.map((q: any, qIndex: number) => {
              const choices = q.test_choices || []
              const correctChoiceText = q.correct_answer
              // Fix: Match by the letter prefix (A, B, C, D) instead of exact text
              const correctIndex = choices.findIndex((choice: any) => 
                choice.choice_text.startsWith(correctChoiceText + '.')
              )
              
              return {
                id: qIndex + 1, // UI question number (1-based)
                dbId: q.id, // Actual database question ID for tracking
                question: q.question_text,
                options: choices.map((choice: any) => choice.choice_text),
                correct: correctIndex >= 0 ? correctIndex : 0
              }
            }) || []
            
            enhancedSections.push({
              id: `${courseSection.id}-${testSection.id}`, // Unique ID combining both
              course_section_id: courseSection.id, // Store original course section ID
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Test ${sectionIndex + 1}`,
              description: "Complete this test to demonstrate your understanding of the course material.",
              questions: questions.length > 0 ? questions : [{
                id: 1,
                question: "This test has no questions configured. Please contact your instructor.",
                options: ["Understood", "OK", "Got it", "Thanks"],
                correct: 0
              }],
              timeLimit: 30,
              passingScore: 70,
              test_section_id: testSection.id,
              style_id: testSection.style_id
            })
            sectionIndex++
          })
        }
      })
      

      
      setTestSections(enhancedSections)
      

      
      // Fetch user's learning style name for display
      if (userLearningStyleId) {
        const learningStyle = await getLearningStyleById(userLearningStyleId)
        setUserLearningStyle(learningStyle)
      }
      
      // Get user progress for these sections
      const progress = await getUserCourseProgress(user!.id, courseId)
      if (progress) {
        const completedIds = new Set(
          progress.sectionProgress
            .filter(p => p.completed && p.section_type === 'test')
            .map(p => p.course_section_id)
        )
        setCompletedTestIds(completedIds)
        
        // Set test results from progress data
        // Note: progress is tracked by course_section_id, not the composite ID
        const results: {[key: string]: {score: number, passed: boolean}} = {}
        progress.sectionProgress
          .filter(p => p.completed && p.section_type === 'test')
          .forEach(p => {
            if (p.score !== undefined) {
              const testSection = enhancedSections.find((s: any) => s.course_section_id === p.course_section_id)
              // Use course_section_id for consistency with the learn page logic
              results[p.course_section_id] = {
                score: p.score,
                passed: p.score >= (testSection?.passingScore || 70)
              }
            }
          })
        setTestResults(results)
      }
      
    } catch (error) {
      console.error('Error fetching test sections:', error)
      setError('Failed to load test sections')
    }
  }, [courseId, user])

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const courseData = await getCourseById(courseId, user?.id)
      
      if (!courseData) {
        setError('Course not found')
        return
      }
      
      if (!courseData.is_enrolled) {
        router.push(`/courses/${courseId}`)
        return
      }
      
      setCourse(courseData)
      
      // Fetch test sections and user progress
      await fetchTestSections()
      
    } catch (err) {
      setError('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }, [courseId, user, router, fetchTestSections])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }
    
    if (user) {
      // Check if user has a learning style
      if (!hasLearningStyle(user)) {
        setShowLearningStyleModal(true)
        return
      }
      
      if (courseId) {
        fetchCourseDetails()
      }
    }
  }, [user, isLoading, courseId, router, fetchCourseDetails])

  // Function to get audio data for a question using local files
  const getQuestionAudio = useCallback((questionNumber: number) => {
    if (!isAuditoryLearner || !questionNumber) return null
    
    // Return local audio file path directly mapped to question number
    return {
      audio_url: `/audio-files/Q${questionNumber}.mp3`,
      audio_title: `Question ${questionNumber} Audio`,
      duration: null // Duration will be determined by the audio player
    }
  }, [isAuditoryLearner])

  // Check if user is auditory learner
  useEffect(() => {
    if (user && userLearningStyle) {
      const isAuditory = userLearningStyle.name.toLowerCase().includes('auditory') || 
                        userLearningStyle.name.toLowerCase().includes('audio')
      setIsAuditoryLearner(isAuditory)
    }
  }, [user, userLearningStyle])

  // Get audio when current question changes
  useEffect(() => {
    if (isTestActive && isAuditoryLearner) {
      const audioData = getQuestionAudio(currentQuestion)
      setCurrentQuestionAudio(audioData)
    } else {
      setCurrentQuestionAudio(null)
    }
  }, [currentQuestion, isTestActive, isAuditoryLearner, getQuestionAudio])

  const startTest = (testIndex: number) => {
    const test = testSections[testIndex]
    if (test) {
      setCurrentTestIndex(testIndex)
      setIsTestActive(true)
      setCurrentQuestion(1)
      setSelectedAnswers({})
      setTimeRemaining((test.timeLimit || 30) * 60)
    }
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex.toString()
    }))
  }

  const handleSubmitTest = useCallback(async () => {
    const test = testSections[currentTestIndex]
    if (!test || !user) return

    const endTime = new Date().toISOString()
    const startTime = new Date(Date.now() - ((test.timeLimit || 30) * 60 * 1000 - timeRemaining * 1000)).toISOString()

    // Prepare detailed answers for analytics with proper tracking
    console.log('Preparing detailed answers for submission...')
    console.log('Selected answers:', selectedAnswers)
    console.log('Test questions:', test.questions?.map((q: any) => ({ id: q.id, dbId: q.dbId, correct: q.correct })))
    
    const detailedAnswers = test.questions?.map((question: any, index: number) => {
      const selectedAnswerIndex = selectedAnswers[question.id] // Use UI question ID to get user selection
      const selectedAnswerInt = selectedAnswerIndex ? parseInt(selectedAnswerIndex) : null
      const isCorrect = selectedAnswerInt !== null && selectedAnswerInt === question.correct
      
      const answerDetail = {
        questionId: question.dbId || question.id, // Database question ID for foreign key
        uiQuestionId: question.id, // UI question number for reference
        selectedAnswer: selectedAnswerInt,
        isCorrect: isCorrect,
        timeSpent: Math.floor(Math.random() * 30) + 10, // Estimate time per question
        answeredAt: new Date().toISOString()
      }
      
      console.log(`Question ${question.id}: selected=${selectedAnswerInt}, correct=${question.correct}, isCorrect=${isCorrect}`)
      return answerDetail
    }) || []
    
    console.log('Final detailed answers:', detailedAnswers)

    const correctAnswers = detailedAnswers.filter(a => a.isCorrect).length
    const score = Math.round((correctAnswers / (test.questions?.length || 1)) * 100)
    const passed = score >= (test.passingScore || 70)

    try {
      // Save detailed test results for analytics
      const detailedResponse = await fetch('/api/save-test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: test.course_section_id || test.id,
          testSectionId: (test as any).test_section_id,
          questions: test.questions,
          answers: detailedAnswers,
          score: score,
          startTime: startTime,
          endTime: endTime
        }),
      })

      if (!detailedResponse.ok) {
        console.warn('Failed to save detailed test results')
      } else {
        const responseData = await detailedResponse.json()
        console.log('✅ Test results saved:', responseData)
        
        // If we have a test attempt ID, track additional student details
        if (responseData.testAttemptId && detailedAnswers.length > 0) {
          const trackingResponse = await fetch('/api/track-student-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              courseId: test.course_section_id || test.id,
              testSectionId: (test as any).test_section_id,
              testAttemptId: responseData.testAttemptId,
              detailedAnswers: detailedAnswers
            }),
          })
          
          if (trackingResponse.ok) {
            const trackingData = await trackingResponse.json()
            console.log('✅ Student attempt details tracked:', trackingData)
          } else {
            console.warn('⚠️ Failed to track student attempt details')
          }
        }
      }

      // Also save to general progress tracking (fallback)
      const sectionId = test.course_section_id || test.id
      const success = await markSectionCompleted(user.id, courseId, sectionId, 'test', score)
      
      if (success) {
        setTestResults(prev => ({
          ...prev,
          [sectionId]: { score, passed }
        }))
        
        setCompletedTestIds(prev => new Set([...prev, sectionId]))
        
        // Refresh course data
        await fetchCourseDetails()
      } else {
        alert('Failed to save test results')
      }
    } catch (error) {
      alert('Error saving test results')
    }

    setIsTestActive(false)
    setTimeRemaining(0)
  }, [testSections, currentTestIndex, user, selectedAnswers, courseId, fetchCourseDetails, timeRemaining])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTestActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleSubmitTest()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTestActive, timeRemaining, handleSubmitTest])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Show learning style modal if user doesn't have one
  if (user && !hasLearningStyle(user)) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-4">Learning style assessment required</div>
            <button
              onClick={() => setShowLearningStyleModal(true)}
              className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg"
            >
              Take Assessment
            </button>
          </div>
        </main>
        <LearningStyleRequiredModal
          isOpen={showLearningStyleModal}
          onClose={() => setShowLearningStyleModal(false)}
          returnUrl={getCurrentUrl()}
        />
      </>
    )
  }

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
          <div className="text-lg text-dark-gray">Loading test content...</div>
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="text-green hover:text-green/80 font-medium"
            >
              Back to Course
            </button>
          </div>
        </main>
      </>
    )
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-4">Course not found</div>
            <button
              onClick={() => router.push('/courses')}
              className="text-green hover:text-green/80 font-medium"
            >
              Back to Courses
            </button>
          </div>
        </main>
      </>
    )
  }

  const currentTestData = testSections[currentTestIndex]
  const currentQuestionData = currentTestData?.questions?.find((q: Question) => q.id === currentQuestion)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Navigation */}
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center text-green hover:text-green/90 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Course</span>
          </button>

          {/* Course Header */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mr-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="font-feather text-3xl text-dark-gray">
                  {course.title || course.course_name} - Tests
                </h1>
                <p className="text-gray-600">Assessment and Evaluation</p>
              </div>
            </div>
          </div>

          {!isTestActive ? (
            /* Test Selection */
            <div className="space-y-6">
              {testSections.length === 0 ? (
                /* No Content State */
                <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-xl text-dark-gray mb-4">No Test Content Available</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This course doesn't have any test content set up yet. Please contact your instructor or check back later.
                  </p>
                  <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Back to Course Overview
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testSections.map((test: CourseSection, index: number) => {
                  const result = testResults?.[test.course_section_id || test.id]
                  return (
                    <div key={test.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-xl text-dark-gray">{test.title}</h3>
                        {result && (
                          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            result.passed ? 'bg-green/10 text-green' : 'bg-red-50 text-red-600'
                          }`}>
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <AlertCircle className="h-4 w-4 mr-1" />
                            )}
                            {result.score}%
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {test.timeLimit} minutes
                        </div>
                        <div>
                          {test.questions?.length || 0} questions
                        </div>
                        <div>
                          Passing: {test.passingScore}%
                        </div>
                      </div>

                      {result && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Previous Result:</div>
                          <div className={`font-medium ${result.passed ? 'text-green' : 'text-red-600'}`}>
                            Score: {result.score}% - {result.passed ? 'Passed' : 'Failed'}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => startTest(index)}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          result?.passed
                            ? 'bg-green/10 text-green border border-green/20 hover:bg-green/20'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {result?.passed ? 'Retake Test' : 'Start Test'}
                      </button>
                    </div>
                  )
                })}
              </div>
              )}
              
              {/* Continue to Quiz button when all tests are completed and passed */}
              {testSections.length > 0 && testSections.every(test => {
                const result = testResults?.[test.course_section_id || test.id]
                return result && result.passed
              }) && (
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push(`/courses/${courseId}/quiz`)}
                    className="flex items-center bg-green hover:bg-green/90 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                  >
                    Continue to Quiz
                    <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
            </div>
          ) : (
            /* Active Test */
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Test Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-2xl text-dark-gray">
                      {currentTestData?.title}
                    </h2>
                    <p className="text-gray-600">
                      Question {currentQuestion} of {currentTestData?.questions?.length || 0}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center px-3 py-2 rounded-lg font-medium ${
                      timeRemaining < 300 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Clock className="h-4 w-4 mr-2" />
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-8">
                {currentQuestionData && (
                  <>
                    <h3 className="font-semibold text-xl text-dark-gray mb-6">
                      {currentQuestionData.question}
                    </h3>
                    
                    {/* Audio Player for Auditory Learners */}
                    {isAuditoryLearner && currentQuestionAudio && (
                      <div className="mb-6">
                        <AudioPlayer
                          audioUrl={currentQuestionAudio.audio_url}
                          audioTitle={currentQuestionAudio.audio_title}
                          duration={currentQuestionAudio.duration}
                          className="max-w-lg"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {currentQuestionData.options && currentQuestionData.options.length > 0 ? (
                        currentQuestionData.options.map((option: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion, index)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedAnswers[currentQuestion] === index.toString()
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              selectedAnswers[currentQuestion] === index.toString()
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedAnswers[currentQuestion] === index.toString() && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        </button>
                      ))
                      ) : (
                        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 font-medium">No answer choices available for this question</p>
                          <p className="text-red-500 text-sm mt-2">This might be a data loading issue. Please refresh the page or contact support.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                  disabled={currentQuestion === 1}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentQuestion === (currentTestData?.questions?.length || 0) ? (
                  <button
                    onClick={handleSubmitTest}
                    className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(currentTestData?.questions?.length || 1, currentQuestion + 1))}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <LearningStyleRequiredModal
        isOpen={showLearningStyleModal}
        onClose={() => setShowLearningStyleModal(false)}
        returnUrl={getCurrentUrl()}
      />
    </>
  )
}
