import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Populating Audio Data for Auditory Test Questions...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all auditory test questions that don't have audio yet
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

    if (questionsError) {
      console.error('Error fetching auditory questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch auditory questions' }, { status: 500 })
    }

    if (!auditoryQuestions || auditoryQuestions.length === 0) {
      return NextResponse.json({ 
        message: 'No auditory questions found. Please create auditory test sections first.',
        questionsFound: 0 
      })
    }

    console.log(`Found ${auditoryQuestions.length} auditory questions`)

    // Check which questions already have audio
    const { data: existingAudio, error: audioError } = await supabase
      .from('question_audio')
      .select('question_id')

    if (audioError && !audioError.message.includes('does not exist')) {
      console.error('Error checking existing audio:', audioError)
      return NextResponse.json({ error: 'Failed to check existing audio' }, { status: 500 })
    }

    const existingAudioQuestionIds = new Set(existingAudio?.map(a => a.question_id) || [])

    // Filter out questions that already have audio
    const questionsNeedingAudio = auditoryQuestions.filter(
      q => !existingAudioQuestionIds.has(q.id)
    )

    console.log(`${questionsNeedingAudio.length} questions need audio files`)

    if (questionsNeedingAudio.length === 0) {
      return NextResponse.json({ 
        message: 'All auditory questions already have audio files',
        totalQuestions: auditoryQuestions.length,
        questionsWithAudio: existingAudioQuestionIds.size
      })
    }

    // Create audio records for each question
    const audioRecords = []
    
    for (let i = 0; i < questionsNeedingAudio.length; i++) {
      const question = questionsNeedingAudio[i]
      const audioNumber = i + 1
      
      // Generate audio filename based on question order (Q1, Q2, Q3, etc.)
      const audioFilename = `Q${audioNumber}`
      
      // Create a descriptive title based on question content
      const shortQuestion = question.question_text.length > 50 
        ? question.question_text.substring(0, 50) + '...'
        : question.question_text
      
      const audioRecord = {
        question_id: question.id,
        audio_url: `https://your-supabase-storage-url/storage/v1/object/public/audio-files/${audioFilename}.mp3`,
        bucket_path: `audio-files/${audioFilename}.mp3`,
        duration: 120, // 2 minutes default duration
        file_size: 1500000, // ~1.5MB default size
        audio_title: `${audioFilename}: ${shortQuestion}`,
        mime_type: 'audio/mpeg'
      }
      
      audioRecords.push(audioRecord)
    }

    // Insert all audio records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('question_audio')
      .insert(audioRecords)
      .select()

    if (insertError) {
      console.error('Error inserting audio records:', insertError)
      return NextResponse.json({ error: 'Failed to insert audio records: ' + insertError.message }, { status: 500 })
    }

    console.log(`✅ Successfully created ${insertedRecords?.length || 0} audio records`)

    // Get final statistics
    const { data: allAudio, error: statsError } = await supabase
      .from('question_audio')
      .select(`
        id,
        question_id,
        audio_url,
        bucket_path,
        audio_title,
        duration,
        test_questions!inner(
          question_text,
          test_sections!inner(
            learning_styles!inner(name)
          )
        )
      `)

    if (statsError) {
      console.error('Error getting final stats:', statsError)
    }

    const auditoryAudioRecords = (allAudio || []).filter(record => 
      record.test_questions?.test_sections?.learning_styles?.name === 'Auditory'
    )

    return NextResponse.json({
      success: true,
      message: `Successfully created audio records for ${insertedRecords?.length || 0} auditory questions`,
      data: {
        newAudioRecords: insertedRecords?.length || 0,
        totalAuditoryQuestions: auditoryQuestions.length,
        totalAudioRecords: auditoryAudioRecords.length,
        bucketName: 'audio-files',
        audioFiles: audioRecords.map((record, index) => ({
          questionId: record.question_id,
          filename: `Q${index + 1}.mp3`,
          audioUrl: record.audio_url,
          bucketPath: record.bucket_path,
          title: record.audio_title
        }))
      }
    })

  } catch (error) {
    console.error('Error in populate-improved-audio-data:', error)
    return NextResponse.json({ 
      error: 'Failed to populate audio data: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}

// GET endpoint to check current audio setup
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if question_audio table exists and get data
    const { data: audioRecords, error } = await supabase
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
          test_sections!inner(
            learning_styles!inner(name)
          )
        )
      `)

    if (error) {
      return NextResponse.json({ 
        error: 'Table does not exist or query failed: ' + error.message,
        tableExists: false,
        suggestion: 'Please run the SQL script to create the question_audio table first'
      })
    }

    const auditoryAudioRecords = (audioRecords || []).filter(record => 
      record.test_questions?.test_sections?.learning_styles?.name === 'Auditory'
    )

    return NextResponse.json({
      success: true,
      tableExists: true,
      totalAudioRecords: audioRecords?.length || 0,
      auditoryAudioRecords: auditoryAudioRecords.length,
      bucketName: 'audio-files',
      audioFiles: auditoryAudioRecords.map((record: any, index: number) => ({
        questionId: record.question_id,
        filename: `Q${index + 1}.mp3`,
        audioUrl: record.audio_url,
        bucketPath: record.bucket_path,
        title: record.audio_title,
        duration: record.duration,
        fileSize: record.file_size,
        questionText: record.test_questions?.question_text?.substring(0, 100) + '...'
      }))
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check audio setup: ' + (error instanceof Error ? error.message : 'Unknown error'),
      tableExists: false
    }, { status: 500 })
  }
}
