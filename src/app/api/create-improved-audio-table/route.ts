import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating improved audio table...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('question_audio')
      .select('count', { count: 'exact', head: true })

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'question_audio table already exists',
        tableExists: true,
        currentRecords: 0
      })
    }

    // If table doesn't exist, we need to create it manually
    // Since we can't use exec_sql, let's create it through the Supabase dashboard
    // For now, return instructions
    
    return NextResponse.json({
      success: false,
      message: 'Please create the question_audio table manually in your Supabase dashboard',
      instructions: {
        step1: 'Go to your Supabase dashboard > SQL Editor',
        step2: 'Run the SQL from create_improved_audio_table.sql file',
        step3: 'The table will have proper foreign key relationships to test_questions',
        sqlFile: 'create_improved_audio_table.sql'
      },
      tableExists: false
    })

  } catch (error) {
    console.error('Error in create-improved-audio-table:', error)
    return NextResponse.json({ 
      error: 'Failed to create improved audio table: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
