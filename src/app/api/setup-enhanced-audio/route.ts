import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Setting up Enhanced Audio System...')
    
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, get the Auditory learning style ID
    const { data: auditoryStyle, error: styleError } = await supabase
      .from('learning_styles')
      .select('id')
      .eq('name', 'Auditory')
      .single()

    if (styleError || !auditoryStyle) {
      console.error('Error finding Auditory learning style:', styleError)
      return NextResponse.json({ error: 'Auditory learning style not found' }, { status: 500 })
    }

    const auditoryStyleId = auditoryStyle.id
    console.log('✅ Found Auditory learning style:', auditoryStyleId)

    // Check if question_audio table exists, if not we'll work with the existing structure
    console.log('🔍 Checking existing question_audio table structure')
    
    // Try to query the table to see if it exists
    const { data: existingAudio, error: checkError } = await supabase
      .from('question_audio')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, we need to create it manually through the database
      console.log('⚠️ question_audio table does not exist. Please create it manually in your database with the following SQL:')
      
      const createTableSQL = `
        CREATE TABLE public.question_audio (
          id uuid NOT NULL DEFAULT gen_random_uuid(),
          question_id uuid NOT NULL,
          audio_url text NOT NULL,
          bucket_path text NOT NULL,
          duration integer DEFAULT 120,
          file_size bigint DEFAULT 1500000,
          audio_title text,
          mime_type text DEFAULT 'audio/mpeg',
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          CONSTRAINT question_audio_pkey PRIMARY KEY (id),
          CONSTRAINT question_audio_question_id_fkey FOREIGN KEY (question_id) 
            REFERENCES public.test_questions(id) ON DELETE CASCADE,
          CONSTRAINT question_audio_question_id_unique UNIQUE (question_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_question_audio_question_id ON public.question_audio(question_id);
        CREATE INDEX IF NOT EXISTS idx_question_audio_created_at ON public.question_audio(created_at);
        CREATE INDEX IF NOT EXISTS idx_question_audio_bucket_path ON public.question_audio(bucket_path);
      `
      
      return NextResponse.json({ 
        error: 'Please create the question_audio table first',
        sql: createTableSQL,
        instruction: 'Run this SQL in your Supabase SQL editor, then try again'
      }, { status: 400 })
    }

    // Clear existing audio records for a fresh start
    if (!checkError) {
      const { error: deleteError } = await supabase
        .from('question_audio')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      
      if (deleteError) {
        console.warn('Warning: Could not clear existing audio records:', deleteError)
      } else {
        console.log('🗑️ Cleared existing audio records')
      }
    }

    console.log('✅ question_audio table is ready')

    // Get or create Mathematics course
    let { data: mathCourse, error: courseError } = await supabase
      .from('courses')
      .select('id, course_name')
      .eq('course_name', 'Mathematics 101')
      .single()

    if (!mathCourse) {
      const { data: newCourse, error: createCourseError } = await supabase
        .from('courses')
        .insert({
          course_name: 'Mathematics 101',
          description: 'Fundamental mathematics concepts with audio support for auditory learners'
        })
        .select('id, course_name')
        .single()

      if (createCourseError) {
        console.error('Error creating course:', createCourseError)
        return NextResponse.json({ error: 'Failed to create Mathematics course' }, { status: 500 })
      }
      
      mathCourse = newCourse
      console.log('✅ Created Mathematics course:', mathCourse?.id)
    } else {
      console.log('✅ Found existing Mathematics course:', mathCourse?.id)
    }

    if (!mathCourse) {
      return NextResponse.json({ error: 'Failed to get or create Mathematics course' }, { status: 500 })
    }

    // Create course section for tests
    const { data: courseSection, error: sectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id: mathCourse.id,
        section_type: 'test'
      })
      .select('id')
      .single()

    if (sectionError) {
      console.error('Error creating course section:', sectionError)
      return NextResponse.json({ error: 'Failed to create course section' }, { status: 500 })
    }

    console.log('✅ Created course section:', courseSection.id)

    // Create test section specifically for auditory learners
    const { data: testSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: courseSection.id,
        style_id: auditoryStyleId
      })
      .select('id')
      .single()

    if (testSectionError) {
      console.error('Error creating test section:', testSectionError)
      return NextResponse.json({ error: 'Failed to create test section' }, { status: 500 })
    }

    console.log('✅ Created test section for auditory learners:', testSection.id)

    // Enhanced auditory math questions with better structure
    const auditoryQuestions = [
      {
        question_text: 'Dengarkan soal berikut dengan seksama: "Seorang siswa memiliki 12 kelereng. Ia memberikan 1/4 dari kelerengnya kepada adiknya. Berapa kelereng yang diberikan?"',
        correct_answer: '3',
        audio_filename: 'Q1'
      },
      {
        question_text: 'Perhitungan pecahan: "Ibu membeli 3/4 kg gula dan 1/2 kg tepung. Berapa total berat belanjaan ibu dalam kg?"',
        correct_answer: '1¼',
        audio_filename: 'Q2'
      },
      {
        question_text: 'Konversi bilangan: "Ubah pecahan 2/5 menjadi bentuk desimal dan persentase!"',
        correct_answer: '0,4 dan 40%',
        audio_filename: 'Q3'
      },
      {
        question_text: 'Soal cerita: "Dalam satu kelas terdapat 20 siswa. Jika 3/5 dari siswa tersebut adalah perempuan, berapa jumlah siswa laki-laki?"',
        correct_answer: '8',
        audio_filename: 'Q4'
      },
      {
        question_text: 'Operasi campuran: "Hitung hasil dari (1/2 + 1/4) × 8!"',
        correct_answer: '6',
        audio_filename: 'Q5'
      },
      {
        question_text: 'Pemecahan masalah: "Sebuah pizza dipotong menjadi 8 bagian sama besar. Jika Andi memakan 3 potong dan Budi memakan 2 potong, berapa sisa pizza dalam bentuk pecahan?"',
        correct_answer: '3/8',
        audio_filename: 'Q6'
      },
      {
        question_text: 'Perbandingan: "Perbandingan umur Ayah dan Anak adalah 5:2. Jika umur Ayah 40 tahun, berapa umur Anak?"',
        correct_answer: '16 tahun',
        audio_filename: 'Q7'
      },
      {
        question_text: 'Persentase: "Harga sebuah buku adalah Rp 50.000. Jika mendapat diskon 20%, berapa harga yang harus dibayar?"',
        correct_answer: 'Rp 40.000',
        audio_filename: 'Q8'
      }
    ]

    // Insert test questions and create corresponding audio entries
    const insertedQuestions = []
    
    for (let i = 0; i < auditoryQuestions.length; i++) {
      const question = auditoryQuestions[i]
      
      // Insert the question
      const { data: insertedQuestion, error: questionError } = await supabase
        .from('test_questions')
        .insert({
          test_section_id: testSection.id,
          question_text: question.question_text,
          correct_answer: question.correct_answer
        })
        .select('id')
        .single()

      if (questionError) {
        console.error('Error inserting question:', questionError)
        continue
      }

      insertedQuestions.push(insertedQuestion)
      console.log('✅ Inserted question:', insertedQuestion.id)

      // Create corresponding audio entry
      const audioData = {
        question_id: insertedQuestion.id,
        audio_url: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co/storage/v1/object/public/audio-files/${question.audio_filename}.mp3`,
        bucket_path: `audio-files/${question.audio_filename}.mp3`,
        audio_title: `Audio untuk Soal ${i + 1} - Matematika`,
        duration: 30 + (i * 5), // Varying durations: 30s, 35s, 40s, etc.
        file_size: 500000 + (i * 100000), // Varying file sizes
        mime_type: 'audio/mpeg'
      }

      const { error: audioError } = await supabase
        .from('question_audio')
        .insert(audioData)

      if (audioError) {
        console.error('Error inserting audio for question:', insertedQuestion.id, audioError)
      } else {
        console.log('✅ Added audio for question:', insertedQuestion.id, `(${question.audio_filename}.mp3)`)
      }
    }

    // Create choices for each question (multiple choice format)
    for (let i = 0; i < insertedQuestions.length; i++) {
      const questionId = insertedQuestions[i].id
      const questionData = auditoryQuestions[i]
      
      // Generate sample choices based on the question type
      let choices = []
      
      switch (i) {
        case 0: // Q1 - Kelereng question
          choices = ['2', '3', '4', '5']
          break
        case 1: // Q2 - Gula tepung
          choices = ['1 kg', '1¼ kg', '1½ kg', '1¾ kg']
          break
        case 2: // Q3 - Konversi
          choices = ['0,4 dan 40%', '0,2 dan 20%', '0,6 dan 60%', '0,5 dan 50%']
          break
        case 3: // Q4 - Siswa laki-laki
          choices = ['6', '7', '8', '9']
          break
        case 4: // Q5 - Operasi campuran
          choices = ['5', '6', '7', '8']
          break
        case 5: // Q6 - Pizza
          choices = ['2/8', '3/8', '4/8', '5/8']
          break
        case 6: // Q7 - Umur
          choices = ['14 tahun', '15 tahun', '16 tahun', '17 tahun']
          break
        case 7: // Q8 - Diskon
          choices = ['Rp 35.000', 'Rp 40.000', 'Rp 45.000', 'Rp 30.000']
          break
        default:
          choices = ['A', 'B', 'C', 'D']
      }

      // Insert choices
      for (const choiceText of choices) {
        const { error: choiceError } = await supabase
          .from('test_choices')
          .insert({
            question_id: questionId,
            choice_text: choiceText
          })

        if (choiceError) {
          console.error('Error inserting choice:', choiceError)
        }
      }
    }

    console.log('✅ Added choices for all questions')

    console.log('✅ Skipping view creation (requires direct database access)')

    // Final verification and stats
    const { data: audioCount } = await supabase
      .from('question_audio')
      .select('id', { count: 'exact' })

    const { data: questionsWithAudio } = await supabase
      .from('question_audio')
      .select(`
        question_id,
        audio_url,
        bucket_path,
        audio_title,
        duration,
        test_questions!inner(question_text)
      `)
      .limit(3)

    console.log(`✅ Setup complete! Created ${insertedQuestions.length} auditory questions with audio`)

    return NextResponse.json({
      success: true,
      message: 'Enhanced audio system setup completed successfully!',
      data: {
        auditoryStyleId,
        mathCourseId: mathCourse.id,
        testSectionId: testSection.id,
        questionsCreated: insertedQuestions.length,
        audioRecordsCreated: audioCount?.length || 0,
        sampleAudioFiles: [
          'Q1.mp3 - Soal kelereng pecahan',
          'Q2.mp3 - Soal gula dan tepung',
          'Q3.mp3 - Konversi pecahan ke desimal',
          'Q4.mp3 - Soal cerita siswa',
          'Q5.mp3 - Operasi campuran',
          'Q6.mp3 - Soal pizza',
          'Q7.mp3 - Perbandingan umur',
          'Q8.mp3 - Persentase diskon'
        ],
        bucketInfo: {
          bucketName: 'audio-files',
          baseUrl: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co/storage/v1/object/public/audio-files/`,
          expectedFiles: auditoryQuestions.map(q => `${q.audio_filename}.mp3`)
        },
        questionsWithAudio: questionsWithAudio || []
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve current audio setup info
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current audio questions
    const { data: audioQuestions, error } = await supabase
      .from('question_audio')
      .select(`
        id,
        question_id,
        audio_url,
        bucket_path,
        audio_title,
        duration,
        file_size,
        test_questions!inner(
          question_text,
          correct_answer,
          test_sections!inner(
            learning_styles!inner(name)
          )
        )
      `)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      audioQuestions: audioQuestions || [],
      totalAudioFiles: audioQuestions?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to retrieve audio info: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
