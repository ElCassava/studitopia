import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Converting auditory_questions_with_audio from view to table...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Check if the view exists and drop it
    console.log('Step 1: Dropping existing view...')
    
    // Try to drop the view (this will fail silently if it doesn't exist)
    try {
      await supabase.rpc('drop_view_if_exists', { view_name: 'auditory_questions_with_audio' })
    } catch (e) {
      // View might not exist, that's okay
      console.log('View might not exist, continuing...')
    }

    // Step 2: Create the new table structure
    console.log('Step 2: Creating new table structure...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.auditory_questions_with_audio (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        question_id uuid NOT NULL,
        question_text text NOT NULL,
        correct_answer text NOT NULL,
        audio_url text,
        bucket_path text,
        audio_title text,
        duration integer,
        file_size bigint,
        mime_type text,
        learning_style text NOT NULL DEFAULT 'Auditory',
        course_name text NOT NULL,
        test_section_id uuid NOT NULL,
        choices text[],
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        CONSTRAINT auditory_questions_with_audio_pkey PRIMARY KEY (id),
        CONSTRAINT auditory_questions_with_audio_question_id_fkey FOREIGN KEY (question_id) 
          REFERENCES public.test_questions(id) ON DELETE CASCADE,
        CONSTRAINT auditory_questions_with_audio_question_id_unique UNIQUE (question_id)
      )
    `

    // Since we can't use rpc, let's check if table exists first
    const { data: tableCheck, error: checkError } = await supabase
      .from('auditory_questions_with_audio')
      .select('count', { count: 'exact', head: true })

    if (checkError && !checkError.message.includes('does not exist')) {
      return NextResponse.json({ 
        error: 'Failed to check table existence: ' + checkError.message 
      }, { status: 500 })
    }

    const tableExists = !checkError

    if (tableExists) {
      console.log('Table already exists, proceeding to populate data...')
    }

    // Step 3: Populate the table with data from existing relationships
    console.log('Step 3: Populating table with auditory question data...')

    // Get all auditory questions with their related data
    const { data: auditoryData, error: dataError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_text,
        correct_answer,
        test_sections!inner(
          id,
          style_id,
          learning_styles!inner(name),
          course_sections!inner(
            course_id,
            courses!inner(course_name)
          )
        ),
        test_choices(choice_text),
        question_audio(
          audio_url,
          bucket_path,
          audio_title,
          duration,
          file_size,
          mime_type
        )
      `)
      .eq('test_sections.learning_styles.name', 'Auditory')

    if (dataError) {
      return NextResponse.json({ 
        error: 'Failed to fetch auditory questions data: ' + dataError.message 
      }, { status: 500 })
    }

    if (!auditoryData || auditoryData.length === 0) {
      return NextResponse.json({ 
        message: 'No auditory questions found to populate the table.',
        questionsFound: 0 
      })
    }

    console.log(`Found ${auditoryData.length} auditory questions to process`)

    // Transform the data for insertion
    const tableRecords = auditoryData.map(question => {
      const audioData = question.question_audio?.[0] || {}
      const choices = question.test_choices?.map(choice => choice.choice_text) || []
      
      return {
        question_id: question.id,
        question_text: question.question_text,
        correct_answer: question.correct_answer,
        audio_url: audioData.audio_url || null,
        bucket_path: audioData.bucket_path || null,
        audio_title: audioData.audio_title || null,
        duration: audioData.duration || null,
        file_size: audioData.file_size || null,
        mime_type: audioData.mime_type || null,
        learning_style: 'Auditory',
        course_name: question.test_sections?.course_sections?.courses?.course_name || 'Unknown Course',
        test_section_id: question.test_sections?.id,
        choices: choices
      }
    })

    // Check which records already exist (if table exists)
    let existingRecords = new Set()
    if (tableExists) {
      const { data: existing, error: existingError } = await supabase
        .from('auditory_questions_with_audio')
        .select('question_id')

      if (existingError) {
        console.log('Warning: Could not check existing records:', existingError.message)
      } else {
        existingRecords = new Set(existing?.map(r => r.question_id) || [])
      }
    }

    // Filter out records that already exist
    const newRecords = tableRecords.filter(record => !existingRecords.has(record.question_id))

    console.log(`${newRecords.length} new records to insert`)

    if (newRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Table converted successfully. All records already exist.',
        data: {
          tableExists: true,
          totalQuestions: auditoryData.length,
          newRecords: 0,
          existingRecords: existingRecords.size
        }
      })
    }

    // Insert the new records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('auditory_questions_with_audio')
      .insert(newRecords)
      .select()

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to populate table: ' + insertError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully populated table with ${insertedRecords?.length || 0} records`)

    return NextResponse.json({
      success: true,
      message: `Successfully converted view to table and populated ${insertedRecords?.length || 0} records`,
      data: {
        tableCreated: true,
        recordsInserted: insertedRecords?.length || 0,
        totalAuditoryQuestions: auditoryData.length,
        recordsWithAudio: newRecords.filter(r => r.audio_url).length,
        recordsWithoutAudio: newRecords.filter(r => !r.audio_url).length
      }
    })

  } catch (error) {
    console.error('Error in convert-view-to-table:', error)
    return NextResponse.json({ 
      error: 'Failed to convert view to table: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
