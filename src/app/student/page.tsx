'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to home
      router.push('/')
    } else if (!isLoading && user && user.role !== 'student') {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === 'teacher') {
        router.push('/teacher')
      } else if (user.role === 'admin') {
        router.push('/admin')
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

  if (!user || user.role !== 'student') {
    return null // Will redirect via useEffect
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Student Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back, {user.username}! Continue your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">My Courses</h3>
              <p className="text-gray-600 mb-4">Access your enrolled courses and continue learning</p>
              <button className="bg-green hover:bg-green/90 text-white px-4 py-2 rounded">
                View Courses
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Assignments</h3>
              <p className="text-gray-600 mb-4">Check your assignments and deadlines</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                View Assignments
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Grades</h3>
              <p className="text-gray-600 mb-4">Track your academic progress</p>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                View Grades
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Study Groups</h3>
              <p className="text-gray-600 mb-4">Join or create study groups</p>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                Find Groups
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Resources</h3>
              <p className="text-gray-600 mb-4">Access learning materials and resources</p>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded">
                Browse Resources
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Schedule</h3>
              <p className="text-gray-600 mb-4">View your class schedule and events</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
