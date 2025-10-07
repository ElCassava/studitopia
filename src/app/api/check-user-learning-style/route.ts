import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || 'admin'
    
    const supabase = getSupabaseClient()
    
    // Get user's current learning style
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        learning_style_id,
        learning_styles:learning_style_id(
          id,
          name,
          description
        )
      `)
      .eq('username', username)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    console.error('Error checking user learning style:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
