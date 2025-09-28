'use client'
import React from "react";
import Header from "@/components/Header";
import { useAuth } from '@/common/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const CoursesPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to home
      router.push('/')
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

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-feather text-5xl text-dark-gray mb-4">
              Courses
            </h1>
            <p className="text-xl text-gray-600">
              Explore and manage your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Mathematics</h3>
              <p className="text-gray-600 mb-4">Advanced calculus and algebra</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Progress: 75%</span>
                <button className="bg-green hover:bg-green/90 text-white px-4 py-2 rounded">
                  Continue
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Computer Science</h3>
              <p className="text-gray-600 mb-4">Programming fundamentals</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Progress: 60%</span>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Continue
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-dark-gray mb-3">Physics</h3>
              <p className="text-gray-600 mb-4">Classical mechanics</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Progress: 45%</span>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CoursesPage;
