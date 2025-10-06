import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all records from auditory_questions_with_audio table
    const { data: auditoryRecords, error: auditoryError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*')
      .order('question_id')

    if (auditoryError) {
      return NextResponse.json({
        error: 'Failed to fetch auditory records: ' + auditoryError.message
      }, { status: 500 })
    }

    // Get structure info from first record
    const sampleRecord = auditoryRecords?.[0]
    const tableStructure = sampleRecord ? Object.keys(sampleRecord) : []

    // Summary statistics
    const recordsWithAudio = auditoryRecords?.filter(r => r.audio_url) || []
    const recordsWithoutAudio = auditoryRecords?.filter(r => !r.audio_url) || []

    // Course breakdown
    const courseBreakdown = auditoryRecords?.reduce((acc, record) => {
      const course = record.course_name || 'Unknown'
      acc[course] = (acc[course] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      success: true,
      tableInfo: {
        totalRecords: auditoryRecords?.length || 0,
        recordsWithAudio: recordsWithAudio.length,
        recordsWithoutAudio: recordsWithoutAudio.length,
        tableStructure: tableStructure,
        courseBreakdown: courseBreakdown
      },
      sampleRecords: auditoryRecords?.slice(0, 5).map(record => ({
        id: record.id,
        question_id: record.question_id,
        question_preview: record.question_text?.substring(0, 80) + '...',
        course_name: record.course_name,
        has_audio: !!record.audio_url,
        audio_file: record.bucket_path?.split('/').pop() || null,
        choices_count: record.choices?.length || 0,
        learning_style: record.learning_style,
        created_at: record.created_at
      })) || [],
      audioMapping: recordsWithAudio.slice(0, 10).map(record => ({
        filename: record.bucket_path?.split('/').pop() || 'N/A',
        question_preview: record.question_text?.substring(0, 60) + '...',
        course: record.course_name
      }))
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to view auditory table: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
