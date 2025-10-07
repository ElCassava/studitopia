import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // First, let's check what we have
    const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
    const auditoryStyleId = '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
    const visualStyleId = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
    
    console.log('🔄 Starting test section migration...')
    
    // Get the existing test section for visual learners
    const { data: courseSections } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId)
      .eq('section_type', 'test')
    
    if (!courseSections || courseSections.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No course sections found'
      }, { status: 404 })
    }
    
    const courseSectionId = courseSections[0].id
    console.log('📋 Course section ID:', courseSectionId)
    
    // Get the existing visual test section  
    const { data: existingTestSection } = await supabase
      .from('test_sections')
      .select('id')
      .eq('course_section_id', courseSectionId)
      .eq('style_id', visualStyleId)
      .single()
    
    if (!existingTestSection) {
      return NextResponse.json({
        success: false,
        error: 'No existing visual test section found'
      }, { status: 404 })
    }
    
    console.log('👀 Existing visual test section:', existingTestSection.id)
    
    // Check if auditory test section already exists
    const { data: existingAuditorySection } = await supabase
      .from('test_sections')
      .select('id')
      .eq('course_section_id', courseSectionId)
      .eq('style_id', auditoryStyleId)
      .single()
    
    if (existingAuditorySection) {
      return NextResponse.json({
        success: false,
        error: 'Auditory test section already exists',
        auditoryTestSectionId: existingAuditorySection.id
      })
    }
    
    // Create new test section for auditory learners
    const { data: newTestSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: courseSectionId,
        style_id: auditoryStyleId
      })
      .select()
      .single()
    
    if (testSectionError) {
      console.error('❌ Error creating auditory test section:', testSectionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create auditory test section',
        details: testSectionError
      }, { status: 500 })
    }
    
    console.log('🎧 Created auditory test section:', newTestSection.id)
    
    // Get the first 14 questions from the visual test section (as mentioned in the problem)
    const { data: visualQuestions } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_section_id', existingTestSection.id)
      .limit(14)
    
    if (!visualQuestions || visualQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No questions found in visual test section'
      }, { status: 404 })
    }
    
    console.log(`📝 Found ${visualQuestions.length} questions to copy`)
    
    // Copy questions to the new auditory test section
    const questionsToInsert = visualQuestions.map(q => ({
      test_section_id: newTestSection.id,
      question_text: q.question_text,
      image_url: q.image_url,
      correct_answer: q.correct_answer
    }))
    
    const { data: newQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .insert(questionsToInsert)
      .select()
    
    if (questionsError) {
      console.error('❌ Error copying questions:', questionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to copy questions',
        details: questionsError
      }, { status: 500 })
    }
    
    console.log(`✅ Copied ${newQuestions.length} questions`)
    
    // Copy test choices for each question
    let totalChoicesCopied = 0
    
    for (let i = 0; i < visualQuestions.length; i++) {
      const originalQuestionId = visualQuestions[i].id
      const newQuestionId = newQuestions[i].id
      
      // Get choices for this question
      const { data: choices } = await supabase
        .from('test_choices')
        .select('choice_text')
        .eq('question_id', originalQuestionId)
      
      if (choices && choices.length > 0) {
        const choicesToInsert = choices.map(c => ({
          question_id: newQuestionId,
          choice_text: c.choice_text
        }))
        
        const { error: choicesError } = await supabase
          .from('test_choices')
          .insert(choicesToInsert)
        
        if (choicesError) {
          console.error(`❌ Error copying choices for question ${newQuestionId}:`, choicesError)
        } else {
          totalChoicesCopied += choicesToInsert.length
        }
      }
    }
    
    console.log(`✅ Copied ${totalChoicesCopied} test choices`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully created auditory test section',
      auditoryTestSectionId: newTestSection.id,
      questionsCopied: newQuestions.length,
      choicesCopied: totalChoicesCopied,
      courseId,
      courseSectionId
    })
    
  } catch (error) {
    console.error('❌ Error in test section migration:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
