// Debug endpoint to check learning sections for a user/course
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    // Get user's learning style
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('learning_style_id, username')
      .eq('id', userId)
      .single()
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }
    
    // Get learning style details
    let learningStyleInfo = null
    if (userData.learning_style_id) {
      const { data: styleData } = await supabase
        .from('learning_styles')
        .select('*')
        .eq('id', userData.learning_style_id)
        .single()
      learningStyleInfo = styleData
    }
    
    // Get all course sections with learn sections
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select(`
        id,
        course_id,
        section_type,
        learn_sections (
          id,
          style_id,
          learn_contents (
            id,
            description
          )
        )
      `)
      .eq('course_id', courseId)
      .eq('section_type', 'learn')
    
    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }
    
    // Get all learning styles for reference
    const { data: allStyles } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    // Process sections to show filtering
    const processedSections = courseSections?.map(section => {
      const learnSections = section.learn_sections || []
      const filteredSections = userData.learning_style_id
        ? learnSections.filter(ls => ls.style_id === userData.learning_style_id)
        : learnSections
      
      return {
        ...section,
        totalLearnSections: learnSections.length,
        matchingLearnSections: filteredSections.length,
        learnSections: learnSections.map(ls => ({
          ...ls,
          matches: ls.style_id === userData.learning_style_id,
          contentCount: ls.learn_contents?.length || 0
        }))
      }
    })
    
    return NextResponse.json({
      user: {
        id: userId,
        username: userData.username,
        learning_style_id: userData.learning_style_id,
        learningStyle: learningStyleInfo
      },
      course: {
        id: courseId,
        totalSections: courseSections?.length || 0
      },
      sections: processedSections,
      allLearningStyles: allStyles,
      summary: {
        sectionsWithContent: processedSections?.filter(s => s.matchingLearnSections > 0).length || 0,
        sectionsWithoutContent: processedSections?.filter(s => s.matchingLearnSections === 0).length || 0,
        totalFilteredSections: processedSections?.reduce((sum, s) => sum + s.matchingLearnSections, 0) || 0
      }
    })
    
  } catch (error) {
    console.error('Error in debug learning sections endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
