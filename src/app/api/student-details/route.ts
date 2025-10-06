import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // Get student basic info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        learning_style_id,
        learning_styles (
          name,
          description
        )
      `)
      .eq('id', studentId)
      .single()
    
    if (studentError) {
      console.error('Error fetching student:', studentError)
      return NextResponse.json({ error: studentError.message }, { status: 500 })
    }
    
    // Get enrollment info for the course
    let enrollmentQuery = supabase
      .from('enrollments')
      .select('progress_percentage, enrolled_at')
      .eq('user_id', studentId)
    
    if (courseId) {
      enrollmentQuery = enrollmentQuery.eq('course_id', courseId)
    }
    
    const { data: enrollment, error: enrollmentError } = await enrollmentQuery.single()
    
    // Get test attempts with detailed answers
    let testQuery = supabase
      .from('test_attempts')
      .select(`
        id,
        start_time,
        end_time,
        score,
        test_sections (
          id,
          course_sections (
            id,
            course_id,
            courses (
              course_name
            )
          )
        )
      `)
      .eq('user_id', studentId)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
    
    if (courseId) {
      testQuery = testQuery.eq('test_sections.course_sections.course_id', courseId)
    }
    
    const { data: testAttempts, error: testError } = await testQuery
     // Get detailed test answers for each attempt
    const testDetails = await Promise.all(
      (testAttempts || []).map(async (attempt) => {
        console.log(`Fetching test attempt details for attempt ${attempt.id}`)
        
        const { data: details, error: detailsError } = await supabase
          .from('test_attempt_details')
          .select(`
            id,
            question_id,
            selected_answer,
            is_correct,
            time_taken,
            test_questions (
              id,
              question_text,
              correct_answer,
              choice_a,
              choice_b,
              choice_c,
              choice_d
            )
          `)
          .eq('test_attempt_id', attempt.id)
          .order('question_id')

        if (detailsError) {
          console.error(`Error fetching test attempt details for attempt ${attempt.id}:`, detailsError)
        } else {
          console.log(`Found ${details?.length || 0} question details for attempt ${attempt.id}`)
        }

        return {
          ...attempt,
          questions: details || []
        }
      })
    )
    
    // Get quiz attempts with detailed answers
    let quizQuery = supabase
      .from('quiz_attempts')
      .select(`
        id,
        start_time,
        end_time,
        score,
        quiz_sections (
          id,
          course_sections (
            id,
            course_id,
            courses (
              course_name
            )
          )
        )
      `)
      .eq('user_id', studentId)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
    
    if (courseId) {
      quizQuery = quizQuery.eq('quiz_sections.course_sections.course_id', courseId)
    }
    
    const { data: quizAttempts, error: quizError } = await quizQuery
    
    // Get detailed quiz answers for each attempt
    const quizDetails = await Promise.all(
      (quizAttempts || []).map(async (attempt) => {
        const { data: details, error: detailsError } = await supabase
          .from('quiz_attempt_details')
          .select(`
            id,
            question_id,
            selected_answer,
            is_correct,
            time_taken,
            answered_at,
            quiz_questions (
              id,
              question_text,
              correct_answer,
              choice_a,
              choice_b,
              choice_c,
              choice_d
            )
          `)
          .eq('quiz_attempt_id', attempt.id)
          .order('answered_at')
        
        return {
          ...attempt,
          questions: details || []
        }
      })
    )
    
    // Calculate performance statistics
    const testScores = testDetails.map(t => t.score).filter(s => s !== null)
    const quizScores = quizDetails.map(q => q.score).filter(s => s !== null)
    
    const avgTestScore = testScores.length > 0 
      ? testScores.reduce((sum, score) => sum + score, 0) / testScores.length 
      : 0
    
    const avgQuizScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
      : 0
    
    const overallAverage = [...testScores, ...quizScores].length > 0
      ? [...testScores, ...quizScores].reduce((sum, score) => sum + score, 0) / [...testScores, ...quizScores].length
      : 0
    
    // Calculate total questions answered correctly vs incorrectly
    const allTestQuestions = testDetails.flatMap(t => t.questions)
    const allQuizQuestions = quizDetails.flatMap(q => q.questions)
    const allQuestions = [...allTestQuestions, ...allQuizQuestions]
    
    const correctAnswers = allQuestions.filter(q => q.is_correct).length
    const totalQuestions = allQuestions.length
    const incorrectAnswers = totalQuestions - correctAnswers

    // Get detailed section completion status
    let sectionCompletionDetails: any[] = []
    if (courseId) {
      // Get all course sections with basic info
      const { data: courseSections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id, section_type')
        .eq('course_id', courseId)
        .order('section_type')

      if (!sectionsError && courseSections) {
        // Get user's section progress
        const { data: userProgress } = await supabase
          .from('user_section_progress')
          .select('*')
          .eq('user_id', studentId)

        const progressMap = new Map(
          (userProgress || []).map((p: any) => [p.course_section_id, p])
        )

        const sectionsWithDetails = await Promise.all(
          courseSections.map(async (section: any) => {
            const progress = progressMap.get(section.id)
            let sectionInfo: any = {
              id: section.id,
              type: section.section_type,
              title: `${section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)} Section`,
              completed: progress?.completed || false,
              completedAt: progress?.completed_at || null,
              score: progress?.score || null
            }

            // Get specific section details and check completion
            if (section.section_type === 'learn') {
              const { data: learnSection } = await supabase
                .from('learn_sections')
                .select('id')
                .eq('course_section_id', section.id)
                .single()
              
              if (learnSection) {
                sectionInfo.title = 'Learning Material'
                sectionInfo.order = Math.floor(Math.random() * 100) + 1 // Temporary ordering
              }
            } else if (section.section_type === 'test') {
              const { data: testSection } = await supabase
                .from('test_sections')
                .select('id')
                .eq('course_section_id', section.id)
                .single()
              
              if (testSection) {
                // Count test questions
                const { data: questions } = await supabase
                  .from('test_questions')
                  .select('id')
                  .eq('test_section_id', testSection.id)
                
                sectionInfo.title = (questions?.length || 0) > 5 ? 'Chapter Test' : 'Quiz Test'
                sectionInfo.totalQuestions = questions?.length || 0
                
                // Check if student has completed this test
                const testCompleted = testDetails.some((t: any) => 
                  t.test_sections?.id === testSection.id && t.end_time
                )
                sectionInfo.completed = testCompleted || sectionInfo.completed
              }
            } else if (section.section_type === 'quiz') {
              const { data: quizSection } = await supabase
                .from('quiz_sections')
                .select('id')
                .eq('course_section_id', section.id)
                .single()
              
              if (quizSection) {
                // Count quiz questions
                const { data: questions } = await supabase
                  .from('quiz_questions')
                  .select('id')
                  .eq('quiz_section_id', quizSection.id)
                
                sectionInfo.title = (questions?.length || 0) > 3 ? 'Practice Quiz' : 'Quick Quiz'
                sectionInfo.totalQuestions = questions?.length || 0
                
                // Check if student has completed this quiz
                const quizCompleted = quizDetails.some((q: any) => 
                  q.quiz_sections?.id === quizSection.id && q.end_time
                )
                sectionInfo.completed = quizCompleted || sectionInfo.completed
              }
            }

            return sectionInfo
          })
        )

        // Sort sections by type and then by title for better organization
        sectionCompletionDetails = sectionsWithDetails.sort((a, b) => {
          const typeOrder = { 'learn': 1, 'test': 2, 'quiz': 3 }
          const typeA = typeOrder[a.type as keyof typeof typeOrder] || 4
          const typeB = typeOrder[b.type as keyof typeof typeOrder] || 4
          
          if (typeA !== typeB) {
            return typeA - typeB
          }
          
          return a.title.localeCompare(b.title)
        })
      }
    }
    
    return NextResponse.json({
      student: {
        ...student,
        learning_style: student.learning_styles ? 
          (Array.isArray(student.learning_styles) ? 
            student.learning_styles[0]?.name : 
            (student.learning_styles as any)?.name
          ) || 'Not assessed' : 'Not assessed',
        learning_style_description: student.learning_styles ? 
          (Array.isArray(student.learning_styles) ? 
            student.learning_styles[0]?.description : 
            (student.learning_styles as any)?.description
          ) || '' : ''
      },
      enrollment: enrollment || null,
      performance: {
        testsCompleted: testDetails.length,
        quizzesCompleted: quizDetails.length,
        avgTestScore: Math.round(avgTestScore * 100) / 100,
        avgQuizScore: Math.round(avgQuizScore * 100) / 100,
        overallAverage: Math.round(overallAverage * 100) / 100,
        totalQuestionsAnswered: totalQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracyRate: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      },
      testAttempts: testDetails,
      quizAttempts: quizDetails,
      sectionProgress: {
        sections: sectionCompletionDetails,
        completedSections: sectionCompletionDetails.filter(s => s.completed).length,
        totalSections: sectionCompletionDetails.length,
        completionPercentage: sectionCompletionDetails.length > 0 
          ? Math.round((sectionCompletionDetails.filter(s => s.completed).length / sectionCompletionDetails.length) * 100)
          : 0
      }
    })
    
  } catch (error) {
    console.error('Error in student details API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
