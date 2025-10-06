import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Setting up Simple Question Audio...')
    
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create simple question_audio table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.question_audio (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        question_id uuid NOT NULL,
        audio_url text NOT NULL,
        bucket_path text NOT NULL,
        duration integer,
        file_size bigint,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        CONSTRAINT question_audio_pkey PRIMARY KEY (id),
        CONSTRAINT question_audio_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.test_questions(id) ON DELETE CASCADE,
        CONSTRAINT question_audio_question_id_unique UNIQUE (question_id)
      );
    `

    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    })

    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating question_audio table:', tableError)
      return NextResponse.json({ error: 'Failed to create question_audio table' }, { status: 500 })
    } else {
      console.log('✅ Question audio table ready')
    }

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_question_audio_question_id ON public.question_audio(question_id);
      CREATE INDEX IF NOT EXISTS idx_question_audio_created_at ON public.question_audio(created_at);
    `

    await supabase.rpc('exec_sql', { sql_query: createIndexesSQL })
    console.log('✅ Indexes created')

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
          description: 'Fundamental mathematics concepts including fractions, decimals, and percentages'
        })
        .select('id')
        .single()

      if (createCourseError) {
        console.error('Error creating course:', createCourseError)
        return NextResponse.json({ error: 'Failed to create Mathematics course' }, { status: 500 })
      }
      
      mathCourse = newCourse
      console.log('✅ Created Mathematics course:', mathCourse.id)
    } else {
      console.log('✅ Found existing Mathematics course:', mathCourse.id)
    }

    // Create course section
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

    // Create test section for auditory learners
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

    console.log('✅ Created test section:', testSection.id)

    // Sample auditory math questions
    const auditoryQuestions = [
      {
        question_text: 'Dengarkan soal berikut: "Ibu membeli satu kue dan membaginya jadi 4 potong yang sama besar. Budi memakan 2 potong. Berapa bagian kue yang dimakan Budi?"',
        correct_answer: 'B',
        choice_a: '¼',
        choice_b: '²⁄₄', 
        choice_c: '¾',
        choice_d: '⁴⁄₄'
      },
      {
        question_text: 'Dengarkan dengan seksama: "Berapa hasil dari 23 ditambah 43?" Sebutkan jawabannya.',
        correct_answer: '66',
        choice_a: '64',
        choice_b: '65',
        choice_c: '66',
        choice_d: '67'
      },
      {
        question_text: 'Perhitungan persentase: "75% dari 200 gram itu berapa gram?" Hitung dengan teliti.',
        correct_answer: '150',
        choice_a: '140',
        choice_b: '150',
        choice_c: '160',
        choice_d: '170'
      },
      {
        question_text: 'Konversi pecahan: "Ubah pecahan ¾ menjadi bentuk desimal." Sebutkan hasilnya.',
        correct_answer: '0,75',
        choice_a: '0,70',
        choice_b: '0,75',
        choice_c: '0,80',
        choice_d: '0,85'
      }
    ]

    // Insert test questions
    for (const question of auditoryQuestions) {
      const { data: insertedQuestion, error: questionError } = await supabase
        .from('test_questions')
        .insert({
          test_section_id: testSection.id,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          choice_a: question.choice_a,
          choice_b: question.choice_b,
          choice_c: question.choice_c,
          choice_d: question.choice_d
        })
        .select('id')
        .single()

      if (questionError) {
        console.error('Error inserting question:', questionError)
      } else {
        console.log('✅ Inserted question:', insertedQuestion.id)
      }
    }

    // Insert sample audio content
    const audioContents = [
      {
        title: 'Pengenalan Pecahan - Audio',
        description: 'Penjelasan audio tentang konsep dasar pecahan untuk auditory learners',
        audio_url: 'https://your-bucket.storage.com/audio/fractions-intro.mp3',
        bucket_path: 'audio/lessons/fractions-intro.mp3',
        learning_style_id: auditoryStyleId,
        content_type: 'lesson',
        duration: 180,
        file_size: 2500000
      },
      {
        title: 'Instruksi Soal Matematika',
        description: 'Audio instruksi untuk mengerjakan soal-soal matematika',
        audio_url: 'https://your-bucket.storage.com/audio/math-instructions.mp3',
        bucket_path: 'audio/instructions/math-instructions.mp3',
        learning_style_id: auditoryStyleId,
        content_type: 'instruction',
        duration: 120,
        file_size: 1800000
      }
    ]

    for (const audio of audioContents) {
      const { error: audioError } = await supabase
        .from('audio_contents')
        .insert(audio)

      if (audioError) {
        console.error('Error inserting audio content:', audioError)
      } else {
        console.log('✅ Inserted audio content:', audio.title)
      }
    }

    // Final verification
    const { data: finalQuestions, error: finalError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_text,
        test_sections!inner(
          style_id,
          learning_styles!inner(name)
        )
      `)
      .eq('test_sections.learning_styles.name', 'Auditory')

    console.log(`✅ Setup complete! Created ${finalQuestions?.length || 0} auditory test questions`)

    return NextResponse.json({
      success: true,
      message: 'Auditory learner content setup completed successfully!',
      data: {
        auditoryStyleId,
        mathCourseId: mathCourse.id,
        testSectionId: testSection.id,
        questionsCreated: finalQuestions?.length || 0
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed: ' + error.message }, { status: 500 })
  }
}
