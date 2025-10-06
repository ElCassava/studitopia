import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get session to find current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get user details including learning style
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, learning_styles:learning_style_id(*)')
      .eq('id', session.user.id)
      .single()
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        learning_style_id: user.learning_style_id,
        learning_style: user.learning_styles
      }
    })
    
  } catch (error) {
    console.error('Error in debug-user-learning-style:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
