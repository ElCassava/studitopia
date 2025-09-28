'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome, {user.username}! Manage the entire Studitopia platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">User Management</h3>
              <p className="text-gray-600 mb-4">Manage students, teachers, and admins</p>
              <button className="bg-green hover:bg-green/90 text-white px-4 py-2 rounded">
                Manage Users
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Course Management</h3>
              <p className="text-gray-600 mb-4">Oversee all courses and curricula</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Manage Courses
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">System Settings</h3>
              <p className="text-gray-600 mb-4">Configure platform settings</p>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                System Settings
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Analytics</h3>
              <p className="text-gray-600 mb-4">Platform-wide usage analytics</p>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                View Analytics
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Reports</h3>
              <p className="text-gray-600 mb-4">Generate system and user reports</p>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded">
                Generate Reports
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Backup & Security</h3>
              <p className="text-gray-600 mb-4">System backup and security settings</p>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Security Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
