import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { confirmDelete } = await request.json()
    
    if (!confirmDelete) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }
    
    console.log('🗑️ Deleting all course sections...')
    const supabase = getSupabaseClient()
    
    // First get all sections to see what we're deleting
    const { data: sections, error: getError } = await supabase
      .from('course_sections')
      .select('id, section_type')
    
    if (getError) {
      console.error('Error getting sections:', getError)
      return NextResponse.json({ error: getError.message }, { status: 500 })
    }
    
    console.log(`Found ${sections?.length || 0} course sections to delete`)
    
    // Delete in correct order due to foreign key constraints
    if (sections && sections.length > 0) {
      // First delete test_sections that might still exist
      const { error: testSectionsError } = await supabase
        .from('test_sections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        
      if (testSectionsError) {
        console.warn('Warning deleting test_sections:', testSectionsError)
      }
      
      // Then delete course_sections
      const sectionIds = sections.map(s => s.id)
      
      const { data: deleted, error: deleteError } = await supabase
        .from('course_sections')
        .delete()
        .in('id', sectionIds)
        
      if (deleteError) {
        console.error('Error deleting course sections:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
      
      console.log(`Successfully deleted ${sections.length} course sections`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${sections?.length || 0} course sections`,
      deletedCount: sections?.length || 0
    })
    
  } catch (error) {
    console.error('Delete sections error:', error)
    return NextResponse.json({ 
      error: 'Delete failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
