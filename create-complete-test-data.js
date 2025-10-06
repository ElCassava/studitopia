// Create complete test data with detailed question responses for teacher dashboard
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createCompleteTestData() {
  console.log('🧪 Creating complete test data with question details...')

  try {
    // First ensure we have the basic structure
    let { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('course_name', 'Mathematics 101')
      .single()

    if (!course) {
      console.log('📚 Creating Mathematics 101 course...')
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          course_name: 'Mathematics 101',
          title: 'Mathematics 101',
          description: 'Fundamental mathematics concepts and problem solving',
          difficulty_level: 'beginner',
          estimated_hours: 40,
          created_by: (await supabase.from('users').select('id').eq('role', 'teacher').single()).data?.id
        })
        .select()
        .single()

      if (courseError) {
        console.log('❌ Error creating course:', courseError.message)
        return
      }
      course = newCourse
      console.log('✅ Created Mathematics 101 course')
    }

    // Get or create test section
    let { data: testSection } = await supabase
      .from('course_sections')
      .select(`
        id,
        test_sections (
          id,
          test_questions (
            id,
            question_text,
            correct_answer,
            choice_a,
            choice_b,
            choice_c,
            choice_d
          )
        )
      `)
      .eq('course_id', course.id)
      .eq('section_type', 'test')
      .single()

    if (!testSection) {
      console.log('📝 Creating test section...')
      const { data: newSection, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: course.id,
          section_type: 'test',
          order_index: 1
        })
        .select()
        .single()

      if (sectionError) {
        console.log('❌ Error creating course section:', sectionError.message)
        return
      }

      // Create test_section
      const { data: newTestSection, error: testSectionError } = await supabase
        .from('test_sections')
        .insert({
          course_section_id: newSection.id,
          style_id: 1 // Default style
        })
        .select()
        .single()

      if (testSectionError) {
        console.log('❌ Error creating test section:', testSectionError.message)
        return
      }

      // Create sample test questions
      const sampleQuestions = [
        {
          test_section_id: newTestSection.id,
          question_text: "What is 2 + 2?",
          choice_a: "3",
          choice_b: "4",
          choice_c: "5",
          choice_d: "6",
          correct_answer: "B"
        },
        {
          test_section_id: newTestSection.id,
          question_text: "What is 5 × 3?",
          choice_a: "12",
          choice_b: "13",
          choice_c: "15",
          choice_d: "18",
          correct_answer: "C"
        },
        {
          test_section_id: newTestSection.id,
          question_text: "What is 10 ÷ 2?",
          choice_a: "4",
          choice_b: "5",
          choice_c: "6",
          choice_d: "8",
          correct_answer: "B"
        },
        {
          test_section_id: newTestSection.id,
          question_text: "What is 7 - 3?",
          choice_a: "3",
          choice_b: "4",
          choice_c: "5",
          choice_d: "6",
          correct_answer: "B"
        }
      ]

      const { error: questionsError } = await supabase
        .from('test_questions')
        .insert(sampleQuestions)

      if (questionsError) {
        console.log('❌ Error creating test questions:', questionsError.message)
        return
      }

      console.log('✅ Created test section with sample questions')

      // Fetch the complete test section
      const { data: completeSection } = await supabase
        .from('course_sections')
        .select(`
          id,
          test_sections (
            id,
            test_questions (
              id,
              question_text,
              correct_answer,
              choice_a,
              choice_b,
              choice_c,
              choice_d
            )
          )
        `)
        .eq('id', newSection.id)
        .single()

      testSection = completeSection
    }

    if (!testSection || !testSection.test_sections) {
      console.log('❌ Test section still not available')
      return
    }

    const testSectionData = testSection.test_sections
    const questions = testSectionData.test_questions || []

    if (questions.length === 0) {
      console.log('❌ No test questions found')
      return
    }

    console.log(`✅ Found ${questions.length} questions in test section`)

    // Get or create student1 user
    let { data: student } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'student1')
      .single()

    if (!student) {
      console.log('👤 Creating student1 user...')
      const { data: newStudent, error: studentError } = await supabase
        .from('users')
        .insert({
          username: 'student1',
          email: 'student1@example.com',
          role: 'student',
          learning_style_id: 1
        })
        .select()
        .single()

      if (studentError) {
        console.log('❌ Error creating student:', studentError.message)
        return
      }
      student = newStudent
      console.log('✅ Created student1 user')

      // Enroll student in course
      await supabase
        .from('enrollments')
        .insert({
          user_id: student.id,
          course_id: course.id,
          progress_percentage: 0
        })
      console.log('✅ Enrolled student1 in Mathematics 101')
    }

    // Create test attempt
    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: student.id,
        test_section_id: testSectionData.id,
        start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        end_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        score: 75,
        total_questions: questions.length,
        correct_answers: Math.ceil(questions.length * 0.75)
      })
      .select()
      .single()

    if (attemptError) {
      console.log('❌ Error creating test attempt:', attemptError.message)
      return
    }

    console.log('✅ Created test attempt with ID:', testAttempt.id)

    // Create detailed question responses
    const questionDetails = []
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const isCorrect = i < Math.ceil(questions.length * 0.75) // 75% correct
      
      // Randomly select an answer
      const choices = ['A', 'B', 'C', 'D']
      let selectedAnswer
      
      if (isCorrect) {
        selectedAnswer = question.correct_answer
      } else {
        // Pick a wrong answer
        const wrongChoices = choices.filter(c => c !== question.correct_answer)
        selectedAnswer = wrongChoices[Math.floor(Math.random() * wrongChoices.length)]
      }

      const detail = {
        test_attempt_id: testAttempt.id,
        question_id: question.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
      }

      questionDetails.push(detail)
    }

    // Insert all question details
    const { error: detailsError } = await supabase
      .from('test_attempt_details')
      .insert(questionDetails)

    if (detailsError) {
      console.log('❌ Error creating question details:', detailsError.message)
      return
    }

    console.log(`✅ Created ${questionDetails.length} question response details`)

    // Create another test attempt for variety
    const { data: testAttempt2, error: attempt2Error } = await supabase
      .from('test_attempts')
      .insert({
        user_id: student.id,
        test_section_id: testSectionData.id,
        start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        end_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        score: 90,
        total_questions: questions.length,
        correct_answers: Math.ceil(questions.length * 0.9)
      })
      .select()
      .single()

    if (!attempt2Error) {
      // Create question details for second attempt
      const questionDetails2 = []
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        const isCorrect = i < Math.ceil(questions.length * 0.9) // 90% correct
        
        let selectedAnswer
        if (isCorrect) {
          selectedAnswer = question.correct_answer
        } else {
          const choices = ['A', 'B', 'C', 'D']
          const wrongChoices = choices.filter(c => c !== question.correct_answer)
          selectedAnswer = wrongChoices[Math.floor(Math.random() * wrongChoices.length)]
        }

        questionDetails2.push({
          test_attempt_id: testAttempt2.id,
          question_id: question.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken: Math.floor(Math.random() * 100) + 20 // 20-120 seconds
        })
      }

      await supabase
        .from('test_attempt_details')
        .insert(questionDetails2)

      console.log('✅ Created second test attempt with question details')
    }

    // Also create some quiz data if quiz sections exist
    const { data: quizSection } = await supabase
      .from('course_sections')
      .select(`
        id,
        quiz_sections (
          id
        )
      `)
      .eq('course_id', course.id)
      .eq('section_type', 'quiz')
      .limit(1)
      .single()

    if (quizSection && quizSection.quiz_sections) {
      // Create a quiz attempt
      const { data: quizAttempt } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: student.id,
          quiz_section_id: quizSection.quiz_sections.id,
          start_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
          score: 80,
          total_questions: 5,
          correct_answers: 4
        })
        .select()
        .single()

      if (quizAttempt) {
        console.log('✅ Created quiz attempt for completeness')
      }
    }

    console.log('\n🎉 Complete test data created successfully!')
    console.log('📋 You can now:')
    console.log('   1. Go to teacher dashboard')
    console.log('   2. Click Mathematics 101')
    console.log('   3. Click on student1')
    console.log('   4. Click on any test section card')
    console.log('   5. View detailed question-by-question responses!')

  } catch (error) {
    console.error('💥 Error:', error)
  }
}

createCompleteTestData()
