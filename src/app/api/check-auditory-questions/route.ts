import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get auditory learning style
    const { data: auditoryStyle, error: styleError } = await supabase
      .from('learning_styles')
      .select('id, name')
      .eq('name', 'Auditory')
      .single()

    if (styleError || !auditoryStyle) {
      return NextResponse.json({ error: 'Auditory learning style not found' }, { status: 404 })
    }

    // Get auditory test sections and questions
    const { data: auditoryQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_text,
        correct_answer,
        test_sections!inner(
          id,
          style_id,
          learning_styles!inner(name),
          course_sections!inner(
            course_id,
            courses!inner(course_name)
          )
        ),
        test_choices(choice_text)
      `)
      .eq('test_sections.style_id', auditoryStyle.id)

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch auditory questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      auditoryStyleId: auditoryStyle.id,
      totalAuditoryQuestions: auditoryQuestions?.length || 0,
      questions: auditoryQuestions?.map((q, index) => ({
        id: q.id,
        questionNumber: index + 1,
        questionText: q.question_text.length > 100 
          ? q.question_text.substring(0, 100) + '...'
          : q.question_text,
        correctAnswer: q.correct_answer,
        courseName: q.test_sections?.course_sections?.courses?.course_name,
        choiceCount: q.test_choices?.length || 0
      })) || []
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check auditory questions: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
