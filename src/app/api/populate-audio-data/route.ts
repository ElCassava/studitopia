import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Populating Audio Data for Existing Questions...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the Auditory learning style ID
    const { data: auditoryStyle, error: styleError } = await supabase
      .from('learning_styles')
      .select('id')
      .eq('name', 'Auditory')
      .single()

    if (styleError || !auditoryStyle) {
      return NextResponse.json({ error: 'Auditory learning style not found' }, { status: 500 })
    }

    // Find all test questions for auditory learners that don't have audio yet
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
        message: 'No auditory questions found. Please run setup-enhanced-audio first.',
        questionsFound: 0 
      })
    }

    console.log(`Found ${auditoryQuestions.length} auditory questions`)

    // Create audio records for each question
    const audioRecords = []
    
    for (let i = 0; i < auditoryQuestions.length; i++) {
      const question = auditoryQuestions[i]
      const audioNumber = i + 1
      
      // Generate audio filename based on question order
      const audioFilename = `Q${audioNumber}`
      
      // Create a descriptive title based on question content
      let audioTitle = `Audio Soal ${audioNumber}`
      if (question.question_text.includes('kelereng')) {
        audioTitle = `Audio Soal ${audioNumber} - Pecahan Kelereng`
      } else if (question.question_text.includes('gula')) {
        audioTitle = `Audio Soal ${audioNumber} - Penjumlahan Pecahan`
      } else if (question.question_text.includes('desimal')) {
        audioTitle = `Audio Soal ${audioNumber} - Konversi Pecahan`
      } else if (question.question_text.includes('siswa')) {
        audioTitle = `Audio Soal ${audioNumber} - Cerita Matematika`
      } else if (question.question_text.includes('pizza')) {
        audioTitle = `Audio Soal ${audioNumber} - Sisa Pecahan`
      } else if (question.question_text.includes('perbandingan')) {
        audioTitle = `Audio Soal ${audioNumber} - Perbandingan`
      } else if (question.question_text.includes('diskon')) {
        audioTitle = `Audio Soal ${audioNumber} - Persentase`
      }

      const audioData = {
        question_id: question.id,
        audio_url: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co/storage/v1/object/public/audio-files/${audioFilename}.mp3`,
        bucket_path: `audio-files/${audioFilename}.mp3`,
        audio_title: audioTitle,
        duration: 25 + (audioNumber * 5), // Varying durations: 30s, 35s, 40s, etc.
        file_size: 400000 + (audioNumber * 80000), // Varying file sizes based on duration
        mime_type: 'audio/mpeg'
      }

      // Check if audio already exists for this question
      const { data: existingAudio } = await supabase
        .from('question_audio')
        .select('id')
        .eq('question_id', question.id)
        .single()

      if (!existingAudio) {
        const { error: audioError } = await supabase
          .from('question_audio')
          .insert(audioData)

        if (audioError) {
          console.error('Error inserting audio for question:', question.id, audioError)
        } else {
          audioRecords.push({
            questionId: question.id,
            filename: `${audioFilename}.mp3`,
            title: audioTitle,
            url: audioData.audio_url
          })
          console.log('✅ Added audio for question:', question.id, `(${audioFilename}.mp3)`)
        }
      } else {
        console.log('⏭️ Audio already exists for question:', question.id)
      }
    }

    // Verify the final setup
    const { data: allAudioRecords } = await supabase
      .from('question_audio')
      .select(`
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
      .eq('test_questions.test_sections.learning_styles.name', 'Auditory')

    console.log(`✅ Audio population complete! Total audio files: ${allAudioRecords?.length || 0}`)

    return NextResponse.json({
      success: true,
      message: 'Audio data populated successfully!',
      data: {
        questionsProcessed: auditoryQuestions.length,
        audioRecordsCreated: audioRecords.length,
        totalAudioFiles: allAudioRecords?.length || 0,
        bucketInfo: {
          bucketName: 'audio-files',
          baseUrl: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co/storage/v1/object/public/audio-files/`,
          expectedFiles: audioRecords.map(r => r.filename)
        },
        createdAudioFiles: audioRecords,
        allAudioRecords: allAudioRecords || []
      }
    })

  } catch (error) {
    console.error('Audio population error:', error)
    return NextResponse.json({ 
      error: 'Audio population failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
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

    // Check if question_audio table exists and get current records
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
          correct_answer,
          test_sections!inner(
            learning_styles!inner(name)
          )
        )
      `)

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        tableExists: false,
        suggestion: 'Please run the SQL script to create the question_audio table first'
      }, { status: 400 })
    }

    const auditoryAudioRecords = audioRecords?.filter(record => 
      record.test_questions?.test_sections?.learning_styles?.name === 'Auditory'
    ) || []

    return NextResponse.json({
      success: true,
      tableExists: true,
      totalAudioRecords: audioRecords?.length || 0,
      auditoryAudioRecords: auditoryAudioRecords.length,
      audioFiles: auditoryAudioRecords.map((record: any) => ({
        questionId: record.question_id,
        audioUrl: record.audio_url,
        bucketPath: record.bucket_path,
        title: record.audio_title,
        duration: record.duration,
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
