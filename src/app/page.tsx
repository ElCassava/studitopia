'use client'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user: currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboards
    if (!isLoading && currentUser) {
      const roleRoutes = {
        student: '/student',
        teacher: '/teacher',
        admin: '/admin'
      } as const
      
      const redirectPath = roleRoutes[currentUser.role]
      if (redirectPath) {
        router.push(redirectPath)
      }
    }
  }, [currentUser, isLoading, router])

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

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white">
        {currentUser ? (
          // Authenticated user content
          <section className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white pt-20">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h1 className="font-feather text-6xl text-dark-gray mb-6">
                Welcome back, {currentUser.username}!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Ready to continue your personalized learning journey?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-lg text-dark-gray mb-3">My Courses</h3>
                  <p className="text-gray-600 mb-4">Continue where you left off</p>
                  <button className="bg-green hover:bg-green/90 text-white px-4 py-2 rounded">
                    View Courses
                  </button>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg text-dark-gray mb-3">Study Plans</h3>
                  <p className="text-gray-600 mb-4">Personalized learning paths</p>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    View Plans
                  </button>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-lg text-dark-gray mb-3">Progress</h3>
                  <p className="text-gray-600 mb-4">Track your achievements</p>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Public/unauthenticated content
          <section className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white">
            <h1 className="font-feather text-7xl text-dark-gray max-w-[990px] text-center">
              Learning feels better when it&apos;s made for you.
            </h1>
            <p className="text-xl text-gray-600 text-center max-w-2xl mt-6">
              Join thousands of students who are already experiencing personalized education. 
              Sign up today and discover learning that adapts to you.
            </p>
            <div className="flex gap-4 mt-8">
              <button className="bg-green hover:bg-green/90 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                Get Started Free
              </button>
              <button className="border-2 border-green text-green hover:bg-green hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </section>
        )}
        
        {/* Add some content to test scrolling */}
        <div className="h-[100vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark-gray mb-4">
              {currentUser ? 'Your Learning Dashboard' : 'Why Choose Studitopia?'}
            </h2>
            <p className="text-lg text-gray-600">
              {currentUser 
                ? 'Access your personalized learning tools and track your progress.'
                : 'Scroll down to test the sticky header behavior and learn more about our features!'
              }
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
