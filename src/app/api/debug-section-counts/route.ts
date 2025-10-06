import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId') || '1'
    const userId = searchParams.get('userId')
    
    console.log('Debug API: Checking section counts for course:', courseId)
    
    const supabase = getSupabaseClient()
    
    // Get course basic info
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    
    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 })
    }
    
    // Get all course sections with counts by type
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id, section_type')
      .eq('course_id', courseId)
      .order('section_type')
    
    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }
    
    // Count sections by type
    const sectionCounts = { learn: 0, test: 0, quiz: 0 }
    const sectionDetails = { learn: [], test: [], quiz: [] }
    
    if (sections) {
      sections.forEach((section: any) => {
        if (section.section_type === 'learn') {
          sectionCounts.learn++
          sectionDetails.learn.push(section)
        } else if (section.section_type === 'test') {
          sectionCounts.test++
          sectionDetails.test.push(section)
        } else if (section.section_type === 'quiz') {
          sectionCounts.quiz++
          sectionDetails.quiz.push(section)
        }
      })
    }
    
    // Also test the getCourseById function
    const { getCourseById } = await import('@/common/courses')
    const courseFromFunction = await getCourseById(courseId, userId)
    
    return NextResponse.json({
      success: true,
      courseId,
      course: {
        id: course.id,
        course_name: course.course_name,
        description: course.description
      },
      directQuery: {
        totalSections: sections?.length || 0,
        sectionCounts,
        sectionDetails
      },
      getCourseByIdResult: {
        course: courseFromFunction,
        sections: courseFromFunction?.sections
      },
      comparison: {
        directQueryTotal: sections?.length || 0,
        getCourseByIdSections: courseFromFunction?.sections ? 
          (courseFromFunction.sections.learn + courseFromFunction.sections.test + courseFromFunction.sections.quiz) : 0,
        match: (sections?.length || 0) === (courseFromFunction?.sections ? 
          (courseFromFunction.sections.learn + courseFromFunction.sections.test + courseFromFunction.sections.quiz) : 0)
      }
    })
    
  } catch (error) {
    console.error('Debug API: Error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
