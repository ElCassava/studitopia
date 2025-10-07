import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { learningStyle } = await request.json()
    
    if (!learningStyle) {
      return NextResponse.json({ 
        error: 'Learning style is required' 
      }, { status: 400 })
    }
    
    console.log('🚀 API: Saving learning style:', learningStyle)
    
    // Get authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.error('❌ API: No valid authorization header')
      return NextResponse.json({ 
        error: 'Authorization required' 
      }, { status: 401 })
    }
    
    const token = authorization.replace('Bearer ', '')
    console.log('✅ API: Found authorization token')
    
    const supabase = getSupabaseClient()
    
    // Set the session using the provided token
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authUser) {
      console.error('❌ API: Authentication failed:', authError)
      return NextResponse.json({ 
        error: 'User not authenticated',
        details: authError 
      }, { status: 401 })
    }
    
    console.log('✅ API: Authenticated user:', authUser.id)
    
    // Map frontend style names to database names
    const styleNameMap: Record<string, string> = {
      'visual': 'Visual',
      'auditory': 'Auditory', 
      'kinesthetic': 'Kinesthetic'
    }
    
    const dbStyleName = styleNameMap[learningStyle] || learningStyle
    
    // Get learning style ID
    const { data: style, error: styleError } = await supabase
      .from('learning_styles')
      .select('id')
      .eq('name', dbStyleName)
      .single()
    
    if (styleError || !style) {
      console.error('❌ API: Could not find learning style:', styleError)
      return NextResponse.json({ 
        error: 'Learning style not found',
        details: styleError 
      }, { status: 404 })
    }
    
    console.log('✅ API: Found learning style ID:', style.id)
    
    // Update user's learning style
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ learning_style_id: style.id })
      .eq('id', authUser.id)
      .select('id, username, learning_style_id, learning_styles(name)')
    
    if (updateError) {
      console.error('❌ API: Failed to update user:', updateError)
      return NextResponse.json({ 
        error: 'Failed to save learning style',
        details: updateError 
      }, { status: 500 })
    }
    
    console.log('✅ API: Successfully updated user:', updateResult)
    
    return NextResponse.json({
      success: true,
      message: 'Learning style saved successfully',
      user: updateResult[0],
      learningStyle: dbStyleName
    })
    
  } catch (error) {
    console.error('❌ API: Server error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}
