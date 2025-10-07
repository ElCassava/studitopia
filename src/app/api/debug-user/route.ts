import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user from auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔍 Auth user:', authUser)
    console.log('🔍 Auth error:', authError)
    
    if (!authUser) {
      return NextResponse.json({ 
        error: 'No authenticated user found',
        authUser: null,
        dbUser: null 
      })
    }
    
    // Get user from database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, username, learning_style_id, learning_styles(name)')
      .eq('id', authUser.id)
      .single()
    
    console.log('🔍 DB user:', dbUser)
    console.log('🔍 DB error:', dbError)
    
    return NextResponse.json({
      authUser: {
        id: authUser.id,
        email: authUser.email,
        aud: authUser.aud,
        role: authUser.role
      },
      dbUser,
      dbError,
      success: true
    })
    
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}
