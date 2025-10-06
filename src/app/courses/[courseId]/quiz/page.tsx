'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { getCourseById, Course, getUserCourseProgress, markSectionCompleted, CourseSection } from '@/common/courses'
import { getSupabaseClient } from '@/common/network'
import { getLearningStyleById, LearningStyle, hasLearningStyle, getCurrentUrl } from '@/utils/learningStyles'
import LearningStyleRequiredModal from '@/components/LearningStyleRequiredModal'
import { ArrowLeft, HelpCircle, ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizSections, setQuizSections] = useState<CourseSection[]>([])
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizScores, setQuizScores] = useState<{[key: string]: number}>({})
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: boolean[]}>({})
  const [quizStartTime, setQuizStartTime] = useState<string | null>(null)
  const [detailedAnswers, setDetailedAnswers] = useState<{[key: string]: any[]}>({})
  const [, setCompletedQuizIds] = useState<Set<string>>(new Set())
  const [userLearningStyle, setUserLearningStyle] = useState<LearningStyle | null>(null)
  const [showLearningStyleModal, setShowLearningStyleModal] = useState(false)

  // Quiz data is now loaded dynamically in fetchQuizSections
 
  const fetchQuizSections = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Get user's learning style from auth context
      const userLearningStyleId = user?.learning_style_id
      console.log('User learning style ID:', userLearningStyleId)
      
      if (!userLearningStyleId) {
        console.warn('⚠️ User has no learning style set - showing all available quiz sections')
      } else {
        console.log('✅ Filtering quiz sections by user learning style:', userLearningStyleId)
      }
      
      // Get course sections with quiz_sections and quiz_contents
      let query = supabase
        .from('course_sections')
        .select(`
          id,
          course_id,
          section_type,
          quiz_sections (
            id,
            style_id,
            quiz_contents (
              id,
              description,
              image_url
            )
          )
        `)
        .eq('course_id', courseId)
        .eq('section_type', 'quiz')
      
      const { data: courseSections, error: sectionsError } = await query
      
      // Only treat it as an error if there's actually an error message or code
      if (sectionsError && (sectionsError.message || sectionsError.code)) {
        console.error('Error fetching quiz sections:', sectionsError)
        return
      }
      
      // Transform the data to match our component expectations
      // Filter quiz_sections by user's learning style preference
      const enhancedSections: any[] = []
      let sectionIndex = 0
      
      // Safely handle potentially null courseSections
      const sections = courseSections || []
      
      sections.forEach((courseSection: any) => {
        const quizSections = courseSection.quiz_sections || []
        
        // Filter quiz sections by user's learning style if available
        const filteredQuizSections = userLearningStyleId 
          ? quizSections.filter((qs: any) => qs.style_id === userLearningStyleId)
          : quizSections
        
        console.log(`Course section ${courseSection.id}: ${quizSections.length} total, ${filteredQuizSections.length} matching user's learning style`)
        
        if (userLearningStyleId && quizSections.length > 0 && filteredQuizSections.length === 0) {
          console.warn(`⚠️ No quiz sections match user's learning style ${userLearningStyleId} for course section ${courseSection.id}`)
          console.log('Available style IDs in this section:', quizSections.map((qs: any) => qs.style_id))
        }
        
        if (filteredQuizSections.length === 0) {
          // No matching quiz_sections for user's learning style
          if (quizSections.length > 0) {
            // There are quiz sections but none match user's style - show a message
            enhancedSections.push({
              id: courseSection.id,
              course_section_id: courseSection.id,
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Quick Check ${sectionIndex + 1}`,
              description: userLearningStyleId 
                ? 'This quiz is not available for your learning style. Please contact your instructor or try a different learning style.'
                : 'No quiz available for this section.',
              questions: [{
                question: userLearningStyleId 
                  ? "This quiz is not configured for your learning style. Please contact your instructor."
                  : "No quiz questions available for this section.",
                options: ["Understood", "OK", "Got it", "Thanks"],
                correct: 0,
                explanation: "Quiz content needs to be configured by the instructor."
              }],
              quiz_section_id: null,
              style_id: null
            })
            sectionIndex++
          } else {
            // No quiz_sections at all, create a placeholder
            enhancedSections.push({
              id: courseSection.id,
              course_section_id: courseSection.id,
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Quick Check ${sectionIndex + 1}`,
              description: 'Quick knowledge check to reinforce your learning.',
              questions: [{
                question: "This quiz is not yet configured. Please contact your instructor.",
                options: ["Understood", "OK", "Got it", "Thanks"],
                correct: 0,
                explanation: "Quiz content needs to be added by the instructor."
              }],
              quiz_section_id: null,
              style_id: null
            })
            sectionIndex++
          }
        } else {
          // Create a section for each matching quiz_section
          filteredQuizSections.forEach((quizSection: any) => {
            const quizContent = quizSection.quiz_contents?.[0]
            
            // For now, create a simple default question since we don't have a proper quiz question structure in DB yet
            // In a real implementation, you'd want to add quiz_questions table similar to test_questions
            enhancedSections.push({
              id: `${courseSection.id}-${quizSection.id}`, // Unique ID combining both
              course_section_id: courseSection.id, // Store original course section ID
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Quick Check ${sectionIndex + 1}`,
              description: quizContent?.description || "Quick knowledge check to reinforce your learning.",
              questions: [
                {
                  question: "Based on what you've learned, which approach is most effective?",
                  options: [
                    "Following established best practices",
                    "Ignoring documentation and guidelines", 
                    "Rushing through without planning",
                    "Avoiding systematic approaches"
                  ],
                  correct: 0,
                  explanation: "Following established best practices leads to more reliable and maintainable solutions."
                }
              ],
              quiz_section_id: quizSection.id,
              style_id: quizSection.style_id
            })
            sectionIndex++
          })
        }
      })
      
      console.log(`🧩 Created ${enhancedSections.length} quiz sections for course ${courseId}`)
      console.log('Section details:', enhancedSections.map(s => ({ 
        title: s.title, 
        hasQuestions: s.questions?.length > 0, 
        styleId: s.style_id,
        quizSectionId: s.quiz_section_id 
      })))
      
      setQuizSections(enhancedSections)
      
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
            .filter(p => p.completed && p.section_type === 'quiz')
            .map(p => p.course_section_id)
        )
        setCompletedQuizIds(completedIds)
        
        // Set quiz scores from progress data
        // Note: progress is tracked by course_section_id, not the composite ID
        const scores: {[key: string]: number} = {}
        progress.sectionProgress
          .filter(p => p.completed && p.section_type === 'quiz')
          .forEach(p => {
            if (p.score !== undefined) {
              // Use course_section_id for consistency with the learn and test pages
              scores[p.course_section_id] = p.score
            }
          })
        setQuizScores(scores)
      }
      
    } catch (error) {
      console.error('Error fetching quiz sections:', error)
      setError('Failed to load quiz sections')
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
      
      // Fetch quiz sections and user progress
      await fetchQuizSections()
      
    } catch (err) {
      console.error('Error fetching course details:', err)
      setError('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }, [courseId, user, router, fetchQuizSections])

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

  const startQuiz = (quizIndex: number) => {
    setCurrentQuizIndex(quizIndex)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizStartTime(new Date().toISOString())
    
    // Initialize detailed answers tracking for this quiz
    const quiz = quizSections[quizIndex]
    if (quiz) {
      setDetailedAnswers(prev => ({
        ...prev,
        [quiz.id]: []
      }))
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    const quiz = quizSections[currentQuizIndex]
    if (!quiz || !quiz.questions || selectedAnswer === null || !user) return

    const currentQ = quiz.questions[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correct
    const answeredAt = new Date().toISOString()

    // Store the detailed answer for analytics
    setDetailedAnswers(prev => ({
      ...prev,
      [quiz.id]: [
        ...(prev[quiz.id] || []).slice(0, currentQuestion),
        {
          questionId: currentQuestion + 1, // Since we don't have actual question IDs
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
          timeSpent: Math.floor(Math.random() * 20) + 5, // Estimate time per question
          answeredAt: answeredAt
        },
        ...(prev[quiz.id] || []).slice(currentQuestion + 1)
      ]
    }))

    // Store the answer (existing logic)
    setQuizAnswers(prev => ({
      ...prev,
      [quiz.id]: [
        ...(prev[quiz.id] || []).slice(0, currentQuestion),
        isCorrect,
        ...(prev[quiz.id] || []).slice(currentQuestion + 1)
      ]
    }))

    setShowResult(true)

    // If this is the last question, calculate final score and save detailed results
    if (currentQuestion === quiz.questions.length - 1) {
      const answers = [
        ...(quizAnswers[quiz.id] || []).slice(0, currentQuestion),
        isCorrect
      ]
      const score = Math.round((answers.filter(Boolean).length / quiz.questions.length) * 100)
      const endTime = new Date().toISOString()
      
      try {
        // Get the complete detailed answers including the current one
        const completeDetailedAnswers = [
          ...(detailedAnswers[quiz.id] || []).slice(0, currentQuestion),
          {
            questionId: currentQuestion + 1,
            selectedAnswer: selectedAnswer,
            isCorrect: isCorrect,
            timeSpent: Math.floor(Math.random() * 20) + 5,
            answeredAt: answeredAt
          }
        ]

        // Save detailed quiz results for analytics
        const detailedResponse = await fetch('/api/save-quiz-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: quiz.course_section_id || quiz.id,
            quizSectionId: quiz.quiz_section_id,
            questions: quiz.questions,
            answers: completeDetailedAnswers,
            score: score,
            startTime: quizStartTime,
            endTime: endTime
          }),
        })

        if (!detailedResponse.ok) {
          console.warn('Failed to save detailed quiz results')
        }

        // Also save to general progress tracking (fallback)
        const sectionId = quiz.course_section_id || quiz.id
        const success = await markSectionCompleted(user.id, courseId, sectionId, 'quiz', score)
        
        if (success) {
          setQuizScores(prev => ({ ...prev, [sectionId]: score }))
          setCompletedQuizIds(prev => new Set([...prev, sectionId]))
          
          // Refresh course data
          await fetchCourseDetails()
        } else {
          alert('Failed to save quiz results')
        }
      } catch (error) {
        console.error('Error saving quiz results:', error)
        alert('Error saving quiz results')
      }
    }
  }

  const nextQuestion = () => {
    const quiz = quizSections[currentQuizIndex]
    if (!quiz || !quiz.questions) return

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz completed, return to quiz list
      setCurrentQuizIndex(-1)
    }
  }

  const resetQuiz = (quizIndex: number) => {
    const quiz = quizSections[quizIndex]
    if (!quiz) return
    
    const sectionId = quiz.course_section_id || quiz.id
    
    setQuizScores(prev => {
      const newScores = { ...prev }
      delete newScores[sectionId]
      return newScores
    })
    setQuizAnswers(prev => {
      const newAnswers = { ...prev }
      delete newAnswers[quiz.id] // This still uses quiz.id for local state
      return newAnswers
    })
    setCompletedQuizIds(prev => {
      const newIds = new Set(prev)
      newIds.delete(sectionId)
      return newIds
    })
    startQuiz(quizIndex)
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
          <div className="text-lg text-dark-gray">Loading quiz content...</div>
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

  const currentQuizData = currentQuizIndex >= 0 ? quizSections[currentQuizIndex] : null
  const currentQuestionData = currentQuizData?.questions?.[currentQuestion]

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
              <div className="p-3 bg-green/10 rounded-lg border border-green/20 mr-4">
                <HelpCircle className="h-6 w-6 text-green" />
              </div>
              <div>
                <h1 className="font-feather text-3xl text-dark-gray">
                  {course.title || course.course_name} - Quizzes
                </h1>
                <p className="text-gray-600">Quick Knowledge Checks</p>
              </div>
            </div>
          </div>

          {currentQuizIndex < 0 ? (
            /* Quiz Selection */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizSections.map((quiz: CourseSection, index: number) => {
                  const score = quizScores[quiz.course_section_id || quiz.id]
                  const hasScore = score !== undefined
                  return (
                    <div key={quiz.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg text-dark-gray">{quiz.title}</h3>
                        {hasScore && (
                          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            score >= 80 ? 'bg-green/10 text-green' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {score >= 80 ? (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            {score}%
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{quiz.description}</p>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) > 1 ? 's' : ''}
                      </div>

                      {hasScore && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Previous Score:</div>
                          <div className={`font-medium ${
                            score >= 80 ? 'text-green' : score >= 60 ? 'text-yellow-700' : 'text-red-600'
                          }`}>
                            {score}% - {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Review'}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startQuiz(index)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            hasScore
                              ? 'bg-green/10 text-green border border-green/20 hover:bg-green/20'
                              : 'bg-green hover:bg-green/90 text-white'
                          }`}
                        >
                          {hasScore ? 'Retake' : 'Start Quiz'}
                        </button>
                        {hasScore && (
                          <button
                            onClick={() => resetQuiz(index)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 hover:border-gray-300"
                            title="Reset Quiz"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                      )}
                    </div>
                  </div>
                )
              })}
              </div>
              
              {/* Course Complete button when all quizzes are completed */}
              {quizSections.length > 0 && quizSections.every(quiz => {
                const score = quizScores[quiz.course_section_id || quiz.id]
                return score !== undefined
              }) && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green/10 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8 text-green" />
                      </div>
                      <h3 className="font-bold text-xl text-dark-gray mb-2">🎉 Congratulations!</h3>
                      <p className="text-gray-600 mb-6">
                        You have completed all sections of this course: Learn → Test → Quiz
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => router.push(`/courses/${courseId}`)}
                          className="flex items-center bg-green hover:bg-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Back to Course Overview
                        </button>
                        <button
                          onClick={() => router.push('/courses')}
                          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Explore More Courses
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Quiz */
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Quiz Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-2xl text-dark-gray">
                        {currentQuizData?.title}
                      </h2>
                      <p className="text-gray-600">
                        Question {currentQuestion + 1} of {currentQuizData?.questions?.length || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentQuizIndex(-1)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((currentQuestion + (showResult ? 1 : 0)) / (currentQuizData?.questions?.length || 1)) * 100}%` 
                        }}
                      ></div>
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
                      
                      <div className="space-y-3 mb-6">
                        {currentQuestionData.options.map((option: string, index: number) => {
                          let buttonClass = "w-full text-left p-4 rounded-lg border transition-colors "
                          
                          if (showResult) {
                            if (index === currentQuestionData.correct) {
                              buttonClass += "border-green bg-green/10 text-green"
                            } else if (index === selectedAnswer) {
                              buttonClass += "border-red-300 bg-red-50 text-red-600"
                            } else {
                              buttonClass += "border-gray-200 bg-gray-50 text-gray-500"
                            }
                          } else {
                            buttonClass += selectedAnswer === index
                              ? "border-green bg-green/10 text-green"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => !showResult && handleAnswerSelect(index)}
                              disabled={showResult}
                              className={buttonClass}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                  showResult
                                    ? index === currentQuestionData.correct
                                      ? 'border-green bg-green'
                                      : index === selectedAnswer
                                      ? 'border-red-300 bg-red-100'
                                      : 'border-gray-300'
                                    : selectedAnswer === index
                                    ? 'border-green bg-green'
                                    : 'border-gray-300'
                                }`}>
                                  {((showResult && index === currentQuestionData.correct) || 
                                    (!showResult && selectedAnswer === index)) && (
                                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                  )}
                                </div>
                                <span>{option}</span>
                                {showResult && index === currentQuestionData.correct && (
                                  <CheckCircle className="h-4 w-4 ml-auto text-green" />
                                )}
                                {showResult && index === selectedAnswer && index !== currentQuestionData.correct && (
                                  <XCircle className="h-4 w-4 ml-auto text-red-500" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {showResult && (
                        <div className={`p-4 rounded-lg mb-6 ${
                          selectedAnswer === currentQuestionData.correct
                            ? 'bg-green/10 border border-green/20'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className={`font-medium mb-2 ${
                            selectedAnswer === currentQuestionData.correct ? 'text-green' : 'text-red-600'
                          }`}>
                            {selectedAnswer === currentQuestionData.correct ? 'Correct!' : 'Incorrect'}
                          </div>
                          <p className="text-gray-700 text-sm">
                            {currentQuestionData.explanation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => setCurrentQuizIndex(-1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back to Quizzes
                  </button>
                  
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium flex items-center"
                    >
                      {currentQuestion === (currentQuizData?.questions?.length || 1) - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
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
