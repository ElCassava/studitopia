import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json()
    
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }
    
    console.log('🔧 Populating test content for course:', courseId)
    const supabase = getSupabaseClient()
    
    // Get learning styles
    const { data: learningStyles } = await supabase
      .from('learning_styles')
      .select('id, name')
      .limit(3)
    
    if (!learningStyles || learningStyles.length === 0) {
      return NextResponse.json({ error: 'No learning styles found' }, { status: 400 })
    }
    
    let createdSections = 0
    let createdContent = 0
    
    // Create course sections and content for each type
    const sectionTypes = ['learn', 'test', 'quiz']
    const sectionCounts = { learn: 8, test: 2, quiz: 5 }
    
    for (const sectionType of sectionTypes) {
      const targetCount = sectionCounts[sectionType as keyof typeof sectionCounts]
      
      for (let i = 0; i < targetCount; i++) {
        // Create course section
        const { data: courseSection, error: courseSectionError } = await supabase
          .from('course_sections')
          .insert({
            course_id: courseId,
            section_type: sectionType
          })
          .select()
          .single()
        
        if (courseSectionError) {
          console.error(`Error creating ${sectionType} course section:`, courseSectionError)
          continue
        }
        
        createdSections++
        
        // Create content based on section type
        if (sectionType === 'learn') {
          // Create learn sections for each learning style
          for (const style of learningStyles) {
            const { data: learnSection, error: learnSectionError } = await supabase
              .from('learn_sections')
              .insert({
                course_section_id: courseSection.id,
                style_id: style.id
              })
              .select()
              .single()
            
            if (!learnSectionError) {
              // Create learn content
              await supabase
                .from('learn_contents')
                .insert({
                  learn_section_id: learnSection.id,
                  description: `Learn section ${i + 1} content for ${style.name} learning style`,
                  image_url: null
                })
              
              createdContent++
            }
          }
        } else if (sectionType === 'test') {
          // Create test sections for each learning style
          for (const style of learningStyles) {
            const { data: testSection, error: testSectionError } = await supabase
              .from('test_sections')
              .insert({
                course_section_id: courseSection.id,
                style_id: style.id
              })
              .select()
              .single()
            
            if (!testSectionError) {
              // Create test questions
              const { data: testQuestion } = await supabase
                .from('test_questions')
                .insert({
                  test_section_id: testSection.id,
                  question_text: `Test question ${i + 1} for ${style.name} style`,
                  correct_answer: 'Option A'
                })
                .select()
                .single()
              
              if (testQuestion) {
                // Create test choices
                await supabase
                  .from('test_choices')
                  .insert([
                    { question_id: testQuestion.id, choice_text: 'Option A' },
                    { question_id: testQuestion.id, choice_text: 'Option B' },
                    { question_id: testQuestion.id, choice_text: 'Option C' },
                    { question_id: testQuestion.id, choice_text: 'Option D' }
                  ])
              }
              
              createdContent++
            }
          }
        } else if (sectionType === 'quiz') {
          // Create quiz sections for each learning style
          for (const style of learningStyles) {
            const { data: quizSection, error: quizSectionError } = await supabase
              .from('quiz_sections')
              .insert({
                course_section_id: courseSection.id,
                style_id: style.id
              })
              .select()
              .single()
            
            if (!quizSectionError) {
              // Create quiz questions
              const { data: quizQuestion } = await supabase
                .from('quiz_questions')
                .insert({
                  quiz_section_id: quizSection.id,
                  question_text: `Quiz question ${i + 1} for ${style.name} style`,
                  correct_answer: 'Option A'
                })
                .select()
                .single()
              
              if (quizQuestion) {
                // Create quiz choices
                await supabase
                  .from('quiz_choices')
                  .insert([
                    { question_id: quizQuestion.id, choice_text: 'Option A' },
                    { question_id: quizQuestion.id, choice_text: 'Option B' },
                    { question_id: quizQuestion.id, choice_text: 'Option C' },
                    { question_id: quizQuestion.id, choice_text: 'Option D' }
                  ])
              }
              
              createdContent++
            }
          }
        }
      }
    }
    
    console.log(`🔧 Created ${createdSections} course sections and ${createdContent} content items`)
    
    return NextResponse.json({
      success: true,
      courseId,
      createdSections,
      createdContent,
      message: `Successfully populated ${createdSections} sections with ${createdContent} content items`
    })
    
  } catch (error) {
    console.error('🔧 Error populating content:', error)
    return NextResponse.json({ 
      error: 'Failed to populate content', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
