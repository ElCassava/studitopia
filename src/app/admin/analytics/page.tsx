'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function AdminAnalyticsPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams?.get('courseId')
  
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsType, setAnalyticsType] = useState('overvi                          {filteredAnalyticsData.quizDetails?.length || 0} responsesw')
  const [error, setError] = useState<string | null>(null)
  
  // New filtering and grouping states
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedLearningStyle, setSelectedLearningStyle] = useState('all') 
  const [dateRange, setDateRange] = useState('7days')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [analyticsType, courseId])

  // Fetch courses for filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        if (response.ok) {
          const data = await response.json()
          setCourses(data.courses || [])
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Filter data based on current filter selections
  const getFilteredData = (data: any) => {
    if (!data) return data

    let filteredData = { ...data }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (filteredData.testStats) {
        filteredData.testStats = filteredData.testStats.filter((item: any) => 
          item.username?.toLowerCase().includes(query)
        )
      }
      if (filteredData.quizStats) {
        filteredData.quizStats = filteredData.quizStats.filter((item: any) => 
          item.username?.toLowerCase().includes(query)
        )
      }
      if (filteredData.testDetails) {
        filteredData.testDetails = filteredData.testDetails.filter((item: any) => 
          item.test_attempts?.users?.username?.toLowerCase().includes(query)
        )
      }
      if (filteredData.quizDetails) {
        filteredData.quizDetails = filteredData.quizDetails.filter((item: any) => 
          item.quiz_attempts?.users?.username?.toLowerCase().includes(query)
        )
      }
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      const courseId = selectedCourse // Keep as string since course IDs are UUIDs
      if (filteredData.testStats) {
        filteredData.testStats = filteredData.testStats.filter((item: any) => 
          item.course_id === courseId
        )
      }
      if (filteredData.quizStats) {
        filteredData.quizStats = filteredData.quizStats.filter((item: any) => 
          item.course_id === courseId
        )
      }
      if (filteredData.testDetails) {
        filteredData.testDetails = filteredData.testDetails.filter((item: any) => 
          item.test_attempts?.course_id === courseId
        )
      }
      if (filteredData.quizDetails) {
        filteredData.quizDetails = filteredData.quizDetails.filter((item: any) => 
          item.quiz_attempts?.course_id === courseId
        )
      }
    }

    // Filter by learning style
    if (selectedLearningStyle !== 'all') {
      const learningStyleMap: { [key: string]: string } = {
        'visual': 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14',
        'auditory': '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85',
        'kinesthetic': 'f5379d13-d830-4e78-8353-981829a5fd7c'
      }
      const styleId = learningStyleMap[selectedLearningStyle]
      
      if (styleId && filteredData.testStats) {
        filteredData.testStats = filteredData.testStats.filter((item: any) => 
          item.learning_style_id === styleId
        )
      }
      if (styleId && filteredData.quizStats) {
        filteredData.quizStats = filteredData.quizStats.filter((item: any) => 
          item.learning_style_id === styleId
        )
      }
    }

    // Recalculate summary based on filtered data
    if (filteredData.testStats || filteredData.quizStats) {
      const testStats = filteredData.testStats || []
      const quizStats = filteredData.quizStats || []
      
      filteredData.summary = {
        totalTests: testStats.length,
        totalQuizzes: quizStats.length,
        avgTestScore: testStats.length > 0 
          ? testStats.reduce((sum, t) => sum + (t.score || 0), 0) / testStats.length
          : 0,
        avgQuizScore: quizStats.length > 0 
          ? quizStats.reduce((sum, q) => sum + (q.score || 0), 0) / quizStats.length
          : 0
      }
    }

    return filteredData
  }

  const filteredAnalyticsData = getFilteredData(analyticsData)

  // Export functionality
  const exportData = () => {
    if (!filteredAnalyticsData) return
    
    const exportObj = {
      exportDate: new Date().toISOString(),
      filters: {
        course: selectedCourse,
        learningStyle: selectedLearningStyle,
        dateRange: dateRange,
        searchQuery: searchQuery
      },
      summary: filteredAnalyticsData.summary,
      testStats: filteredAnalyticsData.testStats,
      quizStats: filteredAnalyticsData.quizStats,
      testDetails: filteredAnalyticsData.testDetails,
      quizDetails: filteredAnalyticsData.quizDetails,
      learningStyleAnalysis: filteredAnalyticsData.learningStyleAnalysis
    }
    
    const dataStr = JSON.stringify(exportObj, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch all analytics data types
      const [overviewResponse, detailedResponse, learningStyleResponse] = await Promise.all([
        fetch(`/api/analytics?type=overview${courseId ? `&courseId=${courseId}` : ''}`),
        fetch(`/api/analytics?type=detailed${courseId ? `&courseId=${courseId}` : ''}`),
        fetch(`/api/analytics?type=learning-style-analysis${courseId ? `&courseId=${courseId}` : ''}`)
      ])
      
      if (!overviewResponse.ok || !detailedResponse.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const overviewData = await overviewResponse.json()
      const detailedData = await detailedResponse.json()
      
      // Learning style analysis might not always be available
      let learningStyleData = {}
      if (learningStyleResponse.ok) {
        learningStyleData = await learningStyleResponse.json()
      }
      
      // Merge all data
      const combinedData = {
        ...overviewData,
        ...detailedData,
        ...learningStyleData
      }
      
      setAnalyticsData(combinedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
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
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">Error: {error}</div>
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-feather text-3xl text-gray-900 mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">Monitor student performance and platform usage</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </button>
                <button 
                  onClick={fetchAnalytics}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Course:</label>
                  <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={coursesLoading}
                  >
                    <option value="all">All Courses</option>
                    {coursesLoading ? (
                      <option disabled>Loading courses...</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Learning Style:</label>
                  <select 
                    value={selectedLearningStyle} 
                    onChange={(e) => setSelectedLearningStyle(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Styles</option>
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Time Range:</label>
                  <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="3months">Last 3 months</option>
                    <option value="all">All time</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                  />
                </div>
              </div>
              
              {/* Active Filters Indicator */}
              {(selectedCourse !== 'all' || selectedLearningStyle !== 'all' || searchQuery) && (
                <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586l-4-4V9.414a1 1 0 00-.293-.707L3.293 2.293A1 1 0 013 2V4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-900">Filters Active:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse !== 'all' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Course: {courses.find(c => c.id === selectedCourse)?.course_name || selectedCourse}
                        </span>
                      )}
                      {selectedLearningStyle !== 'all' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Style: {selectedLearningStyle.charAt(0).toUpperCase() + selectedLearningStyle.slice(1)}
                        </span>
                      )}
                      {searchQuery && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Search: "{searchQuery}"
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCourse('all')
                      setSelectedLearningStyle('all')
                      setSearchQuery('')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard Overview
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'performance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Performance Analysis
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('detailed')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'detailed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Detailed Reports
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('learningStyles')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'learningStyles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Learning Styles
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {filteredAnalyticsData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-500 text-sm">Total Tests</h3>
                          <p className="text-2xl font-bold text-blue-600">
                            {filteredAnalyticsData.summary?.totalTests || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-500 text-sm">Total Quizzes</h3>
                          <p className="text-2xl font-bold text-green-600">
                            {filteredAnalyticsData.summary?.totalQuizzes || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-500 text-sm">Avg Test Score</h3>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(filteredAnalyticsData.summary?.avgTestScore || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-500 text-sm">Avg Quiz Score</h3>
                          <p className="text-2xl font-bold text-orange-600">
                            {Math.round(filteredAnalyticsData.summary?.avgQuizScore || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Insights */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Quick Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Total Attempts</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {(filteredAnalyticsData.summary?.totalTests || 0) + (filteredAnalyticsData.summary?.totalQuizzes || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Overall Average</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(((filteredAnalyticsData.summary?.avgTestScore || 0) + (filteredAnalyticsData.summary?.avgQuizScore || 0)) / 2)}%
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Success Rate</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {Math.round(((filteredAnalyticsData.summary?.avgTestScore || 0) + (filteredAnalyticsData.summary?.avgQuizScore || 0)) / 2) > 70 ? '✓ Good' : '⚠ Needs Improvement'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Distribution Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4">Test Score Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={filteredAnalyticsData.testStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="username" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4">Quiz Score Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={filteredAnalyticsData.quizStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="username" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              {filteredAnalyticsData && (
                <>
                  {/* Performance Overview */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Performance Trends</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-4">Test Performance Over Time</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={filteredAnalyticsData.testStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="username" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-4">Quiz Performance Over Time</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={filteredAnalyticsData.quizStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="username" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4">Top Performers</h3>
                      <div className="space-y-3">
                        {filteredAnalyticsData.testStats?.slice(0, 5).map((student: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="ml-3 font-medium">{student.username}</span>
                            </div>
                            <span className="font-bold text-blue-600">{student.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4">Performance Distribution</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Excellent (90-100%)', value: filteredAnalyticsData.testStats?.filter((s: any) => s.score >= 90).length || 0, fill: '#10B981' },
                              { name: 'Good (80-89%)', value: filteredAnalyticsData.testStats?.filter((s: any) => s.score >= 80 && s.score < 90).length || 0, fill: '#3B82F6' },
                              { name: 'Average (70-79%)', value: filteredAnalyticsData.testStats?.filter((s: any) => s.score >= 70 && s.score < 80).length || 0, fill: '#F59E0B' },
                              { name: 'Below Average (<70%)', value: filteredAnalyticsData.testStats?.filter((s: any) => s.score < 70).length || 0, fill: '#EF4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'learningStyles' && (
            <div className="space-y-8">
              {filteredAnalyticsData?.learningStyleAnalysis ? (
                <>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Learning Style Effectiveness</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {Object.entries(filteredAnalyticsData.learningStyleAnalysis).map(([style, data]: [string, any]) => (
                        <div key={style} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-lg capitalize">{style}</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Attempts:</span>
                              <span className="font-medium text-lg">{data.attempts}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Avg Score:</span>
                              <span className="font-medium text-lg text-blue-600">{Math.round(data.avgScore)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Success Rate:</span>
                              <span className="font-medium text-lg text-green-600">{Math.round(data.successRate * 100)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Avg Duration:</span>
                              <span className="font-medium text-lg">{Math.round(data.avgDuration)} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Performance Comparison Chart */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-4">Learning Style Performance Comparison</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={Object.entries(filteredAnalyticsData.learningStyleAnalysis).map(([style, data]: [string, any]) => ({
                          style: style.charAt(0).toUpperCase() + style.slice(1),
                          avgScore: Math.round(data.avgScore),
                          successRate: Math.round(data.successRate * 100),
                          attempts: data.attempts
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="style" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="avgScore" fill="#3B82F6" name="Average Score %" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="successRate" fill="#10B981" name="Success Rate %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Style Data Available</h3>
                  <p className="text-gray-600">Learning style analysis will appear here once more student data is collected.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-8">
              {filteredAnalyticsData && (
                <>
                  {/* Student Response Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Test Answer Details</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {filteredAnalyticsData.testDetails?.length || 0} responses
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-4">
                        {filteredAnalyticsData.testDetails?.length > 0 ? (
                          filteredAnalyticsData.testDetails.map((detail: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-blue-600">
                                      {detail.test_attempts?.users?.username?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {detail.test_attempts?.users?.username}
                                  </span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  detail.is_correct 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {detail.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                </div>
                              </div>
                              <p className="text-sm text-gray-800 mb-3 font-medium">
                                {detail.test_questions?.question_text}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span>
                                  <span className="font-medium">Answer:</span> {detail.selected_answer || 'Not recorded'}
                                </span>
                                {detail.time_taken && (
                                  <span>
                                    <span className="font-medium">Time:</span> {detail.time_taken}s
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500">No test responses available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Quiz Answer Details</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {filteredAnalyticsData.quizDetails?.length || 0} responses
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-4">
                        {filteredAnalyticsData.quizDetails?.length > 0 ? (
                          filteredAnalyticsData.quizDetails.map((detail: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-green-600">
                                      {detail.quiz_attempts?.users?.username?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {detail.quiz_attempts?.users?.username}
                                  </span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  detail.is_correct 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {detail.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                </div>
                              </div>
                              <p className="text-sm text-gray-800 mb-3 font-medium">
                                {detail.quiz_questions?.question_text || 'Quiz question not available'}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span>
                                  <span className="font-medium">Answer:</span> {detail.selected_answer || 'Not recorded'}
                                </span>
                                {detail.time_taken && (
                                  <span>
                                    <span className="font-medium">Time:</span> {detail.time_taken}s
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-500">No quiz responses available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Analysis */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Question Performance Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Most Challenging Questions</h4>
                        <p className="text-sm text-blue-700">
                          Questions with lowest success rates will help identify areas needing more focus.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Best Performing Questions</h4>
                        <p className="text-sm text-green-700">
                          Questions with highest success rates indicate well-understood concepts.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Response Time Analysis</h4>
                        <p className="text-sm text-purple-700">
                          Average response times help gauge question difficulty and student engagement.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
