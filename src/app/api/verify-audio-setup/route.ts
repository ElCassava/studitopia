import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all audio records with their question details
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
        created_at,
        test_questions!inner(
          question_text,
          correct_answer,
          test_sections!inner(
            learning_styles!inner(name),
            course_sections!inner(
              courses!inner(course_name)
            )
          )
        )
      `)
      .order('bucket_path')

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch audio records: ' + error.message 
      }, { status: 500 })
    }

    // Filter for auditory learning style only
    const auditoryAudioRecords = (audioRecords || []).filter(record => 
      record.test_questions?.test_sections?.learning_styles?.name === 'Auditory'
    )

    // Create a summary of the audio setup
    const audioSummary = auditoryAudioRecords.map((record, index) => {
      const questionText = record.test_questions?.question_text || 'Unknown question'
      const courseName = record.test_questions?.test_sections?.course_sections?.courses?.course_name || 'Unknown course'
      
      return {
        audioNumber: index + 1,
        filename: record.bucket_path.split('/').pop(),
        questionId: record.question_id,
        questionPreview: questionText.length > 80 ? questionText.substring(0, 80) + '...' : questionText,
        courseName,
        correctAnswer: record.test_questions?.correct_answer,
        audioTitle: record.audio_title,
        bucketPath: record.bucket_path,
        audioUrl: record.audio_url,
        duration: record.duration,
        fileSize: record.file_size,
        createdAt: record.created_at
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Audio records retrieved successfully',
      summary: {
        totalAudioRecords: auditoryAudioRecords.length,
        bucketName: 'audio-files',
        tableExists: true,
        allQuestionsHaveAudio: auditoryAudioRecords.length > 0
      },
      audioFiles: audioSummary,
      instructions: {
        uploadLocation: 'Supabase Storage > audio-files bucket',
        filenamePattern: 'Q1.mp3, Q2.mp3, Q3.mp3, ..., Q22.mp3',
        note: 'Each audio file corresponds to a specific test question for auditory learners'
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to verify audio setup: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
