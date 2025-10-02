'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import CourseCard from '@/components/CourseCard'
import { useAuth } from '@/common/AuthContext'
import { getCoursesForUser, enrollInCourse, Course } from '@/common/courses'

const CoursesPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'enrolled' | 'available'>('all')
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to home
      router.push('/')
    }
  }, [user, isLoading, router])

  // Fetch courses when user is available
  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        try {
          setLoading(true)
          const coursesData = await getCoursesForUser(user.id, searchQuery)
          setCourses(coursesData)
          setFilteredCourses(coursesData)
        } catch (error) {
          console.error('Error fetching courses:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchCourses()
  }, [user, searchQuery])

  // Filter courses based on active filter
  useEffect(() => {
    if (courses.length > 0) {
      let filtered = [...courses]
      
      switch (activeFilter) {
        case 'enrolled':
          filtered = courses.filter(course => course.is_enrolled)
          break
        case 'available':
          filtered = courses.filter(course => !course.is_enrolled)
          break
        default:
          filtered = courses
      }
      
      setFilteredCourses(filtered)
    }
  }, [courses, activeFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleEnroll = async (courseId: string) => {
    if (!user) return
    
    setEnrollingCourseId(courseId)
    
    try {
      const success = await enrollInCourse(user.id, courseId)
      if (success) {
        // Refresh courses to show updated enrollment status
        const coursesData = await getCoursesForUser(user.id, searchQuery)
        setCourses(coursesData)
        setFilteredCourses(coursesData)
      } else {
        alert('Failed to enroll in course. Please try again.')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('An error occurred while enrolling. Please try again.')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  const handleContinue = (courseId: string) => {
    // For now, just show an alert. This could navigate to course content later
    alert(`Continuing course: ${courseId}`)
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white">
          <div className="text-lg text-dark-gray">Loading...</div>
        </main>
      </>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  const getFilterStats = () => {
    const enrolled = courses.filter(c => c.is_enrolled).length
    const available = courses.filter(c => !c.is_enrolled).length
    return { enrolled, available, total: courses.length }
  }

  const stats = getFilterStats()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Course Gallery
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore and manage your learning journey
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} placeholder="Search courses..." />
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeFilter === 'all'
                      ? 'bg-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-green hover:bg-green/5'
                  }`}
                >
                  All Courses ({stats.total})
                </button>
                <button
                  onClick={() => setActiveFilter('enrolled')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeFilter === 'enrolled'
                      ? 'bg-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-green hover:bg-green/5'
                  }`}
                >
                  My Courses ({stats.enrolled})
                </button>
                <button
                  onClick={() => setActiveFilter('available')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeFilter === 'available'
                      ? 'bg-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-green hover:bg-green/5'
                  }`}
                >
                  Available ({stats.available})
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">Loading courses...</div>
            </div>
          ) : (
            <>
              {/* Course Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={handleEnroll}
                      onContinue={handleContinue}
                      isEnrolling={enrollingCourseId === course.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    {searchQuery 
                      ? `No courses found matching "${searchQuery}"`
                      : activeFilter === 'enrolled'
                      ? "You haven't enrolled in any courses yet"
                      : activeFilter === 'available'
                      ? "No available courses at the moment"
                      : "No courses available"
                    }
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-green hover:text-green/80 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default CoursesPage;
