'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  course_name: string
  description: string
  totalStudents: number
  avgProgress: number
  students: Array<{
    id: string
    username: string
    progress_percentage: number
    learning_style: string
  }>
}

interface CourseAnalytics {
  course: {
    id: string
    course_name: string
    description: string
  }
  statistics: {
    totalStudents: number
    avgProgress: number
    avgScore: number
    completionRate: number
    activeStudents: number
  }
  students: Array<{
    id: string
    username: string
    learning_style: string
    progress_percentage: number
    performance: {
      testsCompleted: number
      quizzesCompleted: number
      avgTestScore: number
      avgQuizScore: number
      overallAverage: number
      sectionsCompleted: number
      totalSections: number
    }
    recentActivity: {
      lastTestDate: string | null
      lastQuizDate: string | null
    }
  }>
}

interface StudentDetails {
  student: {
    id: string
    username: string
    email: string
    learning_style: string
    learning_style_description: string
  }
  enrollment: {
    progress_percentage: number
    enrolled_at: string
  } | null
  performance: {
    testsCompleted: number
    quizzesCompleted: number
    avgTestScore: number
    avgQuizScore: number
    overallAverage: number
    totalQuestionsAnswered: number
    correctAnswers: number
    incorrectAnswers: number
    accuracyRate: number
  }
  testAttempts: Array<{
    id: string
    start_time: string
    end_time: string
    score: number
    test_sections: {
      course_sections: {
        courses: {
          course_name: string
        }
      }
    }
    questions: Array<{
      id: string
      question_id: string
      selected_answer: string
      is_correct: boolean
      time_taken: number
      test_questions: {
        id: string
        question_text: string
        correct_answer: string
        choice_a: string
        choice_b: string
        choice_c: string
        choice_d: string
      }
    }>
  }>
  quizAttempts: Array<{
    id: string
    start_time: string | null
    end_time: string
    score: number
    quiz_sections: {
      course_sections: {
        courses: {
          course_name: string
        }
      }
    }
    questions: Array<{
      id: string
      question_id: string
      selected_answer: string
      is_correct: boolean
      time_taken: number
      answered_at: string
      quiz_questions: {
        id: string
        question_text: string
        correct_answer: string
        choice_a: string
        choice_b: string
        choice_c: string
        choice_d: string
      }
    }>
  }>
  sectionProgress: {
    sections: Array<{
      id: string
      type: string
      title: string
      completed: boolean
      completedAt: string | null
      score: number | null
      order?: number
      totalQuestions?: number
    }>
    completedSections: number
    totalSections: number
    completionPercentage: number
  }
}

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseAnalytics | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [studentLoading, setStudentLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to home
      router.push('/')
    } else if (!isLoading && user && user.role !== 'teacher') {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === 'student') {
        router.push('/student')
      } else if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [user, isLoading, router])

  // Fetch courses when component mounts
  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true)
      const response = await fetch('/api/teacher-courses')
      const data = await response.json()
      
      if (response.ok && data.courses) {
        setCourses(data.courses)
      } else {
        console.error('Error fetching courses:', data.error)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  const fetchCourseAnalytics = async (courseId: string) => {
    try {
      setAnalyticsLoading(true)
      const response = await fetch(`/api/course-analytics?courseId=${courseId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedCourse(data)
      } else {
        console.error('Error fetching course analytics:', data.error)
      }
    } catch (error) {
      console.error('Error fetching course analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleCourseClick = (courseId: string) => {
    fetchCourseAnalytics(courseId)
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setSelectedStudent(null)
  }

  const handleStudentClick = async (studentId: string) => {
    try {
      setStudentLoading(true)
      const courseId = selectedCourse?.course.id
      const response = await fetch(`/api/student-details?studentId=${studentId}&courseId=${courseId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedStudent(data)
      } else {
        console.error('Error fetching student details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
    } finally {
      setStudentLoading(false)
    }
  }

  const handleBackToStudents = () => {
    setSelectedStudent(null)
    setSelectedSection(null)
  }

  const handleSectionClick = (section: any) => {
    if (section.type === 'learn') {
      // For learn sections, show basic completion info
      setSelectedSection({
        ...section,
        details: {
          type: 'learn',
          message: section.completed ? 'This learning section has been completed.' : 'This learning section has not been started yet.',
          completedAt: section.completedAt,
          timeSpent: section.completedAt ? 'Varies by student' : 'N/A'
        }
      })
    } else if (section.type === 'test' || section.type === 'quiz') {
      // For test/quiz sections, find the corresponding attempt details
      const attempts = section.type === 'test' ? selectedStudent?.testAttempts : selectedStudent?.quizAttempts
      const sectionAttempts = attempts?.filter(attempt => {
        // Type guard to check which type of attempt we're dealing with
        if (section.type === 'test') {
          return 'test_sections' in attempt && attempt.test_sections
        } else {
          return 'quiz_sections' in attempt && attempt.quiz_sections
        }
      }) || []

      setSelectedSection({
        ...section,
        attempts: sectionAttempts,
        details: {
          type: section.type,
          totalAttempts: sectionAttempts.length,
          bestScore: sectionAttempts.length > 0 ? Math.max(...sectionAttempts.map(a => a.score)) : 0,
          averageScore: sectionAttempts.length > 0 
            ? Math.round(sectionAttempts.reduce((sum, a) => sum + a.score, 0) / sectionAttempts.length)
            : 0
        }
      })
    }
  }

  const handleBackToSections = () => {
    setSelectedSection(null)
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

  if (!user || user.role !== 'teacher') {
    return null // Will redirect via useEffect
  }

  // Section Details View
  if (selectedSection) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <button
                onClick={handleBackToSections}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <span className="mr-2">←</span> Back to Student Details
              </button>
              <h1 className="font-feather text-4xl text-dark-gray mb-2">
                {selectedSection.title} - Details
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {selectedStudent?.student.username}'s performance in this {selectedSection.type} section
              </p>
            </div>

            {/* Section Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Section Type</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">{selectedSection.type}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <p className={`text-2xl font-bold ${selectedSection.completed ? 'text-green-600' : 'text-gray-500'}`}>
                  {selectedSection.completed ? 'Completed' : 'Not Started'}
                </p>
              </div>
              {selectedSection.type !== 'learn' && (
                <>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Best Score</h3>
                    <p className="text-2xl font-bold text-green-600">{selectedSection.details.bestScore}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Attempts</h3>
                    <p className="text-2xl font-bold text-purple-600">{selectedSection.details.totalAttempts}</p>
                  </div>
                </>
              )}
              {selectedSection.type === 'learn' && (
                <>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Completed At</h3>
                    <p className="text-lg font-medium text-gray-700">
                      {selectedSection.completedAt 
                        ? new Date(selectedSection.completedAt).toLocaleDateString()
                        : 'Not completed'
                      }
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Time Spent</h3>
                    <p className="text-lg font-medium text-gray-700">{selectedSection.details.timeSpent}</p>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Information */}
            {selectedSection.type === 'learn' ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-dark-gray">Learning Section Details</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="text-lg text-gray-600 mb-4">{selectedSection.details.message}</div>
                    {selectedSection.completed ? (
                      <div className="space-y-2">
                        <p className="text-gray-500">Learning sections track completion status and progress.</p>
                        <p className="text-gray-500">Detailed content interaction data would be available with learning analytics.</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Student needs to access and complete this learning material.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-dark-gray">
                    {selectedSection.type === 'test' ? 'Test' : 'Quiz'} Attempt Details
                  </h2>
                </div>
                <div className="p-6">
                  {selectedSection.attempts && selectedSection.attempts.length > 0 ? (
                    <div className="space-y-8">
                      {selectedSection.attempts.map((attempt: any, attemptIndex: number) => (
                        <div key={attempt.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Attempt #{attemptIndex + 1}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {new Date(attempt.end_time || attempt.start_time).toLocaleDateString()} at{' '}
                                {new Date(attempt.end_time || attempt.start_time).toLocaleTimeString()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attempt.score >= 90 ? 'bg-green-100 text-green-800' :
                                attempt.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Score: {attempt.score}%
                              </span>
                            </div>
                          </div>

                          {attempt.questions && attempt.questions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Question #
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Question Text
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Student Answer
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Correct Answer
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Result
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                      Time (s)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attempt.questions.map((question: any, qIndex: number) => {
                                    const questionData = selectedSection.type === 'test' 
                                      ? question.test_questions 
                                      : question.quiz_questions
                                    
                                    return (
                                      <tr key={question.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                                          {qIndex + 1}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                          {questionData?.question_text || 'Question not available'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            question.is_correct 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {question.selected_answer || 'No answer'}
                                          </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                            {questionData?.correct_answer || 'N/A'}
                                          </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                          {question.is_correct ? (
                                            <span className="text-green-600 font-medium">✓ Correct</span>
                                          ) : (
                                            <span className="text-red-600 font-medium">✗ Incorrect</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                          {question.time_taken || 'N/A'}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="text-lg text-gray-600 mb-4">No question details available</div>
                              <p className="text-gray-500">This attempt was completed but detailed question responses are not available.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-lg text-gray-600 mb-4">No attempts found</div>
                      <p className="text-gray-500">
                        Student hasn't attempted this {selectedSection.type} yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </>
    )
  }

  // Student Details View
  if (selectedStudent) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <button
                onClick={handleBackToStudents}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <span className="mr-2">←</span> Back to Students
              </button>
              <h1 className="font-feather text-4xl text-dark-gray mb-2">
                {selectedStudent.student.username}'s Performance
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Detailed test and quiz responses for {selectedCourse?.course.course_name}
              </p>
            </div>

            {studentLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-lg text-gray-600">Loading student details...</div>
              </div>
            ) : (
              <>
                {/* Student Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Style</h3>
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.student.learning_style}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedStudent.student.learning_style_description}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Average</h3>
                    <p className="text-3xl font-bold text-green">{selectedStudent.performance.overallAverage}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Accuracy Rate</h3>
                    <p className="text-3xl font-bold text-purple-600">{selectedStudent.performance.accuracyRate}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Questions</h3>
                    <p className="text-3xl font-bold text-orange-600">{selectedStudent.performance.totalQuestionsAnswered}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedStudent.performance.correctAnswers} correct, {selectedStudent.performance.incorrectAnswers} incorrect
                    </div>
                  </div>
                </div>

                {/* Section Progress */}
                {selectedStudent.sectionProgress && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-dark-gray">Course Progress</h2>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {selectedStudent.sectionProgress.completedSections} of {selectedStudent.sectionProgress.totalSections} sections completed
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedStudent.sectionProgress.completionPercentage >= 90 ? 'bg-green-100 text-green-800' :
                            selectedStudent.sectionProgress.completionPercentage >= 70 ? 'bg-blue-100 text-blue-800' :
                            selectedStudent.sectionProgress.completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedStudent.sectionProgress.completionPercentage}% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Group sections by type */}
                      {(() => {
                        const groupedSections = selectedStudent.sectionProgress.sections.reduce((groups, section) => {
                          const type = section.type
                          if (!groups[type]) groups[type] = []
                          groups[type].push(section)
                          return groups
                        }, {} as { [key: string]: typeof selectedStudent.sectionProgress.sections })

                        const typeOrder = ['learn', 'test', 'quiz']
                        const typeLabels = {
                          learn: 'Learning Materials',
                          test: 'Tests',
                          quiz: 'Quizzes'
                        }
                        const typeColors = {
                          learn: 'blue',
                          test: 'purple', 
                          quiz: 'orange'
                        }

                        return typeOrder.map(type => {
                          const sections = groupedSections[type] || []
                          if (sections.length === 0) return null

                          const completedCount = sections.filter(s => s.completed).length
                          const totalCount = sections.length

                          return (
                            <div key={type} className="mb-8">
                              {/* Section Type Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {typeLabels[type as keyof typeof typeLabels]}
                                  </h3>
                                  <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${typeColors[type as keyof typeof typeColors]}-100 text-${typeColors[type as keyof typeof typeColors]}-800`}>
                                    {completedCount}/{totalCount} completed
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`bg-${typeColors[type as keyof typeof typeColors]}-500 h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                                  </span>
                                </div>
                              </div>

                              {/* Section Cards Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {sections.map((section, index) => (
                                  <div 
                                    key={section.id} 
                                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                                      section.completed 
                                        ? `bg-${typeColors[type as keyof typeof typeColors]}-50 border-${typeColors[type as keyof typeof typeColors]}-200 hover:bg-${typeColors[type as keyof typeof typeColors]}-100` 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleSectionClick(section)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                          section.completed 
                                            ? `bg-${typeColors[type as keyof typeof typeColors]}-500` 
                                            : 'bg-gray-300'
                                        }`}></span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {type === 'learn' ? `Section ${index + 1}` : section.title}
                                        </span>
                                      </div>
                                      {section.score !== null && (
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                          section.score >= 90 ? 'bg-green-100 text-green-800' :
                                          section.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                          section.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {section.score}%
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span>Status:</span>
                                        <span className={`font-medium ${
                                          section.completed ? `text-${typeColors[type as keyof typeof typeColors]}-700` : 'text-gray-500'
                                        }`}>
                                          {section.completed ? 'Completed' : 'Not Started'}
                                        </span>
                                      </div>
                                      {section.totalQuestions && (
                                        <div className="flex items-center justify-between">
                                          <span>Questions:</span>
                                          <span className="font-medium">{section.totalQuestions}</span>
                                        </div>
                                      )}
                                      {section.completedAt && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {new Date(section.completedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                      <div className="text-xs text-blue-600 mt-2 font-medium">
                                        Click for details →
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        }).filter(Boolean)
                      })()}
                    </div>
                  </div>
                )}

                {/* Test Attempts */}
                {selectedStudent.testAttempts.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-dark-gray">Test Attempts ({selectedStudent.testAttempts.length})</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {selectedStudent.testAttempts.map((attempt, attemptIndex) => (
                        <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Test Attempt #{attemptIndex + 1}</h3>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {new Date(attempt.start_time).toLocaleDateString()} at {new Date(attempt.start_time).toLocaleTimeString()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attempt.score >= 90 ? 'bg-green-100 text-green-800' :
                                attempt.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Score: {attempt.score}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {attempt.questions.map((question, questionIndex) => (
                              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">
                                    Question {questionIndex + 1}: {question.test_questions.question_text}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      question.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {question.is_correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                    <span className="text-xs text-gray-500">{question.time_taken}s</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  {['choice_a', 'choice_b', 'choice_c', 'choice_d'].map((choice) => {
                                    const choiceValue = question.test_questions[choice as keyof typeof question.test_questions] as string
                                    const choiceLetter = choice.split('_')[1].toUpperCase()
                                    const isSelected = question.selected_answer === choiceLetter
                                    const isCorrect = question.test_questions.correct_answer === choiceLetter
                                    
                                    return (
                                      <div key={choice} className={`p-2 rounded border ${
                                        isSelected && isCorrect ? 'bg-green-100 border-green-300' :
                                        isSelected && !isCorrect ? 'bg-red-100 border-red-300' :
                                        !isSelected && isCorrect ? 'bg-yellow-100 border-yellow-300' :
                                        'bg-white border-gray-200'
                                      }`}>
                                        <span className="font-medium">{choiceLetter})</span> {choiceValue}
                                        {isSelected && <span className="ml-2 text-sm">(Selected)</span>}
                                        {isCorrect && <span className="ml-2 text-sm text-green-600">(Correct)</span>}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Attempts */}
                {selectedStudent.quizAttempts.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-dark-gray">Quiz Attempts ({selectedStudent.quizAttempts.length})</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {selectedStudent.quizAttempts.map((attempt, attemptIndex) => (
                        <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Quiz Attempt #{attemptIndex + 1}</h3>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {new Date(attempt.end_time).toLocaleDateString()} at {new Date(attempt.end_time).toLocaleTimeString()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attempt.score >= 90 ? 'bg-green-100 text-green-800' :
                                attempt.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Score: {attempt.score}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {attempt.questions.map((question, questionIndex) => (
                              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">
                                    Question {questionIndex + 1}: {question.quiz_questions?.question_text || 'Question not available'}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      question.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {question.is_correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                    <span className="text-xs text-gray-500">{question.time_taken}s</span>
                                  </div>
                                </div>
                                
                                {question.quiz_questions && (
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    {['choice_a', 'choice_b', 'choice_c', 'choice_d'].map((choice) => {
                                      const choiceValue = question.quiz_questions[choice as keyof typeof question.quiz_questions] as string
                                      const choiceLetter = choice.split('_')[1].toUpperCase()
                                      const isSelected = question.selected_answer === choiceLetter
                                      const isCorrect = question.quiz_questions.correct_answer === choiceLetter
                                      
                                      return (
                                        <div key={choice} className={`p-2 rounded border ${
                                          isSelected && isCorrect ? 'bg-green-100 border-green-300' :
                                          isSelected && !isCorrect ? 'bg-red-100 border-red-300' :
                                          !isSelected && isCorrect ? 'bg-yellow-100 border-yellow-300' :
                                          'bg-white border-gray-200'
                                        }`}>
                                          <span className="font-medium">{choiceLetter})</span> {choiceValue}
                                          {isSelected && <span className="ml-2 text-sm">(Selected)</span>}
                                          {isCorrect && <span className="ml-2 text-sm text-green-600">(Correct)</span>}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data Message */}
                {selectedStudent.testAttempts.length === 0 && selectedStudent.quizAttempts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-lg text-gray-600 mb-4">No test or quiz attempts found</div>
                    <p className="text-gray-500">This student hasn't completed any assessments in this course yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </>
    )
  }

  if (selectedCourse) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <button
                onClick={handleBackToCourses}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <span className="mr-2">←</span> Back to Courses
              </button>
              <h1 className="font-feather text-4xl text-dark-gray mb-2">
                {selectedCourse.course.course_name}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {selectedCourse.course.description || 'Course Analytics'}
              </p>
            </div>

            {analyticsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-lg text-gray-600">Loading course analytics...</div>
              </div>
            ) : (
              <>
                {/* Course Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Students</h3>
                    <p className="text-3xl font-bold text-dark-gray">{selectedCourse.statistics.totalStudents}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Progress</h3>
                    <p className="text-3xl font-bold text-blue-600">{selectedCourse.statistics.avgProgress}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Score</h3>
                    <p className="text-3xl font-bold text-green">{selectedCourse.statistics.avgScore}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
                    <p className="text-3xl font-bold text-purple-600">{selectedCourse.statistics.completionRate}%</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Students</h3>
                    <p className="text-3xl font-bold text-orange-600">{selectedCourse.statistics.activeStudents}</p>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-dark-gray">Student Performance</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Learning Style
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tests
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quizzes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overall Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCourse.students.map((student) => {
                          const lastActivity = student.recentActivity.lastTestDate || student.recentActivity.lastQuizDate
                          return (
                            <tr 
                              key={student.id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleStudentClick(student.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-dark-gray">{student.username}</div>
                                <div className="text-sm text-gray-500">Click to view details</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {student.learning_style}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${Math.min(student.progress_percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{student.progress_percentage}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {student.performance.testsCompleted} completed
                                </div>
                                <div className="text-sm text-gray-500">
                                  Avg: {student.performance.avgTestScore}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {student.performance.quizzesCompleted} completed
                                </div>
                                <div className="text-sm text-gray-500">
                                  Avg: {student.performance.avgQuizScore}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-lg font-semibold ${
                                  student.performance.overallAverage >= 90 ? 'text-green-600' :
                                  student.performance.overallAverage >= 70 ? 'text-blue-600' :
                                  student.performance.overallAverage >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {student.performance.overallAverage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lastActivity 
                                  ? new Date(lastActivity).toLocaleDateString()
                                  : 'No activity'
                                }
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Teacher Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome back, Professor {user.username}! Select a course to view student progress and analytics.
            </p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">Loading courses...</div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">No courses found</div>
              <p className="text-gray-500">There are currently no courses available in the system.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => handleCourseClick(course.id)}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                >
                  <h3 className="font-bold text-lg text-dark-gray mb-3">{course.course_name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'Click to view detailed course analytics and student performance data.'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Students Enrolled:</span>
                      <span className="font-semibold text-dark-gray">{course.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg Progress:</span>
                      <span className="font-semibold text-blue-600">{course.avgProgress}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green h-2 rounded-full" 
                        style={{ width: `${Math.min(course.avgProgress, 100)}%` }}
                      ></div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
