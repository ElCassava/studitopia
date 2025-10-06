import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql_query: createIndexesSQL 
    })
    
    if (!indexError) {
      console.log('✅ Indexes created')
    }

    // Find existing auditory learner questions to add audio to
    const { data: auditoryQuestions, error: questionsError } = await supabase
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
      .limit(10) // Add audio for up to 10 questions

    if (questionsError) {
      console.error('Error fetching auditory questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch auditory questions' }, { status: 500 })
    }

    console.log(`Found ${auditoryQuestions?.length || 0} existing auditory questions`)

    // Add audio records for existing questions
    if (auditoryQuestions && auditoryQuestions.length > 0) {
      for (const question of auditoryQuestions) {
        const audioData = {
          question_id: question.id,
          audio_url: `https://your-bucket.storage.com/audio/questions/${question.id}.mp3`,
          bucket_path: `audio/questions/${question.id}.mp3`,
          duration: 120, // 2 minutes default
          file_size: 1500000 // ~1.5MB default
        }

        const { error: audioError } = await supabase
          .from('question_audio')
          .insert(audioData)

        if (audioError && !audioError.message.includes('duplicate key')) {
          console.error('Error inserting audio for question:', question.id, audioError)
        } else {
          console.log('✅ Added audio for question:', question.id)
        }
      }
    }

    // Create the view for easy querying
    const createViewSQL = `
      CREATE OR REPLACE VIEW public.questions_with_audio AS
      SELECT 
        tq.id as question_id,
        tq.question_text,
        tq.correct_answer,
        tq.choice_a,
        tq.choice_b,
        tq.choice_c,
        tq.choice_d,
        qa.audio_url,
        qa.duration,
        qa.file_size,
        ls.name as learning_style,
        c.course_name
      FROM public.test_questions tq
      JOIN public.test_sections ts ON tq.test_section_id = ts.id
      JOIN public.course_sections cs ON ts.course_section_id = cs.id
      JOIN public.courses c ON cs.course_id = c.id
      JOIN public.learning_styles ls ON ts.style_id = ls.id
      LEFT JOIN public.question_audio qa ON tq.id = qa.question_id
      WHERE ls.name = 'Auditory'
      ORDER BY tq.id;
    `

    const { error: viewError } = await supabase.rpc('exec_sql', { 
      sql_query: createViewSQL 
    })

    if (!viewError) {
      console.log('✅ Created questions_with_audio view')
    }

    // Verify the setup
    const { data: audioCount } = await supabase
      .from('question_audio')
      .select('id', { count: 'exact' })
      .limit(1)

    const { data: questionsWithAudio } = await supabase
      .from('questions_with_audio')
      .select('question_id, audio_url')
      .limit(5)

    console.log(`✅ Setup complete! Created audio records for questions`)

    return NextResponse.json({
      success: true,
      message: 'Simple question audio setup completed successfully!',
      data: {
        audioRecordsCreated: audioCount?.length || 0,
        questionsWithAudio: questionsWithAudio?.length || 0,
        sampleQuestions: questionsWithAudio || []
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
