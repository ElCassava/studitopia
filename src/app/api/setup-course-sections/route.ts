import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId') || '1'
    
    console.log('🔧 Course setup API: Setting up sections for course:', courseId)
    
    const supabase = getSupabaseClient()
    
    // First, ensure course sections exist using the function from courses.ts
    const { ensureCourseSectionsExist } = await import('@/common/courses')
    
    console.log('🔧 Ensuring course sections exist...')
    const sectionSetupResult = await ensureCourseSectionsExist(courseId)
    console.log('🔧 Section setup result:', sectionSetupResult)
    
    // Then check what we have in the database
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id, section_type, course_id')
      .eq('course_id', courseId)
      .order('section_type')
    
    if (sectionsError) {
      console.error('🔧 Error fetching course sections:', sectionsError)
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }
    
    // Count sections by type
    const sectionCounts = { learn: 0, test: 0, quiz: 0 }
    if (courseSections) {
      courseSections.forEach((section: any) => {
        if (section.section_type === 'learn') sectionCounts.learn++
        else if (section.section_type === 'test') sectionCounts.test++
        else if (section.section_type === 'quiz') sectionCounts.quiz++
      })
    }
    
    // Now test getCourseById function
    const { getCourseById } = await import('@/common/courses')
    const courseData = await getCourseById(courseId, '1')
    
    console.log('🔧 Course data from getCourseById:', courseData)
    console.log('🔧 Section counts from getCourseById:', courseData?.sections)
    
    return NextResponse.json({
      success: true,
      courseId,
      sectionSetupResult,
      directQuery: {
        totalSections: courseSections?.length || 0,
        sections: courseSections,
        sectionCounts
      },
      getCourseByIdResult: {
        sections: courseData?.sections,
        fullCourseData: courseData
      },
      comparison: {
        directQueryCounts: sectionCounts,
        getCourseByIdCounts: courseData?.sections,
        match: JSON.stringify(sectionCounts) === JSON.stringify(courseData?.sections)
      }
    })
    
  } catch (error) {
    console.error('🔧 Course setup API error:', error)
    return NextResponse.json({ 
      error: 'Setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
