import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Creating audio records for auditory questions...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all auditory test questions
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
      .order('id')

    if (questionsError) {
      console.error('Error fetching auditory questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch auditory questions: ' + questionsError.message }, { status: 500 })
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

    if (audioError) {
      console.error('Error checking existing audio:', audioError)
      return NextResponse.json({ error: 'Failed to check existing audio: ' + audioError.message }, { status: 500 })
    }

    const existingAudioQuestionIds = new Set(existingAudio?.map(a => a.question_id) || [])

    // Filter out questions that already have audio
    const questionsNeedingAudio = auditoryQuestions.filter(
      q => !existingAudioQuestionIds.has(q.id)
    )

    console.log(`${questionsNeedingAudio.length} new questions need audio files`)

    if (questionsNeedingAudio.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'All auditory questions already have audio files',
        totalQuestions: auditoryQuestions.length,
        questionsWithAudio: existingAudioQuestionIds.size,
        bucketName: 'audio-files'
      })
    }

    // Create audio records for each question using your bucket name "audio-files"
    const audioRecords = []
    
    for (let i = 0; i < questionsNeedingAudio.length; i++) {
      const question = questionsNeedingAudio[i]
      const audioNumber = existingAudioQuestionIds.size + i + 1 // Continue numbering from existing
      
      // Generate audio filename based on question order (Q1, Q2, Q3, etc.)
      const audioFilename = `Q${audioNumber}`
      
      // Create a descriptive title based on question content
      const shortQuestion = question.question_text.length > 50 
        ? question.question_text.substring(0, 50) + '...'
        : question.question_text
      
      const audioRecord = {
        question_id: question.id,
        audio_url: `https://erozhukurioezrygpmtt.supabase.co/storage/v1/object/public/audio-files/${audioFilename}.mp3`,
        bucket_path: `audio-files/${audioFilename}.mp3`,
        duration: 120, // 2 minutes default duration
        file_size: 1500000, // ~1.5MB default size
        audio_title: `${audioFilename}: ${shortQuestion}`,
        mime_type: 'audio/mpeg'
      }
      
      audioRecords.push(audioRecord)
    }

    // Insert the audio records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('question_audio')
      .insert(audioRecords)
      .select()

    if (insertError) {
      console.error('Error inserting audio records:', insertError)
      return NextResponse.json({ error: 'Failed to insert audio records: ' + insertError.message }, { status: 500 })
    }

    console.log(`✅ Successfully created ${insertedRecords?.length || 0} audio records`)

    return NextResponse.json({
      success: true,
      message: `Successfully created audio records for ${insertedRecords?.length || 0} auditory questions`,
      data: {
        newAudioRecords: insertedRecords?.length || 0,
        totalAuditoryQuestions: auditoryQuestions.length,
        totalAudioRecords: existingAudioQuestionIds.size + (insertedRecords?.length || 0),
        bucketName: 'audio-files',
        audioFiles: audioRecords.map((record, index) => ({
          questionId: record.question_id,
          filename: `Q${existingAudioQuestionIds.size + index + 1}.mp3`,
          audioUrl: record.audio_url,
          bucketPath: record.bucket_path,
          title: record.audio_title
        })),
        instructions: {
          nextStep: 'Upload your MP3 files to the audio-files bucket with the filenames shown above',
          bucketPath: 'audio-files/',
          filenamePattern: 'Q1.mp3, Q2.mp3, Q3.mp3, etc.',
          totalFilesNeeded: existingAudioQuestionIds.size + (insertedRecords?.length || 0)
        }
      }
    })

  } catch (error) {
    console.error('Error in create-audio-records:', error)
    return NextResponse.json({ 
      error: 'Failed to create audio records: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
