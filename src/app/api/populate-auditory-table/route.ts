import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Populating auditory_questions_with_audio table...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Check if the table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('auditory_questions_with_audio')
      .select('count', { count: 'exact', head: true })

    if (tableError) {
      return NextResponse.json({
        error: 'auditory_questions_with_audio table does not exist. Please create it first.',
        tableError: tableError.message,
        instructions: {
          step1: 'Go to your Supabase dashboard > SQL Editor',
          step2: 'Run the SQL from convert_view_to_table_manual.sql',
          step3: 'Then run this API again to populate the data'
        }
      })
    }

    console.log('✅ Table exists, proceeding to populate data...')

    // Step 2: Get all auditory questions with their related data
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
      .order('id')

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

    // Step 3: Check which records already exist
    const { data: existingRecords, error: existingError } = await supabase
      .from('auditory_questions_with_audio')
      .select('question_id')

    if (existingError) {
      console.log('Warning: Could not check existing records:', existingError.message)
    }

    const existingQuestionIds = new Set(existingRecords?.map(r => r.question_id) || [])
    console.log(`Found ${existingQuestionIds.size} existing records in table`)

    // Step 4: Transform the data for insertion
    const tableRecords = auditoryData
      .filter(question => !existingQuestionIds.has(question.id)) // Skip existing records
      .map(question => {
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

    console.log(`${tableRecords.length} new records to insert`)

    if (tableRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All auditory questions are already in the table',
        data: {
          totalQuestions: auditoryData.length,
          existingRecords: existingQuestionIds.size,
          newRecords: 0
        }
      })
    }

    // Step 5: Insert the new records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('auditory_questions_with_audio')
      .insert(tableRecords)
      .select()

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert records: ' + insertError.message,
        details: insertError.details || 'No additional details available'
      }, { status: 500 })
    }

    console.log(`✅ Successfully inserted ${insertedRecords?.length || 0} records`)

    // Step 6: Get final statistics
    const { count: finalCount, error: countError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*', { count: 'exact', head: true })

    const recordsWithAudio = tableRecords.filter(r => r.audio_url).length
    const recordsWithoutAudio = tableRecords.filter(r => !r.audio_url).length

    return NextResponse.json({
      success: true,
      message: `Successfully populated auditory_questions_with_audio table with ${insertedRecords?.length || 0} new records`,
      data: {
        newRecordsInserted: insertedRecords?.length || 0,
        totalRecordsInTable: countError ? 'Unknown' : finalCount,
        totalAuditoryQuestions: auditoryData.length,
        recordsWithAudio: recordsWithAudio,
        recordsWithoutAudio: recordsWithoutAudio,
        tableStructure: {
          hasAudioIntegration: true,
          hasChoicesArray: true,
          hasCourseName: true,
          hasForeignKeys: true
        }
      },
      sampleRecords: insertedRecords?.slice(0, 3).map(record => ({
        question_id: record.question_id,
        question_preview: record.question_text?.substring(0, 60) + '...',
        course_name: record.course_name,
        has_audio: !!record.audio_url,
        choices_count: record.choices?.length || 0
      })) || []
    })

  } catch (error) {
    console.error('Error in populate-auditory-table:', error)
    return NextResponse.json({ 
      error: 'Failed to populate auditory table: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
