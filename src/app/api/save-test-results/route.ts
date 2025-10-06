import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId, 
      courseId, 
      testSectionId, 
      questions, 
      answers, 
      score, 
      startTime, 
      endTime 
    } = body

    if (!userId || !courseId || !testSectionId || !questions || !answers) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // First ensure test section exists (create if it doesn't exist for testing purposes)
    const { data: existingTestSection } = await supabase
      .from('test_sections')
      .select('id')
      .eq('id', testSectionId)
      .single()

    if (!existingTestSection) {
      console.log('Test section does not exist, creating it for analytics testing...')
      // Create a course section first (if needed)
      const { data: courseSection, error: courseSectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseId,
          section_type: 'test'
        })
        .select()
        .single()

      if (courseSectionError) {
        console.error('Error creating course section:', courseSectionError)
      }

      // Create the test section
      const { error: testSectionError } = await supabase
        .from('test_sections')
        .insert({
          id: testSectionId,
          course_section_id: courseSection?.id || testSectionId, // Fallback to testSectionId
          style_id: 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14' // Use visual learning style
        })

      if (testSectionError) {
        console.error('Error creating test section:', testSectionError)
      } else {
        console.log('Created test section for analytics testing')
      }
    }

    // Create test attempt record
    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: userId,
        test_section_id: testSectionId,
        start_time: startTime,
        end_time: endTime,
        score: score
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating test attempt:', attemptError)
      return NextResponse.json({ 
        error: 'Failed to create test attempt' 
      }, { status: 500 })
    }

    // Ensure test questions exist for analytics testing
    for (const question of questions) {
      const { data: existingQuestion } = await supabase
        .from('test_questions')
        .select('id')
        .eq('id', question.id)
        .single()

      if (!existingQuestion) {
        console.log(`Creating missing test question: ${question.id}`)
        const { error: questionError } = await supabase
          .from('test_questions')
          .insert({
            id: question.id,
            test_section_id: testSectionId,
            question_text: question.question_text,
            correct_answer: question.correct?.toString() || '1'
          })

        if (questionError) {
          console.error('Error creating test question:', questionError)
        }
      }
    }

    // Create detailed answer records
    console.log('Processing answers for detailed storage:', {
      questionsCount: questions.length,
      answersCount: answers.length,
      sampleQuestion: questions[0],
      sampleAnswer: answers[0]
    })

    // Map answers by their question ID for easier lookup
    const answersByQuestionId = new Map()
    answers.forEach((answer: any) => {
      if (answer.questionId) {
        answersByQuestionId.set(answer.questionId, answer)
      }
    })

    const attemptDetails = questions.map((question: any, index: number) => {
      // Try to find the answer by database question ID first, then fallback to index
      const userAnswer = answersByQuestionId.get(question.dbId || question.id) || answers[index]
      const isCorrect = userAnswer?.isCorrect || (userAnswer?.selectedAnswer === question.correct)
      
      return {
        test_attempt_id: testAttempt.id,
        question_id: question.dbId || question.id, // Use database question ID
        selected_answer: userAnswer?.selectedAnswer?.toString() || null,
        is_correct: isCorrect,
        time_taken: userAnswer?.timeSpent || 0
        // Note: answered_at column not available in current schema
      }
    })

    console.log('Attempt details to insert:', attemptDetails)

    const { error: detailsError } = await supabase
      .from('test_attempt_details')
      .insert(attemptDetails)

    if (detailsError) {
      console.error('Error creating test attempt details:', detailsError)
      return NextResponse.json({ 
        error: 'Failed to save test details' 
      }, { status: 500 })
    }

    // Also update the general progress tracking
    const { error: progressError } = await supabase
      .from('user_section_progress')
      .upsert({
        user_id: userId,
        course_section_id: courseId,
        section_type: 'test',
        completed: true,
        completed_at: endTime,
        score: score
      })

    if (progressError) {
      console.error('Error updating progress:', progressError)
    }

    return NextResponse.json({ 
      success: true,
      testAttemptId: testAttempt.id
    })

  } catch (error) {
    console.error('Unexpected error saving test results:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
