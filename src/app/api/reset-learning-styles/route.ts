// API to reset some users' learning styles for testing
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Reset learning styles for some test users
    const { error } = await supabase
      .from('users')
      .update({ learning_style_id: null })
      .in('username', ['student1', 'student2', 'student3', 'teacher1', 'admin'])
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reset learning styles for test users'
    })
    
  } catch (error) {
    console.error('Error resetting learning styles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
