'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'

interface LearningStyleInfo {
  id: string
  name: string
  description: string
  userCount: number
  sectionCount: number
}

interface LearningStylesData {
  learningStyles: LearningStyleInfo[]
  totalUsers: number
  totalSections: number
}

export default function LearningStylesDebugPage() {
  const { user } = useAuth()
  const [stylesData, setStylesData] = useState<LearningStylesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchLearningStyles()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDebugInfo()
    }
  }, [user])

  const fetchLearningStyles = async () => {
    try {
      const response = await fetch('/api/learning-styles')
      const data = await response.json()
      setStylesData(data)
    } catch (error) {
      console.error('Error fetching learning styles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDebugInfo = async () => {
    if (!user) return
    
    try {
      // Get first available course ID
      const coursesResponse = await fetch('/api/learning-styles')
      if (coursesResponse.ok) {
        // For now, we'll use a hardcoded course ID that we know exists
        // You can get this from the database or the courses API
        const sampleCourseId = '1' // Adjust this to a real course ID from your database
        const response = await fetch(`/api/debug-learn-sections?userId=${user.id}&courseId=${sampleCourseId}`)
        if (response.ok) {
          const data = await response.json()
          setDebugInfo(data)
        }
      }
    } catch (error) {
      console.error('Error fetching debug info:', error)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">Loading learning styles data...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="font-feather text-4xl text-dark-gray mb-8">Learning Styles Debug</h1>
          
          {user && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
              <h2 className="font-bold text-xl text-dark-gray mb-4">Current User</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Username:</strong> {user.username}
                </div>
                <div>
                  <strong>Role:</strong> {user.role}
                </div>
                <div>
                  <strong>Learning Style ID:</strong> {user.learning_style_id || 'Not set'}
                </div>
              </div>
            </div>
          )}
          
          {stylesData && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
              <h2 className="font-bold text-xl text-dark-gray mb-4">Learning Styles Overview</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stylesData.learningStyles.length}</div>
                  <div className="text-sm text-gray-600">Learning Styles</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stylesData.totalUsers}</div>
                  <div className="text-sm text-gray-600">Users with Styles</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stylesData.totalSections}</div>
                  <div className="text-sm text-gray-600">Learn Sections</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Users</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Sections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stylesData.learningStyles.map((style) => (
                      <tr key={style.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{style.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{style.description || 'No description'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{style.userCount}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{style.sectionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {debugInfo && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="font-bold text-xl text-dark-gray mb-4">Debug Info for Sample Course</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Implementation Status</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>✅ Learning style filtering implemented in learn page</li>
              <li>✅ User interface updated to show learning style</li>
              <li>✅ Debug endpoints created</li>
              <li>🔄 Need to test with actual course data</li>
              <li>🔄 Need to ensure learning styles and content exist in database</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
