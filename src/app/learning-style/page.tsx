'use client'
import Header from '@/components/Header'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/common/AuthContext'
import { useEffect } from 'react'

export default function LearningStyleIntro() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
    // If user already has a learning style, send to student dashboard
    if (!isLoading && user && user.learning_style_id) {
      router.push('/student')
    }
  }, [user, isLoading, router])

  const startTest = () => {
    router.push('/learning-style/test')
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 font-nunito bg-white pt-20">
        <div className="text-center max-w-3xl px-6">
          <h1 className="font-feather text-5xl text-green mb-6">
            Yuk, kita mulai petualangan mengenal cara belajarmu!
          </h1>

          <div className="flex justify-center my-4">
            <Image src="/images/mascot/mascot2.png" alt="Mascot" width={260} height={260} />
          </div>

          <button
            onClick={startTest}
            className="bg-bright-green hover:bg-green text-white px-8 py-4 rounded-lg text-2xl font-bold border-b-4 border-green"
          >
            Aku Siap Banget, Ayo Mulai!
          </button>
        </div>
      </main>
    </>
  )
}


