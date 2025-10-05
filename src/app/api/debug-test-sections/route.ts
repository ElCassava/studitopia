import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId') || '1'
  
  try {
    const supabase = getSupabaseClient()
    
    console.log('Debug API: Fetching test sections for course:', courseId)
    
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select(`
        id,
        course_id,
        section_type,
        test_sections (
          id,
          style_id,
          test_questions (
            id,
            question_text,
            correct_answer,
            test_choices (
              id,
              choice_text
            )
          )
        )
      `)
      .eq('course_id', courseId)
      .eq('section_type', 'test')
    
    if (sectionsError) {
      console.error('Debug API: Error fetching test sections:', sectionsError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: sectionsError 
      }, { status: 500 })
    }
    
    console.log('Debug API: Found course sections:', courseSections?.length || 0)
    
    return NextResponse.json({ 
      success: true,
      courseId,
      courseSections: courseSections || [],
      totalSections: courseSections?.length || 0
    })
    
  } catch (error) {
    console.error('Debug API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
