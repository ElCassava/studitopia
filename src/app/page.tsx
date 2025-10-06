'use client'
import { useState } from 'react'
import Header from "@/components/Header"
import { useAuth } from '@/common/AuthContext'
import Image from "next/image"
import LoginModal from "@/components/LoginModal"  // ✅ import modal
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user: currentUser, isLoading } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false) // ✅ modal state
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users appropriately
    if (!isLoading && currentUser) {
      // If student has no learning style, go directly to test
      if (currentUser.role === 'student' && !currentUser.learning_style_id) {
        router.push('/learning-style/test')
        return
      }

      const roleRoutes = {
        student: '/student',
        teacher: '/teacher',
        admin: '/admin'
      } as const

      const redirectPath = roleRoutes[currentUser.role]
      if (redirectPath) router.push(redirectPath)
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
          // ✅ Authenticated user content
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
          // ✅ Public/unauthenticated content
          <section className="flex min-h-screen flex-col items-center justify-center gap-6 font-nunito bg-white">
            {/* Background math text */}
            <span className="absolute top-1/4 left-30 text-5xl text-light-gray font-bold select-none">
              3 × 4 = 12
            </span>
            <span className="absolute top-1/3 right-30 text-5xl text-light-gray font-bold select-none">
              4 + 3 = 7
            </span>
            <span className="absolute top-1/6 left-180 text-5xl text-light-gray font-bold select-none">
              8 + 12 = 20
            </span>
            <span className="absolute bottom-1/4 left-1/3 text-5xl text-light-gray font-bold select-none">
              15 ÷ 5 = 3
            </span>
            <span className="absolute bottom-1/3 right-1/4 text-5xl text-light-gray font-bold select-none">
              17 − 7 = 10
            </span>

            <h1 className="font-feather text-7xl text-dark-gray max-w-[990px] text-center">
              Learning feels better when it’s made for you.
            </h1>
            <p className="text-xl text-gray-600 text-center max-w-2xl mt-6">
              Discover your style. Go at your pace. Enjoy the ride.
            </p>

            {/* ✅ Get Started opens modal */}
            <div className="flex gap-4 mt-8 z-1">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-bright-green text-white px-12 py-3 rounded-lg text-3xl font-semibold border-b-4 border-green"
              >
                Get Started
              </button>
            </div>

            {/* Image at the bottom */}
            <div className="absolute bottom-0 flex justify-center w-full z-0">
              <Image
                src="/images/mascot/Front-Facing-Mascot.png"
                alt="Studitopia Illustration"
                width={550}
                height={400}
                className="object-contain"
              />
            </div>
          </section>
        )}
      </main>

      {/* ✅ Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => console.log("✅ Logged in!")}
      />
    </>
  )
}
