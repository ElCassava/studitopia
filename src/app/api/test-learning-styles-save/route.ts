import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Check what learning styles exist
    const { data: styles, error } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Test the mapping function
    const styleNameMap: Record<string, string> = {
      'visual': 'Visual',
      'auditory': 'Auditory', 
      'kinesthetic': 'Kinesthetic'
    }
    
    const testResults = []
    for (const [frontendName, dbName] of Object.entries(styleNameMap)) {
      const found = styles?.find(s => s.name === dbName)
      testResults.push({
        frontendName,
        dbName,
        found: !!found,
        styleId: found?.id || null
      })
    }
    
    return NextResponse.json({
      availableStyles: styles,
      mappingTest: testResults
    })
    
  } catch (error) {
    console.error('Error testing learning styles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
