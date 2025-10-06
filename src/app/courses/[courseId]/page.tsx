'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { getCourseById, enrollInCourse, unenrollFromCourse, Course, resetCourseProgress } from '@/common/courses'
import { ArrowLeft, BookOpen, FileText, HelpCircle, Clock, Users, Star } from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const courseData = await getCourseById(courseId, user?.id)
      
      if (!courseData) {
        setError('Course not found')
        return
      }
      
      setCourse(courseData)
    } catch (err) {
      console.error('Error fetching course details:', err)
      setError('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }
    
    if (user && courseId) {
      fetchCourseDetails()
    }
  }, [user, isLoading, courseId, router, fetchCourseDetails])

  const handleEnrollment = async () => {
    if (!user || !course) return

    setEnrolling(true)
    
    try {
      let success = false
      
      if (course.is_enrolled) {
        // Navigate to the appropriate content based on progress
        await navigateToNextContent()
        return
      } else {
        // Enroll
        success = await enrollInCourse(user.id, courseId)
      }
      
      if (success) {
        // Refresh course data to show updated enrollment status
        await fetchCourseDetails()
      } else {
        setError('Failed to enroll in course')
      }
    } catch (err) {
      console.error('Enrollment error:', err)
      setError('Error enrolling in course')
    } finally {
      setEnrolling(false)
    }
  }

  const navigateToNextContent = async () => {
    if (!user || !course) return

    try {
      // Get available sections to determine where to navigate
      const { getNextAvailableSections } = await import('@/common/courses')
      const availableSections = await getNextAvailableSections(user.id, courseId)
      
      if (!availableSections) {
        // If no available sections data, default to learn page
        router.push(`/courses/${courseId}/learn`)
        return
      }

      // Priority: Learn first, then Test, then Quiz (Learn → Test → Quiz flow)
      if (availableSections.learn.length > 0) {
        router.push(`/courses/${courseId}/learn`)
      } else if (availableSections.test.length > 0) {
        router.push(`/courses/${courseId}/test`)
      } else if (availableSections.quiz.length > 0) {
        router.push(`/courses/${courseId}/quiz`)
      } else {
        // All sections completed, still go to learn to review
        router.push(`/courses/${courseId}/learn`)
      }
    } catch (error) {
      console.error('Error determining next content:', error)
      // Default to learn page if there's an error
      router.push(`/courses/${courseId}/learn`)
    }
  }

  const handleUnenrollment = async () => {
    if (!user || !course) return

    setEnrolling(true)
    
    try {
      const success = await unenrollFromCourse(user.id, courseId)
      
      if (success) {
        // Refresh course data to show updated enrollment status
        await fetchCourseDetails()
      } else {
        setError('Failed to unenroll from course')
      }
    } catch (err) {
      console.error('Unenrollment error:', err)
      setError('Error unenrolling from course')
    } finally {
      setEnrolling(false)
    }
  }

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
          <div className="text-lg text-dark-gray">Loading course details...</div>
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green/10 text-green border border-green/20'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getSectionCount = (type: 'learn' | 'test' | 'quiz'): number => {
    const defaultCounts = { learn: 8, test: 2, quiz: 5 }
    return course?.sections?.[type] ?? defaultCounts[type]
  }

  // Demo function to simulate completing a section
  const handleSectionComplete = async (sectionType: 'learn' | 'test' | 'quiz') => {
    if (!user || !course) return

    try {
      console.log(`Marking ${sectionType} section as completed...`)
      
      // First, ensure course sections exist and get available ones
      const { ensureCourseSectionsExist, getNextAvailableSections, markSectionCompleted } = await import('@/common/courses')
      
      // Ensure sections exist for this course
      await ensureCourseSectionsExist(courseId)
      
      // Get available sections for this course and type
      const availableSections = await getNextAvailableSections(user.id, courseId)
      
      if (!availableSections || availableSections[sectionType].length === 0) {
        alert(`No more ${sectionType} sections available to complete`)
        return
      }
      
      // Get the first available section of this type
      const sectionToComplete = availableSections[sectionType][0]
      const score = sectionType === 'test' || sectionType === 'quiz' ? Math.floor(Math.random() * 40) + 60 : undefined
      
      const success = await markSectionCompleted(user.id, courseId, sectionToComplete.id, sectionType, score)
      
      if (success) {
        // Refresh course data to show updated progress
        await fetchCourseDetails()
        alert(`${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} section completed! ${score ? `Score: ${score}%` : ''}`)
      } else {
        alert('Failed to update progress')
      }
    } catch (error) {
      console.error('Error completing section:', error)
      alert('Error updating progress')
    }
  }

  // Demo function to reset progress
  const handleResetProgress = async () => {
    if (!user || !course) return

    try {
      console.log('Resetting course progress...')
      const success = await resetCourseProgress(user.id, courseId)
      
      if (success) {
        // Refresh course data to show updated progress
        await fetchCourseDetails()
        alert('Progress reset successfully!')
      } else {
        alert('Failed to reset progress')
      }
    } catch (error) {
      console.error('Error resetting progress:', error)
      alert('Error resetting progress')
    }
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
        <div className="max-w-6xl mx-auto px-6 w-full">
          {/* Back Navigation */}
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center text-green hover:text-green/90 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Courses</span>
          </button>

          {/* Course Header */}
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              {course.title || course.course_name}
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
              {course.description}
            </p>
            
            {/* Course Meta */}
            <div className="flex items-center justify-center space-x-8 text-gray-600 mb-6 flex-wrap gap-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{(course.students || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{course.duration || '8 weeks'}</span>
              </div>
              <div className="flex items-center">
                {renderStars(course.rating || 4.0)}
                <span className="ml-2 font-medium">{course.rating || 4.0}</span>
              </div>
            </div>

            {/* Instructor & Level */}
            <div className="flex items-center justify-center space-x-6 flex-wrap gap-4">
              <div>
                <span className="text-sm text-gray-500">Instructor: </span>
                <span className="font-semibold text-dark-gray">{course.instructor || 'Instructor'}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level || 'Beginner')}`}>
                {course.level || 'Beginner'}
              </span>
            </div>
          </div>

          {/* Course Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-dark-gray">Learn Sections</h3>
                  <p className="text-2xl font-bold text-blue-600">{getSectionCount('learn')}</p>
                  <p className="text-sm text-gray-500">Interactive lessons</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-dark-gray">Test Sections</h3>
                  <p className="text-2xl font-bold text-orange-600">{getSectionCount('test')}</p>
                  <p className="text-sm text-gray-500">Assessments</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green/10 rounded-lg border border-green/20">
                  <HelpCircle className="h-6 w-6 text-green" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-dark-gray">Quiz Sections</h3>
                  <p className="text-2xl font-bold text-green">{getSectionCount('quiz')}</p>
                  <p className="text-sm text-gray-500">Quick checks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-dark-gray mb-4">
              {course.is_enrolled ? 'Continue Learning' : 'Get Started'}
            </h2>
            <p className="text-gray-600 mb-6">
              {course.is_enrolled 
                ? `You're enrolled in this course! Continue your learning journey and track your progress.`
                : 'Ready to begin your learning journey? Enroll in this course to access all content and track your progress.'
              }
            </p>
            
            {/* Progress Bar for Enrolled Courses */}
            {course.is_enrolled && course.progress !== undefined && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleEnrollment}
                disabled={enrolling}
                className={`font-medium py-3 px-6 rounded-lg transition-colors ${
                  course.is_enrolled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green hover:bg-green/90 text-white'
                } ${enrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {enrolling ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {course.is_enrolled ? 'Unenrolling...' : 'Enrolling...'}
                  </div>
                ) : (
                  course.is_enrolled ? 'Continue Course' : 'Enroll in Course'
                )}
              </button>
              
              {course.is_enrolled && (
                <button 
                  onClick={handleUnenrollment}
                  disabled={enrolling}
                  className="border border-red-300 hover:bg-red-50 text-red-600 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Unenroll
                </button>
              )}
            </div>
          </div>

          {/* Course Navigation - Only show for enrolled users */}
          {course.is_enrolled && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Course Content</h2>
              <p className="text-gray-600 mb-6">
                Access different types of learning materials and assessments for this course.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push(`/courses/${courseId}/learn`)}
                  className="p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="font-bold text-lg text-dark-gray group-hover:text-blue-700">Learn</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Interactive lessons and tutorials to build your knowledge
                  </p>
                  <div className="text-blue-600 font-medium text-sm">
                    {getSectionCount('learn')} sections available
                  </div>
                </button>

                <button 
                  onClick={() => router.push(`/courses/${courseId}/test`)}
                  className="p-6 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-orange-600 mr-3" />
                    <h3 className="font-bold text-lg text-dark-gray group-hover:text-orange-700">Tests</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Comprehensive assessments to evaluate your understanding
                  </p>
                  <div className="text-orange-600 font-medium text-sm">
                    {getSectionCount('test')} tests available
                  </div>
                </button>

                <button 
                  onClick={() => router.push(`/courses/${courseId}/quiz`)}
                  className="p-6 bg-green/10 hover:bg-green/20 border border-green/20 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center mb-3">
                    <HelpCircle className="h-6 w-6 text-green mr-3" />
                    <h3 className="font-bold text-lg text-dark-gray group-hover:text-green">Quizzes</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Quick knowledge checks to reinforce your learning
                  </p>
                  <div className="text-green font-medium text-sm">
                    {getSectionCount('quiz')} quizzes available
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Course Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Course Details</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-dark-gray mb-3">What you&apos;ll learn:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Core concepts and fundamentals</li>
                  <li>Hands-on practical exercises</li>
                  <li>Real-world project applications</li>
                  <li>Best practices and industry standards</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-dark-gray mb-3">Course Structure:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="font-medium">Learn Sections:</span>
                    <span className="font-bold text-blue-600">{getSectionCount('learn')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="font-medium">Test Sections:</span>
                    <span className="font-bold text-orange-600">{getSectionCount('test')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green/10 rounded-lg border border-green/20">
                    <span className="font-medium">Quiz Sections:</span>
                    <span className="font-bold text-green">{getSectionCount('quiz')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Progress Controls (for testing) */}
          {course.is_enrolled && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 shadow-sm">
              <h2 className="text-xl font-bold text-dark-gray mb-4">🚧 Demo Progress Controls (Testing)</h2>
              <p className="text-sm text-gray-600 mb-4">
                These buttons simulate completing sections to test the progress tracking system.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSectionComplete('learn')}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                >
                  Complete Learn Section
                </button>
                <button
                  onClick={() => handleSectionComplete('test')}
                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm"
                >
                  Complete Test Section
                </button>
                <button
                  onClick={() => handleSectionComplete('quiz')}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                >
                  Complete Quiz Section
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}