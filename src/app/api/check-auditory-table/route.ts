import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if auditory_questions_with_audio table exists
    const { data: tableData, error: tableError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        tableExists: false,
        error: tableError.message,
        isView: tableError.message.includes('view'),
        needsCreation: true
      })
    }

    // Get record count
    const { count, error: countError } = await supabase
      .from('auditory_questions_with_audio')
      .select('*', { count: 'exact', head: true })

    // Check question_audio table
    const { count: audioCount, error: audioError } = await supabase
      .from('question_audio')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      tableExists: true,
      isTable: true,
      currentRecords: countError ? 0 : count,
      audioRecords: audioError ? 0 : audioCount,
      status: 'ready_for_population'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check table status: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
