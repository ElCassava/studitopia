'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { getCourseById, Course, getUserCourseProgress, markSectionCompleted, CourseSection } from '@/common/courses'
import { getSupabaseClient } from '@/common/network'
import { getLearningStyleById, LearningStyle, hasLearningStyle, getCurrentUrl } from '@/utils/learningStyles'
import LearningStyleRequiredModal from '@/components/LearningStyleRequiredModal'
import { ArrowLeft, BookOpen, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [learnSections, setLearnSections] = useState<CourseSection[]>([])
  const [completedSectionIds, setCompletedSectionIds] = useState<Set<string>>(new Set())
  const [userLearningStyle, setUserLearningStyle] = useState<LearningStyle | null>(null)
  const [showLearningStyleModal, setShowLearningStyleModal] = useState(false)
  
  // Learning analytics tracking
  const [sectionStartTime, setSectionStartTime] = useState<string | null>(null)
  const [interactions, setInteractions] = useState<any[]>([])
  const [timeSpentOnSection, setTimeSpentOnSection] = useState(0)

  // Remove dummy content templates - using real data from database

  const fetchLearnSections = useCallback(async (forceRefresh = false) => {
    try {
      // Prevent refetching if sections are already loaded unless forced
      if (learnSections.length > 0 && !forceRefresh) {
        console.log('📚 Learn sections already loaded, skipping fetch')
        return
      }
      
      const supabase = getSupabaseClient()
      
      // Get user's learning style from auth context
      const userLearningStyleId = user?.learning_style_id
      console.log('User learning style ID:', userLearningStyleId)
      
      if (!userLearningStyleId) {
        console.warn('⚠️ User has no learning style set - showing all available learning sections')
      } else {
        console.log('✅ Filtering learn sections by user learning style:', userLearningStyleId)
      }
      
      // Get course sections with learn_sections and learn_contents
      let query = supabase
        .from('course_sections')
        .select(`
          id,
          course_id,
          section_type,
          learn_sections (
            id,
            style_id,
            learn_contents (
              id,
              description,
              image_url
            )
          )
        `)
        .eq('course_id', courseId)
        .eq('section_type', 'learn')
      
      const { data: courseSections, error: sectionsError } = await query
      
      if (sectionsError) {
        console.error('Error fetching learn sections:', sectionsError)
        return
      }
      
      // Transform the data to match our component expectations
      // Filter learn_sections by user's learning style preference
      const enhancedSections: any[] = []
      let sectionIndex = 0
      
      courseSections.forEach((courseSection: any) => {
        const learnSections = courseSection.learn_sections || []
        
        // Filter learn sections by user's learning style if available
        const filteredLearnSections = userLearningStyleId 
          ? learnSections.filter((ls: any) => ls.style_id === userLearningStyleId)
          : learnSections
        
        console.log(`Course section ${courseSection.id}: ${learnSections.length} total, ${filteredLearnSections.length} matching user's learning style`)
        
        if (userLearningStyleId && learnSections.length > 0 && filteredLearnSections.length === 0) {
          console.warn(`⚠️ No learn sections match user's learning style ${userLearningStyleId} for course section ${courseSection.id}`)
          console.log('Available style IDs in this section:', learnSections.map((ls: any) => ls.style_id))
        }
        
        if (filteredLearnSections.length === 0) {
          // If no matching sections for user's learning style, show first available section as fallback
          if (learnSections.length > 0) {
            console.log(`⚠️ No sections match user's learning style, using fallback content`)
            const fallbackSection = learnSections[0]
            const content = fallbackSection.learn_contents?.[0]
            
            enhancedSections.push({
              id: `${courseSection.id}-${fallbackSection.id}`,
              course_section_id: courseSection.id,
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Section ${sectionIndex + 1}`,
              content: content?.description || 'Learning content is available but not optimized for your learning style.',
              image_url: content?.image_url || null,
              estimatedTime: "15 min",
              learn_section_id: fallbackSection.id,
              style_id: fallbackSection.style_id
            })
            sectionIndex++
          } else {
            console.log(`⏭️  Skipping course section ${courseSection.id} - no learn sections available`)
          }
        } else {
          // Create a section for each matching learn_section
          filteredLearnSections.forEach((learnSection: any) => {
            const content = learnSection.learn_contents?.[0]
            
            enhancedSections.push({
              id: `${courseSection.id}-${learnSection.id}`, // Unique ID combining both
              course_section_id: courseSection.id, // Store original course section ID
              course_id: courseSection.course_id,
              section_type: courseSection.section_type,
              displayIndex: sectionIndex + 1,
              title: `Section ${sectionIndex + 1}`,
              content: content?.description || 'No content available for this section.',
              image_url: content?.image_url || null,
              estimatedTime: "15 min",
              learn_section_id: learnSection.id,
              style_id: learnSection.style_id
            })
            sectionIndex++
          })
        }
      })
      
      // Remove duplicates based on ID
      const uniqueSections = enhancedSections.filter((section, index, self) => 
        index === self.findIndex(s => s.id === section.id)
      )
      
      console.log(`📚 Created ${uniqueSections.length} unique learn sections for course ${courseId}`)
      console.log('Section details:', uniqueSections.map(s => ({ 
        title: s.title, 
        hasContent: !!s.content, 
        styleId: s.style_id,
        learnSectionId: s.learn_section_id 
      })))
      
      setLearnSections(uniqueSections)
      
      // If no content sections found, show appropriate message
      if (uniqueSections.length === 0) {
        console.log('⚠️ No learn content found for this course. Course may need content setup.')
      }
      
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
            .filter(p => p.completed && p.section_type === 'learn')
            .map(p => p.course_section_id)
        )
        setCompletedSectionIds(completedIds)
        
        // Set current section to first incomplete or first section
        // Note: progress is tracked by course_section_id, not the composite ID
        const firstIncompleteIndex = enhancedSections.findIndex((section: any) => 
          !completedIds.has(section.course_section_id || section.id)
        )
        setCurrentSection(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0)
      }
      
    } catch (error) {
      console.error('Error fetching learn sections:', error)
      // Set empty array to prevent infinite loop
      if (learnSections.length === 0) {
        setLearnSections([])
      }
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
      
      // Fetch learn sections and user progress (force refresh on initial load)
      await fetchLearnSections(true)
      
    } catch (err) {
      console.error('Error fetching course details:', err)
      setError('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }, [courseId, user, router, fetchLearnSections])

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

  const handleSectionComplete = async () => {
    if (!user || !learnSections[currentSection]) return
    
    try {
      const sectionToComplete = learnSections[currentSection]
      
      // Add completion interaction
      trackInteraction('complete', `section-${currentSection}`, { 
        completed: true,
        totalTimeSpent: timeSpentOnSection 
      })
      
      // Save detailed learn interactions for analytics
      await saveLearnInteractions(sectionToComplete, 100)
      
      // Use course_section_id for progress tracking (that's what's stored in the database)
      const sectionId = sectionToComplete.course_section_id || sectionToComplete.id
      const success = await markSectionCompleted(user.id, courseId, sectionId, 'learn')
      
      if (success) {
        // Update local state using the course_section_id
        setCompletedSectionIds(prev => new Set([...prev, sectionId]))
        
        // Don't refetch everything - just update local state
        console.log(`✅ Section ${sectionId} marked as completed`)
        
        // Auto-advance to next section
        if (currentSection < learnSections.length - 1) {
          setCurrentSection(currentSection + 1)
        }
      } else {
        alert('Failed to mark section as completed')
      }
    } catch (error) {
      console.error('Error completing section:', error)
      alert('Error completing section')
    }
  }

  // Track section start time when changing sections
  useEffect(() => {
    if (learnSections.length > 0) {
      setSectionStartTime(new Date().toISOString())
      setInteractions([])
      setTimeSpentOnSection(0)
      
      // Track section view interaction
      const viewInteraction = {
        contentId: `section-${currentSection}`,
        type: 'view',
        timeSpent: 0,
        engagementScore: 50,
        timestamp: new Date().toISOString(),
        data: { sectionIndex: currentSection, sectionId: learnSections[currentSection]?.id }
      }
      setInteractions([viewInteraction])
    }
  }, [currentSection, learnSections])

  // Track time spent on current section
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sectionStartTime && learnSections.length > 0) {
      interval = setInterval(() => {
        setTimeSpentOnSection(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sectionStartTime, learnSections])

  const trackInteraction = (type: string, contentId: string, data?: any) => {
    const interaction = {
      contentId,
      type,
      timeSpent: Math.floor(Math.random() * 10) + 1, // Estimate interaction time
      engagementScore: type === 'scroll' ? 60 : type === 'click' ? 80 : 50,
      timestamp: new Date().toISOString(),
      data
    }
    setInteractions(prev => [...prev, interaction])
  }

  const saveLearnInteractions = async (sectionToComplete: any, completionPercentage: number = 100) => {
    if (!user || !sectionStartTime) return

    const endTime = new Date().toISOString()
    const startTime = sectionStartTime

    try {
      const response = await fetch('/api/save-learn-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId,
          learnSectionId: sectionToComplete.learn_section_id || sectionToComplete.id,
          contentItems: [
            {
              id: `section-${currentSection}`,
              type: 'text',
              title: sectionToComplete.title,
              description: sectionToComplete.description
            }
          ],
          interactions: interactions,
          totalTimeSpent: timeSpentOnSection,
          completionPercentage: completionPercentage,
          startTime: startTime,
          endTime: endTime
        }),
      })

      if (!response.ok) {
        console.warn('Failed to save learn interactions')
      } else {
        console.log('✅ Learn interactions saved successfully')
      }
    } catch (error) {
      console.error('Error saving learn interactions:', error)
    }
  }

  const goToNextSection = () => {
    if (currentSection < learnSections.length - 1) {
      // Save interactions before moving to next section (but don't await to avoid blocking)
      if (learnSections[currentSection]) {
        saveLearnInteractions(learnSections[currentSection], 100).catch(console.error)
      }
      setCurrentSection(currentSection + 1)
    }
  }

  const goToPrevSection = () => {
    if (currentSection > 0) {
      // Save interactions before moving to previous section (but don't await to avoid blocking)
      if (learnSections[currentSection]) {
        saveLearnInteractions(learnSections[currentSection], 50).catch(console.error) // Partial completion
      }
      setCurrentSection(currentSection - 1)
    }
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
          <div className="text-lg text-dark-gray">Loading course content...</div>
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

  const currentSectionData = learnSections[currentSection]
  const isCurrentSectionCompleted = currentSectionData ? completedSectionIds.has(currentSectionData.course_section_id || currentSectionData.id) : false
  const progressPercentage = learnSections.length > 0 ? (completedSectionIds.size / learnSections.length) * 100 : 0

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
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="font-feather text-3xl text-dark-gray">
                  {course.title || course.course_name} - Learn
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">Interactive Learning Module</p>
                  {userLearningStyle && (
                    <span className="text-xs bg-green/10 text-green px-2 py-1 rounded-full">
                      {userLearningStyle.name} Learning Style
                    </span>
                  )}
                  {user?.learning_style_id && !userLearningStyle && (
                    <span className="text-xs bg-blue/10 text-blue-600 px-2 py-1 rounded-full">
                      Personalized Content
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Learning Progress</span>
                <span>{completedSectionIds.size} of {learnSections.length} sections completed</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Section {currentSection + 1} of {learnSections.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={goToPrevSection}
                  disabled={currentSection === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goToNextSection}
                  disabled={currentSection === learnSections.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {learnSections.length === 0 ? (
              /* No Content State */
              <div className="lg:col-span-4">
                <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-xl text-dark-gray mb-4">No Learning Content Available</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This course doesn't have any learning content set up yet. Please contact your instructor or check back later.
                  </p>
                  <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Back to Course Overview
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Section List Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg text-dark-gray mb-4">Sections</h3>
                    <div className="space-y-2">
                      {learnSections.map((section: CourseSection, index: number) => (
                        <button
                          key={section.id}
                          onClick={() => setCurrentSection(index)}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                            currentSection === index
                              ? 'bg-blue-50 border border-blue-200 text-blue-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{section.title}</div>
                            <div className="text-xs text-gray-500">{section.estimatedTime}</div>
                          </div>
                          {completedSectionIds.has(section.course_section_id || section.id) && (
                            <CheckCircle className="h-4 w-4 text-green ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                {currentSectionData && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <h2 className="font-bold text-2xl text-dark-gray">
                          {currentSectionData.title}
                        </h2>
                        {isCurrentSectionCompleted && (
                          <CheckCircle className="h-6 w-6 text-green ml-3" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {currentSectionData.estimatedTime}
                      </div>
                    </div>

                    <div 
                      className="prose max-w-none mb-8"
                      onScroll={() => trackInteraction('scroll', `content-${currentSection}`, { scrollPosition: window.scrollY })}
                      onClick={() => trackInteraction('click', `content-${currentSection}`)}
                    >
                      <p 
                        className="text-gray-700 text-lg leading-relaxed cursor-pointer"
                        onClick={() => trackInteraction('click', `text-content-${currentSection}`, { textLength: currentSectionData.content?.length })}
                      >
                        {currentSectionData.content}
                      </p>
                      
                      {/* Placeholder for rich content */}
                      <div 
                        className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => trackInteraction('click', `interactive-content-${currentSection}`, { contentType: 'interactive' })}
                      >
                        <h4 className="font-semibold text-dark-gray mb-3">Interactive Content</h4>
                        <p className="text-gray-600 mb-4">
                          This is where interactive learning materials would be displayed, such as:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          <li 
                            className="hover:text-dark-gray cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              trackInteraction('click', `video-item-${currentSection}`, { itemType: 'video' })
                            }}
                          >
                            Video lectures and tutorials
                          </li>
                          <li 
                            className="hover:text-dark-gray cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              trackInteraction('click', `diagram-item-${currentSection}`, { itemType: 'diagram' })
                            }}
                          >
                            Interactive diagrams and visualizations
                          </li>
                          <li 
                            className="hover:text-dark-gray cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              trackInteraction('click', `code-item-${currentSection}`, { itemType: 'code' })
                            }}
                          >
                            Code examples and demos
                          </li>
                          <li 
                            className="hover:text-dark-gray cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              trackInteraction('click', `resource-item-${currentSection}`, { itemType: 'resource' })
                            }}
                          >
                            Downloadable resources and materials
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={goToPrevSection}
                        disabled={currentSection === 0}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous Section
                      </button>

                      <div className="flex space-x-3">
                        {!isCurrentSectionCompleted && (
                          <button
                            onClick={handleSectionComplete}
                            className="bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                        
                        {/* Show "Continue to Test" when all sections are completed */}
                        {completedSectionIds.size === learnSections.length && learnSections.length > 0 ? (
                          <button
                            onClick={() => router.push(`/courses/${courseId}/test`)}
                            className="flex items-center bg-green hover:bg-green/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Continue to Test
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        ) : (
                          <button
                            onClick={goToNextSection}
                            disabled={currentSection === learnSections.length - 1}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next Section
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
              </>
            )}
          </div>
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
