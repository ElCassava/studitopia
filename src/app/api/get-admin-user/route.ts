import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get the admin user to test with
    const { data: adminUser, error: adminError } = await supabase
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
      .eq('username', 'admin')
      .single()
    
    if (adminError) {
      return NextResponse.json({ error: 'Admin user not found', details: adminError }, { status: 404 })
    }
    
    // Also get all available learning styles
    const { data: styles, error: stylesError } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    return NextResponse.json({
      adminUser,
      availableStyles: styles || [],
      stylesError
    })
    
  } catch (error) {
    console.error('Error getting admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
