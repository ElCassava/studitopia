import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, getSupabaseAdminClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { testType = 'basic' } = await request.json()
    
    console.log('🧪 Running database update test...')
    
    // Test with both clients
    const regularClient = getSupabaseClient()
    const adminClient = getSupabaseAdminClient()
    
    console.log('🔧 Regular client available:', !!regularClient)
    console.log('🔧 Admin client available:', !!adminClient)
    
    // Get the admin user first
    const { data: adminUser, error: getUserError } = await regularClient
      .from('users')
      .select('id, username, learning_style_id')
      .eq('username', 'admin')
      .single()
    
    if (getUserError || !adminUser) {
      return NextResponse.json({ 
        error: 'Could not find admin user', 
        details: getUserError 
      }, { status: 404 })
    }
    
    console.log('👤 Found admin user:', adminUser)
    
    // Get Visual learning style
    const { data: visualStyle, error: getStyleError } = await regularClient
      .from('learning_styles')
      .select('id, name')
      .eq('name', 'Visual')
      .single()
    
    if (getStyleError || !visualStyle) {
      return NextResponse.json({ 
        error: 'Could not find Visual learning style', 
        details: getStyleError 
      }, { status: 404 })
    }
    
    console.log('🎨 Found Visual style:', visualStyle)
    
    // Test 1: Try update with regular client
    console.log('🔥 Test 1: Updating with regular client...')
    const { data: regularUpdateResult, error: regularUpdateError } = await regularClient
      .from('users')
      .update({ learning_style_id: visualStyle.id })
      .eq('id', adminUser.id)
      .select('id, username, learning_style_id')
    
    console.log('📊 Regular client result:', { 
      data: regularUpdateResult, 
      error: regularUpdateError 
    })
    
    // Test 2: Try update with admin client (if available)
    let adminUpdateResult = null
    let adminUpdateError = null
    
    if (adminClient) {
      console.log('🔥 Test 2: Updating with admin client...')
      const result = await adminClient
        .from('users')
        .update({ learning_style_id: visualStyle.id })
        .eq('id', adminUser.id)
        .select('id, username, learning_style_id')
      
      adminUpdateResult = result.data
      adminUpdateError = result.error
      
      console.log('📊 Admin client result:', { 
        data: adminUpdateResult, 
        error: adminUpdateError 
      })
    }
    
    // Verify final state
    const { data: finalUser, error: finalError } = await regularClient
      .from('users')
      .select('id, username, learning_style_id, learning_styles:learning_style_id(name)')
      .eq('id', adminUser.id)
      .single()
    
    console.log('🔍 Final verification:', { data: finalUser, error: finalError })
    
    return NextResponse.json({
      success: true,
      results: {
        initialUser: adminUser,
        styleToSet: visualStyle,
        regularClientTest: {
          data: regularUpdateResult,
          error: regularUpdateError
        },
        adminClientTest: {
          data: adminUpdateResult,
          error: adminUpdateError
        },
        finalState: finalUser
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
