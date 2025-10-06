import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { confirmNuke } = await request.json()
    
    if (!confirmNuke) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }
    
    console.log('💥 Nuclear cleanup of all course content...')
    const supabase = getSupabaseClient()
    
    const deletedItems = []
    
    // Delete in proper order to avoid foreign key constraints
    const tables = [
      'quiz_attempt_details',
      'quiz_attempts', 
      'test_attempt_details',
      'test_attempts',
      'user_section_progress',
      'learn_contents',
      'quiz_contents', 
      'test_choices',
      'test_questions',
      'learn_sections',
      'test_sections',
      'quiz_sections',
      'course_sections'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000')
          
        if (error) {
          console.warn(`Warning deleting from ${table}:`, error.message)
        } else {
          deletedItems.push(`Cleaned ${table}`)
          console.log(`✅ Cleaned ${table}`)
        }
      } catch (e) {
        console.warn(`Error with table ${table}:`, e)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Nuclear cleanup completed',
      deletedItems
    })
    
  } catch (error) {
    console.error('Nuclear cleanup error:', error)
    return NextResponse.json({ 
      error: 'Nuclear cleanup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
