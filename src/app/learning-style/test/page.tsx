'use client'
import Header from '@/components/Header'
import { useAuth } from '@/common/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabaseClient } from '@/common/network'

const results = [
  {
    type: 'visual',
    title: 'Selamat! Aku sudah tahu gaya belajarmu, kamu adalah pembelajar Visual!',
    description: `Kamu belajar paling baik dengan melihat. 
Kamu suka gambar, warna, tulisan, dan hal-hal yang bisa kamu lihat langsung. `
  },
  {
    type: 'auditory',
    title: 'Selamat! Aku sudah tahu gaya belajarmu, kamu adalah pembelajar Auditori!',
    description: `Kamu belajar paling baik dengan mendengar. 
Kamu suka mendengarkan guru, musik, atau teman bercerita. `
  },
  {
    type: 'kinesthetic',
    title: 'Selamat! Aku sudah tahu gaya belajarmu, kamu adalah pembelajar Kinestetik!',
    description: `Kamu belajar paling baik dengan melakukan dan bergerak. 
    Kamu suka praktik langsung, menyentuh benda, dan belajar sambil aktif bergerak.`
  }
];

const questions = [
  {
    id: 1,
    question: "Kalau guru menjelaskan pelajaran, aku paling suka...",
    options: [
      { type: 'visual', text: "Melihat tulisan di papan tulis" },
      { type: 'auditory', text: "Mendengarkan penjelasannya" },
      { type: 'kinesthetic', text: "Ikut mencoba atau praktik langsung" }
    ]
  },
  {
    id: 2,
    question: "Saat aku belajar sesuatu yang baru, aku lebih mudah mengerti kalau...",
    options: [
      { type: 'visual', text: "Melihat gambar, diagram, atau video" },
      { type: 'auditory', text: "Mendengar orang menjelaskan" },
      { type: 'kinesthetic', text: "Melakukan sendiri atau menyentuh benda yang dipelajari" }
    ]
  },
  {
    id: 3,
    question: "Kalau aku membaca cerita, aku paling suka...",
    options: [
      { type: 'visual', text: "Membayangkan gambar atau adegannya di kepalaku" },
      { type: 'auditory', text: "Mendengarkan orang lain membacakan ceritanya" },
      { type: 'kinesthetic', text: "Bermain peran atau memeragakan cerita itu" }
    ]
  },
  {
    id: 4,
    question: "Saat belajar menghafal, aku lebih cepat ingat kalau...",
    options: [
      { type: 'visual', text: "Menulis atau melihat catatanku sendiri" },
      { type: 'auditory', text: "Mengulang dengan suara keras" },
      { type: 'kinesthetic', text: "Bergerak atau melakukan sesuatu sambil menghafal" }
    ]
  },
  {
    id: 5,
    question: "Kalau aku bosan di kelas, aku biasanya...",
    options: [
      { type: 'visual', text: "Mencoret-coret di buku atau menggambar kecil" },
      { type: 'auditory', text: "Mengobrol dengan teman" },
      { type: 'kinesthetic', text: "Menggerak-gerakkan tangan, kaki, atau tubuhku" }
    ]
  },
  {
    id: 6,
    question: "Kalau aku harus mengikuti petunjuk, aku lebih suka...",
    options: [
      { type: 'visual', text: "Melihat gambar atau langkah-langkah tertulisnya" },
      { type: 'auditory', text: "Mendengar orang menjelaskannya" },
      { type: 'kinesthetic', text: "Langsung mencoba sendiri" }
    ]
  },
  {
    id: 7,
    question: "Saat menonton film atau video, aku paling memperhatikan...",
    options: [
      { type: 'visual', text: "Gambarnya dan warna-warnanya" },
      { type: 'auditory', text: "Suara, musik, atau kata-kata orangnya" },
      { type: 'kinesthetic', text: "Gerakan dan aksi yang terjadi" }
    ]
  },
  {
    id: 8,
    question: "Kalau aku ingin belajar sesuatu yang sulit, aku lebih suka...",
    options: [
      { type: 'visual', text: "Melihat contoh atau membaca buku panduannya" },
      { type: 'auditory', text: "Mendengar orang menjelaskan caranya" },
      { type: 'kinesthetic', text: "Langsung mencoba sampai bisa" }
    ]
  },
  {
    id: 9,
    question: "Saat ujian atau tugas, aku sering mengingat...",
    options: [
      { type: 'visual', text: "Apa yang aku lihat di buku atau catatan" },
      { type: 'auditory', text: "Apa yang aku dengar dari guru" },
      { type: 'kinesthetic', text: "Apa yang aku lakukan waktu latihan" }
    ]
  },
  {
    id: 10,
    question: "Kalau bermain dengan teman, aku paling suka...",
    options: [
      { type: 'visual', text: "Bermain yang ada gambar atau teka-tekinya" },
      { type: 'auditory', text: "Bermain sambil berbicara atau bernyanyi" },
      { type: 'kinesthetic', text: "Bermain yang melibatkan gerak tubuh, seperti olahraga" }
    ]
  }
];

type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';
type Scores = Record<LearningStyle, number>;

export default function LearningStyleTestPage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [scores, setScores] = useState<Scores>({
    visual: 0,
    auditory: 0,
    kinesthetic: 0
  });
  const [dominantStyle, setDominantStyle] = useState<LearningStyle | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleStart = () => {
    setStep(2)
  }

  const handleCurious = () => {
    setStep(3)
  }

  const handleProceed = () => {
    setStep(4)
  }

  const handleStep4Continue = () => {
    setStep(5)
  }

  const handleStep5Continue = () => {
    setStep(6)
  }

  const handleStep6Continue = () => {
    setStep(7)
  }

  const handleStep7Continue = () => {
    setStep(8)
  }

  const handleKnownStyle = () => {
    setStep(10)
  }

  const handleStyleSelect = async (type: LearningStyle) => {
    setDominantStyle(type);
    
    // Save the learning style immediately for manual selection
    const success = await saveLearningStyle(type)
    if (success) {
      setStep(9);
    } else {
      alert('Terjadi kesalahan saat menyimpan gaya belajar. Silakan coba lagi.')
    }
  }

  const handleChangeAnswer = () => {
    setStep(2);
  }

  const calculateDominantStyle = (newScores: Scores): LearningStyle => {
    let maxScore = 0;
    let dominantStyle: LearningStyle = 'visual'; // default

    Object.entries(newScores).forEach(([style, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantStyle = style as LearningStyle;
      }
    });

    return dominantStyle;
  };

  const calculatePercentages = (scores: Scores) => {
    const total = questions.length;
    return {
      visual: Math.round((scores.visual / total) * 100),
      auditory: Math.round((scores.auditory / total) * 100),
      kinesthetic: Math.round((scores.kinesthetic / total) * 100)
    };
  };

  const handleAnswerSelect = (type: LearningStyle) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: type
    }));

    const newScores = {
      ...scores,
      [type]: scores[type] + 1
    };
    setScores(newScores);

    setDominantStyle(calculateDominantStyle(newScores));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep(9);
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScores({
      visual: 0,
      auditory: 0,
      kinesthetic: 0
    });
    setDominantStyle(null);
    setStep(1);
  };

  // Save learning style to user profile
  const saveLearningStyle = async (styleName: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ No user found in saveLearningStyle')
      return false
    }
    
    console.log('🚀 Starting saveLearningStyle for:', styleName, 'User ID:', user.id)
    setIsSaving(true)
    
    try {
      // RLS is disabled, so regular client should work fine
      const supabase = getSupabaseClient()
      console.log('🔧 Using regular client (RLS disabled)')
      
      // Map frontend style names to database names
      const styleNameMap: Record<string, string> = {
        'visual': 'Visual',
        'auditory': 'Auditory', 
        'kinesthetic': 'Kinesthetic'
      }
      
      const dbStyleName = styleNameMap[styleName] || styleName
      console.log('🎨 Looking for learning style:', dbStyleName)
      
      // Get learning style ID
      const { data: style, error: styleError } = await supabase
        .from('learning_styles')
        .select('id')
        .eq('name', dbStyleName)
        .single()
      
      if (styleError || !style) {
        console.error('❌ Could not find learning style:', styleError)
        return false
      }
      
      console.log('✅ Found learning style ID:', style.id)
      
      // Update user's learning style using admin client to bypass RLS
      console.log('💾 Updating user learning style in database...')
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({ learning_style_id: style.id })
        .eq('id', user.id)
        .select('id, username, learning_style_id')
      
      if (updateError) {
        console.error('❌ Failed to update user learning style:', updateError)
        console.error('❌ Update details:', {
          userId: user.id,
          styleId: style.id
        })
        return false
      }
      
      console.log('✅ Successfully updated user:', updateResult)
      
      // Refresh user data in auth context
      console.log('🔄 Refreshing user data...')
      await refreshUser()
      
      return true
    } catch (error) {
      console.error('❌ Error in saveLearningStyle:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        {step === 1 && (
          <div>
            <h2 className="text-[#6BCB2D] font-bold text-5xl mb-6 leading-snug">
              Yuk, kita mulai petualangan <br />
              mengenal cara belajarmu!
            </h2>

            <div className="flex justify-center mb-8">
              <Image
                src="/images/mascot/mascot3.png"
                alt="Mascot"
                width={180}
                height={180}
                priority
              />
            </div>

            <button
              onClick={handleStart}
              className="bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all"
            >
              Aku Siap Banget, Ayo Mulai!
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[#6BCB2D] font-bold text-5xl mb-6 leading-snug">
              Sebelum kita mulai, apakah kamu <br />
              sudah tahu tipe belajar kamu?
            </h2>

            <div className="flex justify-center mb-8 relative">
              <Image
                src="/images/mascot/mascot4.png"
                alt="Mascot"
                width={180}
                height={180}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleCurious}
                className="bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all"
              >
                Belum, Aku Masih Penasaran.
              </button>
              <button
                onClick={handleKnownStyle}
                className="bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold text-lg px-8 py-3 rounded-lg border-t border-l border-r border-gray-200 border-b-4 border-b-gray-300 transition-all"
              >
                Aku Sudah Tau Gaya Belajarku!
              </button>
            </div>
          </div>
        )}

        {(step === 3 || step === 4 || step === 5 || step === 6 || step === 7) && (
          <div className="relative">
            <h2 className="text-[#6BCB2D] font-bold text-5xl mb-6 leading-snug">
              Tenang aja! Aku bakal bantu cari tahu <br />
              gaya belajarmu yang paling pas!
            </h2>

            <div className="flex justify-center mb-8">
              <Image
                src="/images/mascot/mascot4.png"
                alt="Mascot"
                width={180}
                height={180}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleProceed}
                className="bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all"
              >
                Oke, Ayo Kita Cari Tahu!
              </button>
              {/* <button
                disabled
                className="bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold text-1xl px-8 py-3 rounded-lg border-t border-l border-r border-gray-200 border-b-4 border-b-gray-300 transition-all"
              >
                Aku Sudah Tahu Gaya Belajarku
              </button> */}
            </div>

            {step === 4 && (
              <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={handleStep4Continue}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(3) }}
                  className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-dark-gray shadow"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="fixed left-8 bottom-0 select-none">
                  <Image
                    src="/images/mascot/Front-Facing-Mascot.png"
                    alt="Mascot"
                    width={500}
                    height={300}
                    priority
                  />
                </div>


                <div className="absolute left-20 bottom-80 bg-white rounded-2xl px-6 py-4 text-left shadow max-w-xl select-none">
                  <p className="text-green text-lg md:text-xl font-semibold">
                    Sebelum mulai, aku mau kasih tau kamu beberapa hal dulu nih
                  </p>
                </div>

                <p className="absolute right-8 bottom-6 text-white/90 text-sm md:text-base select-none">
                  Klik di mana saja untuk melanjutkan
                </p>
              </div>
            )}

            {step === 5 && (
              <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={handleStep5Continue}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(4) }}
                  className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-dark-gray shadow"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="fixed left-8 bottom-0 select-none">
                  <Image
                    src="/images/mascot/Front-Facing-Mascot.png"
                    alt="Mascot"
                    width={500}
                    height={300}
                    priority
                  />
                </div>

                <div className="absolute left-20 bottom-80 bg-white rounded-2xl px-6 py-4 text-left shadow max-w-xl select-none">
                  <p className="text-green text-lg md:text-xl font-semibold">
                    Nanti kamu akan baca beberapa kalimat, lalu pilih jawaban yang paling cocok dengan kamu sekarang.
                  </p>
                </div>

                <p className="absolute right-8 bottom-6 text-white/90 text-sm md:text-base select-none">
                  Klik di mana saja untuk melanjutkan
                </p>
              </div>
            )}

            {step === 6 && (
              <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={handleStep6Continue}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(5) }}
                  className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-dark-gray shadow"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="fixed left-8 bottom-0 select-none">
                  <Image
                    src="/images/mascot/Front-Facing-Mascot.png"
                    alt="Mascot"
                    width={500}
                    height={300}
                    priority
                  />
                </div>

                <div className="absolute left-20 bottom-80 bg-white rounded-2xl px-6 py-4 text-left shadow max-w-xl select-none">
                  <p className="text-green text-lg md:text-xl font-semibold">
                    Jawablah dengan jujur, karena cuma jawaban jujur yang bisa bantu kita tahu cara belajar yang paling asyik buat kamu!
                  </p>
                </div>

                <p className="absolute right-8 bottom-6 text-white/90 text-sm md:text-base select-none">
                  Klik di mana saja untuk melanjutkan
                </p>
              </div>
            )}

            {step === 7 && (
              <div
                className="fixed inset-0 bg-black/60 z-50"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(5) }}
                  className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-dark-gray shadow"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="fixed left-8 bottom-0 select-none">
                  <Image
                    src="/images/mascot/Front-Facing-Mascot.png"
                    alt="Mascot"
                    width={500}
                    height={300}
                    priority
                  />
                </div>

                <div className="absolute left-20 bottom-80 bg-white rounded-2xl px-6 py-4 text-left shadow max-w-xl select-none">
                  <p className="text-green text-lg md:text-xl font-semibold">
                    Kalau sudah siap, klik tombol Mulai Sekarang ya!
                  </p>
                </div>

                <button
                  onClick={handleStep7Continue}
                  className="absolute right-8 bottom-6 bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all"
                >
                  Mulai Sekarang!
                </button>
              </div>
            )}
          </div>
        )}

        {step === 8 && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-2xl">
                <Image
                  src="/images/mascot/mascot5.png"
                  alt="Learning Style Question"
                  width={800}
                  height={450}
                  className="rounded-2xl"
                  priority
                />
              </div>

              <h2 className="text-[#2E7D1B] font-bold text-2xl">
                {questions[currentQuestion].question}
              </h2>

              <div className="flex flex-col gap-4 w-full max-w-2xl">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option.type as LearningStyle)}
                    className="bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 9 && dominantStyle && (
          <div>
            <h2 className="text-[#6BCB2D] font-bold text-4xl mb-6 leading-snug">
              {results.find(r => r.type === dominantStyle)?.title}
            </h2>

            <div className="flex justify-center mb-8 relative">
              <Image
                src="/images/mascot/mascot4.png"
                alt="Mascot"
                width={280}
                height={180}
              />
            </div>

            <div className="mb-8 max-w-2xl mx-auto">
              <p className="text-gray-600 text-lg whitespace-pre-line">
                {results.find(r => r.type === dominantStyle)?.description}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={async () => {
                  if (dominantStyle) {
                    const success = await saveLearningStyle(dominantStyle)
                    if (success) {
                      router.push('/courses')
                    } else {
                      alert('Terjadi kesalahan saat menyimpan gaya belajar. Silakan coba lagi.')
                    }
                  }
                }}
                disabled={isSaving}
                className="w-80 bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-8 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : 'Mari Mulai Belajar'}
              </button>
              <button
                onClick={handleRetakeTest}
                className="bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold text-1xl px-8 py-3 rounded-lg border-t border-l border-r border-gray-200 border-b-4 border-b-gray-300 transition-all"
              >
                Aku Engga Yakin, Coba lagi deh
              </button>
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h2 className="text-[#6BCB2D] font-bold text-5xl mb-6 leading-snug">
              Wah asyik! Yuk, kita mulai! <br />
              Gaya belajarmu kayak gimana, nih?
            </h2>

            <div className="flex justify-center mb-8">
              <Image
                src="/images/mascot/mascot3.png"
                alt="Mascot"
                width={280}
                height={180}
                priority
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleStyleSelect('visual')}
                disabled={isSaving}
                className="w-70 bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-14 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : 'Visual'}
              </button>
              <button
                onClick={() => handleStyleSelect('auditory')}
                disabled={isSaving}
                className="w-70 bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-14 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : 'Auditori'}
              </button>
              <button
                onClick={() => handleStyleSelect('kinesthetic')}
                disabled={isSaving}
                className="w-70 bg-bright-green hover:bg-[#5AB126] border-b-4 border-green text-white font-semibold text-2xl px-14 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : 'Kinestetik'}
              </button>
              <button
                onClick={handleChangeAnswer}
                className="bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold text-1xl px-8 py-3 rounded-lg border-t border-l border-r border-gray-200 border-b-4 border-b-gray-300 transition-all"
              >
                Aku Masih Belum Tahu Gaya Belajarku
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
