import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all learning styles
    const { data: learningStyles, error } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Find auditory learning style specifically
    const auditoryStyle = learningStyles?.find(style => 
      style.name.toLowerCase().includes('auditory') || 
      style.name.toLowerCase().includes('audio')
    )
    
    return NextResponse.json({ 
      success: true,
      learningStyles: learningStyles || [],
      auditoryStyle: auditoryStyle || null,
      total: learningStyles?.length || 0
    })
    
  } catch (error) {
    console.error('Error fetching learning styles:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
