import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId, 
      courseId, 
      quizSectionId, 
      questions, 
      answers, 
      score, 
      startTime, 
      endTime 
    } = body

    if (!userId || !courseId || !quizSectionId || !questions || !answers) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // First ensure quiz section exists (create if it doesn't exist for testing purposes)
    const { data: existingQuizSection } = await supabase
      .from('quiz_sections')
      .select('id')
      .eq('id', quizSectionId)
      .single()

    if (!existingQuizSection) {
      console.log('Quiz section does not exist, creating it for analytics testing...')
      // Create a course section first (if needed)
      const { data: courseSection, error: courseSectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseId,
          section_type: 'quiz'
        })
        .select()
        .single()

      if (courseSectionError) {
        console.error('Error creating course section:', courseSectionError)
      }

      // Create the quiz section
      const { error: quizSectionError } = await supabase
        .from('quiz_sections')
        .insert({
          id: quizSectionId,
          course_section_id: courseSection?.id || quizSectionId, // Fallback to quizSectionId
          style_id: 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14' // Use visual learning style
        })

      if (quizSectionError) {
        console.error('Error creating quiz section:', quizSectionError)
      } else {
        console.log('Created quiz section for analytics testing')
      }
    }

    // Ensure quiz questions exist for analytics testing
    for (const question of questions) {
      const { data: existingQuestion } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('id', question.id)
        .single()

      if (!existingQuestion) {
        console.log(`Creating missing quiz question: ${question.id}`)
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            id: question.id,
            quiz_section_id: quizSectionId,
            question_text: question.question_text || question.question,
            correct_answer: question.correct?.toString() || '1'
          })

        if (questionError) {
          console.error('Error creating quiz question:', questionError)
        }
      }
    }

    // Create quiz attempt record
    const { data: quizAttempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_section_id: quizSectionId,
        start_time: startTime,
        end_time: endTime,
        score: score,
        completed: true
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating quiz attempt:', attemptError)
      return NextResponse.json({ 
        error: 'Failed to create quiz attempt' 
      }, { status: 500 })
    }

    // Create detailed answer records
    const attemptDetails = questions.map((question: any, index: number) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer?.selectedAnswer === question.correct
      
      return {
        quiz_attempt_id: quizAttempt.id,
        question_id: question.id,
        selected_answer: userAnswer?.selectedAnswer?.toString() || null,
        is_correct: isCorrect,
        time_taken: userAnswer?.timeSpent || 0,
        answered_at: userAnswer?.answeredAt || endTime
      }
    })

    const { error: detailsError } = await supabase
      .from('quiz_attempt_details')
      .insert(attemptDetails)

    if (detailsError) {
      console.error('Error creating quiz attempt details:', detailsError)
      return NextResponse.json({ 
        error: 'Failed to save quiz details' 
      }, { status: 500 })
    }

    // Also update the general progress tracking
    const { error: progressError } = await supabase
      .from('user_section_progress')
      .upsert({
        user_id: userId,
        course_section_id: courseId,
        section_type: 'quiz',
        completed: true,
        completed_at: endTime,
        score: score
      })

    if (progressError) {
      console.error('Error updating progress:', progressError)
    }

    return NextResponse.json({ 
      success: true,
      quizAttemptId: quizAttempt.id
    })

  } catch (error) {
    console.error('Unexpected error saving quiz results:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
