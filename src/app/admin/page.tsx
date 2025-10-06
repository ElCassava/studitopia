'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { populateTestData, clearTestData } from '@/utils/populateTestData'

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [dbLoading, setDbLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [adminStats, setAdminStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const handlePopulateTestData = async () => {
    setDbLoading(true)
    setMessage('')
    try {
      const success = await populateTestData()
      if (success) {
        setMessage('Test data populated successfully!')
      } else {
        setMessage('Failed to populate test data. Check console for details.')
      }
    } catch (error) {
      console.error('Error populating test data:', error)
      setMessage('Error populating test data.')
    } finally {
      setDbLoading(false)
    }
  }

  const handleClearTestData = async () => {
    if (!confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
      return
    }
    
    setDbLoading(true)
    setMessage('')
    try {
      const success = await clearTestData()
      if (success) {
        setMessage('Test data cleared successfully!')
      } else {
        setMessage('Failed to clear test data. Check console for details.')
      }
    } catch (error) {
      console.error('Error clearing test data:', error)
      setMessage('Error clearing test data.')
    } finally {
      setDbLoading(false)
    }
  }

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin-stats')
        if (response.ok) {
          const data = await response.json()
          setAdminStats(data)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    if (user && user.role === 'admin') {
      fetchStats()
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to home
      router.push('/')
    } else if (!isLoading && user && user.role !== 'admin') {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === 'student') {
        router.push('/student')
      } else if (user.role === 'teacher') {
        router.push('/teacher')
      } else {
        router.push('/')
      }
    }
  }, [user, isLoading, router])

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

  if (!user || user.role !== 'admin') {
    return null // Will redirect via useEffect
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
                <h1 className="font-feather text-3xl text-dark-gray mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user.username}! Here's what's happening with your platform.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : adminStats?.totalUsers?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600">
                    {statsLoading ? '...' : `+${adminStats?.growthStats?.userGrowth || 0}% from last month`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : adminStats?.totalCourses?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-blue-600">
                    {statsLoading ? '...' : `${adminStats?.recentActivity?.newUsers || 0} new users this week`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Test Completions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : adminStats?.totalTestCompletions?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600">
                    {statsLoading ? '...' : `${(adminStats?.recentActivity?.tests || 0) + (adminStats?.recentActivity?.quizzes || 0)} this week`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : `${adminStats?.systemHealth || 95.0}%`}
                  </p>
                  <p className="text-sm text-green-600">
                    {statsLoading ? '...' : (adminStats?.systemHealth >= 99 ? 'All systems operational' : 'Systems running normally')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div className="space-y-8">
            {/* Core Management */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Core Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">User Management</h3>
                  <p className="text-gray-600 mb-4 text-sm">Manage students, teachers, and admin accounts</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Manage Users
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">156 Active</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">Course Management</h3>
                  <p className="text-gray-600 mb-4 text-sm">Oversee all courses and curricula</p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Manage Courses
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Updated</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 mb-4 text-sm">Platform-wide usage and performance analytics</p>
                  <button 
                    onClick={() => router.push('/admin/analytics')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* System Management */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Config</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">System Settings</h3>
                  <p className="text-gray-600 mb-4 text-sm">Configure platform settings and preferences</p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    System Settings
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Secure</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">Security & Backup</h3>
                  <p className="text-gray-600 mb-4 text-sm">System backup and security configurations</p>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Security Settings
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Tools</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark-gray mb-2">Database Management</h3>
                  <p className="text-gray-600 mb-4 text-sm">Manage test data and database operations</p>
                  <div className="space-y-2">
                    <button 
                      onClick={handlePopulateTestData}
                      disabled={dbLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {dbLoading ? 'Populating...' : 'Populate Test Data'}
                    </button>
                    <button 
                      onClick={handleClearTestData}
                      disabled={dbLoading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {dbLoading ? 'Clearing...' : 'Clear Test Data'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Generate Report</p>
                      <p className="text-sm text-gray-500">Create system reports</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">System Health</p>
                      <p className="text-sm text-gray-500">Monitor system status</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="h-8 w-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Support Center</p>
                      <p className="text-sm text-gray-500">Manage user support</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
