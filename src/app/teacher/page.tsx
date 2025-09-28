'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Teacher Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back, Professor {user.username}! Manage your classes and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">My Classes</h3>
              <p className="text-gray-600 mb-4">Manage your courses and curriculum</p>
              <button className="bg-green hover:bg-green/90 text-white px-4 py-2 rounded">
                Manage Classes
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Students</h3>
              <p className="text-gray-600 mb-4">View and manage your students</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                View Students
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Assignments</h3>
              <p className="text-gray-600 mb-4">Create and grade assignments</p>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                Manage Assignments
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Gradebook</h3>
              <p className="text-gray-600 mb-4">Track student progress and grades</p>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                Open Gradebook
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Resources</h3>
              <p className="text-gray-600 mb-4">Upload and manage learning materials</p>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded">
                Manage Resources
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Analytics</h3>
              <p className="text-gray-600 mb-4">View class performance analytics</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
