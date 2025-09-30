'use client'
import React from 'react'
import { Course } from '@/common/courses'

interface CourseCardProps {
  course: Course
  onEnroll?: (courseId: string) => void
  onContinue?: (courseId: string) => void
  isEnrolling?: boolean
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEnroll, 
  onContinue, 
  isEnrolling = false 
}) => {
  const handleAction = () => {
    if (course.is_enrolled && onContinue) {
      onContinue(course.id)
    } else if (!course.is_enrolled && onEnroll) {
      onEnroll(course.id)
    }
  }

  const getButtonColor = () => {
    if (course.is_enrolled) {
      return 'bg-green hover:bg-green/90'
    }
    return 'bg-blue-500 hover:bg-blue-600'
  }

  const getButtonText = () => {
    if (isEnrolling) return 'Enrolling...'
    if (course.is_enrolled) return 'Continue'
    return 'Enroll'
  }

  const getProgressColor = () => {
    const progress = course.progress || 0
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-green/30 transition-all duration-200 group">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          {/* Course Status Badge */}
          {course.is_enrolled && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green/10 text-green mb-3">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Enrolled
            </div>
          )}
          
          <h3 className="font-bold text-lg text-dark-gray mb-3 line-clamp-2 group-hover:text-green transition-colors">
            {course.course_name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
            {course.description || 'No description available'}
          </p>
        </div>
        
        <div className="mt-auto">
          {course.is_enrolled && course.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-700">
                  {course.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleAction}
            disabled={isEnrolling}
            className={`w-full text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${getButtonColor()}`}
          >
            {isEnrolling && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
