import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get the course ID from URL params
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId') || 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
    
    console.log('🔍 Debugging test data for course:', courseId)
    
    // 1. Get learning styles
    const { data: learningStyles } = await supabase
      .from('learning_styles')
      .select('id, name')
    
    console.log('📚 Learning styles:', learningStyles)
    
    // 2. Get course sections
    const { data: courseSections } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .eq('section_type', 'test')
    
    console.log('📋 Course sections:', courseSections)
    
    // 3. Get test sections
    const { data: testSections } = await supabase
      .from('test_sections')
      .select('*')
    
    console.log('🧪 All test sections:', testSections)
    
    // 4. Get test sections for this course
    const courseSectionIds = courseSections?.map(cs => cs.id) || []
    const { data: courseTestSections } = await supabase
      .from('test_sections')
      .select('*')
      .in('course_section_id', courseSectionIds)
    
    console.log('🎯 Test sections for this course:', courseTestSections)
    
    // 5. Get test questions
    const testSectionIds = courseTestSections?.map(ts => ts.id) || []
    const { data: testQuestions } = await supabase
      .from('test_questions')
      .select('*')
      .in('test_section_id', testSectionIds)
    
    console.log('❓ Test questions:', testQuestions)
    
    // 6. Get test choices
    const questionIds = testQuestions?.map(q => q.id) || []
    const { data: testChoices } = await supabase
      .from('test_choices')
      .select('*')
      .in('question_id', questionIds)
    
    console.log('📝 Test choices:', testChoices)
    
    // 7. Get the full query like the page does
    const { data: fullData } = await supabase
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
    
    console.log('🔄 Full nested query result:', JSON.stringify(fullData, null, 2))
    
    return NextResponse.json({
      success: true,
      courseId,
      learningStyles,
      courseSections,
      testSections,
      courseTestSections,
      testQuestions,
      testChoices,
      fullData
    })
    
  } catch (error) {
    console.error('❌ Error debugging test data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
