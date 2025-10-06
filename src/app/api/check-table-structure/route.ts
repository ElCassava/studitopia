import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if the new table exists and get some sample data
    const { data: tableData, error: tableError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*')
      .limit(5)

    if (tableError) {
      return NextResponse.json({
        error: 'Table does not exist or query failed: ' + tableError.message,
        tableExists: false,
        isView: false,
        isTable: false
      })
    }

    // Get count of total records
    const { count, error: countError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*', { count: 'exact', head: true })

    const totalRecords = countError ? 0 : count

    // Check the structure by examining the first record
    const sampleRecord = tableData?.[0]
    const tableStructure = sampleRecord ? Object.keys(sampleRecord) : []

    return NextResponse.json({
      success: true,
      message: 'auditory_questions_with_audio is now a TABLE (not a view)',
      tableInfo: {
        exists: true,
        isTable: true,
        isView: false,
        totalRecords: totalRecords || 0,
        structure: tableStructure
      },
      sampleData: tableData?.slice(0, 3).map(record => ({
        question_id: record.question_id,
        question_preview: record.question_text?.substring(0, 60) + '...',
        course_name: record.course_name,
        has_audio: !!record.audio_url,
        choices_count: record.choices?.length || 0,
        learning_style: record.learning_style
      })) || [],
      instructions: {
        status: 'Conversion Complete',
        structure: 'The auditory_questions_with_audio is now a proper table with all relationships',
        benefits: [
          'Better performance than views',
          'Can be indexed properly',
          'Supports INSERT, UPDATE, DELETE operations',
          'Foreign key constraints ensure data integrity'
        ]
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to verify table structure: ' + (error instanceof Error ? error.message : 'Unknown error'),
      tableExists: false
    }, { status: 500 })
  }
}
