import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, getSupabaseAdminClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { learningStyle = 'visual', username = 'admin' } = await request.json()
    
    console.log('🧪 Testing learning style save for:', { learningStyle, username })
    
    // Use admin client to bypass RLS since we're using custom auth
    const supabaseAdmin = getSupabaseAdminClient()
    const supabaseRegular = getSupabaseClient()
    
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Admin client not available - service role key missing' 
      }, { status: 500 })
    }
    
    const supabase = supabaseAdmin
    console.log('🔧 Using ADMIN client (bypasses RLS)')
    
    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, learning_style_id')
      .eq('username', username)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: userError 
      }, { status: 404 })
    }
    
    console.log('👤 Found user:', user)
    
    // Map frontend style names to database names
    const styleNameMap: Record<string, string> = {
      'visual': 'Visual',
      'auditory': 'Auditory', 
      'kinesthetic': 'Kinesthetic'
    }
    
    const dbStyleName = styleNameMap[learningStyle] || learningStyle
    console.log('🎨 Looking for learning style:', dbStyleName)
    
    // Get learning style ID
    const { data: style, error: styleError } = await supabase
      .from('learning_styles')
      .select('id')
      .eq('name', dbStyleName)
      .single()
    
    if (styleError || !style) {
      return NextResponse.json({ 
        error: 'Learning style not found',
        details: styleError 
      }, { status: 404 })
    }
    
    console.log('✅ Found learning style ID:', style.id)
    
    // Update user's learning style using admin client to bypass RLS
    console.log('💾 Updating user learning style in database...')
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ learning_style_id: style.id })
      .eq('id', user.id)
      .select('id, username, learning_style_id, learning_styles(name)')
    
    if (updateError) {
      console.error('❌ Failed to update user learning style:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update learning style',
        details: updateError 
      }, { status: 500 })
    }
    
    console.log('✅ Successfully updated user:', updateResult)
    
    return NextResponse.json({
      success: true,
      message: 'Learning style saved successfully',
      originalUser: user,
      updatedUser: updateResult[0],
      learningStyle: dbStyleName,
      styleId: style.id
    })
    
  } catch (error) {
    console.error('❌ Error in test endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}
