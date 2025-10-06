// Create test data with detailed question responses using correct table names
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestDataWithDetails() {
  console.log('🧪 Creating test data with detailed question responses...')

  try {
    // 1. Get an existing student or create one
    let { data: student } = await supabase
      .from('users')
      .select('id, username')
      .eq('role', 'student')
      .limit(1)
      .single()

    if (!student) {
      console.log('👤 Creating a test student...')
      const { data: newStudent, error: studentError } = await supabase
        .from('users')
        .insert({
          username: 'test_student',
          email: 'test_student@example.com',
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
    }

    console.log(`✅ Using student: ${student.username} (${student.id})`)

    // 2. Get a test section with questions
    const { data: testSection } = await supabase
      .from('test_sections')
      .select(`
        id,
        course_sections!inner (
          id,
          course_id,
          courses (course_name)
        ),
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
      .limit(1)
      .single()

    if (!testSection || !testSection.test_questions || testSection.test_questions.length === 0) {
      console.log('❌ No test section with questions found')
      return
    }

    console.log(`✅ Found test section with ${testSection.test_questions.length} questions`)

    // 3. Create a test attempt
    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: student.id,
        test_section_id: testSection.id,
        start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        score: 75,
        total_questions: testSection.test_questions.length,
        correct_answers: Math.ceil(testSection.test_questions.length * 0.75)
      })
      .select()
      .single()

    if (attemptError) {
      console.log('❌ Error creating test attempt:', attemptError.message)
      return
    }

    console.log(`✅ Created test attempt: ${testAttempt.id}`)

    // 4. Create detailed question responses using test_attempts_details
    const questionDetails = testSection.test_questions.map((question, index) => {
      const isCorrect = index < Math.ceil(testSection.test_questions.length * 0.75)
      const choices = ['A', 'B', 'C', 'D']
      
      let selectedAnswer
      if (isCorrect) {
        selectedAnswer = question.correct_answer
      } else {
        const wrongChoices = choices.filter(c => c !== question.correct_answer)
        selectedAnswer = wrongChoices[Math.floor(Math.random() * wrongChoices.length)]
      }

      return {
        test_attempt_id: testAttempt.id,
        question_id: question.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
      }
    })

    const { error: detailsError } = await supabase
      .from('test_attempts_details')
      .insert(questionDetails)

    if (detailsError) {
      console.log('❌ Error creating question details:', detailsError.message)
      return
    }

    console.log(`✅ Created ${questionDetails.length} detailed question responses`)

    // 5. Also create a quiz attempt if quiz sections exist
    const { data: quizSection } = await supabase
      .from('quiz_sections')
      .select(`
        id,
        course_sections!inner (
          id,
          course_id
        )
      `)
      .limit(1)
      .single()

    if (quizSection) {
      const { data: quizAttempt } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: student.id,
          quiz_section_id: quizSection.id,
          start_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
          score: 80,
          total_questions: 3,
          correct_answers: 2
        })
        .select()
        .single()

      if (quizAttempt) {
        // Create sample quiz details (assuming we have quiz questions)
        const sampleQuizDetails = [
          {
            quiz_attempt_id: quizAttempt.id,
            question_id: 1, // This would need to be a real quiz question ID
            selected_answer: 'A',
            is_correct: true,
            time_taken: 45,
            answered_at: new Date(Date.now() - 7 * 60 * 1000).toISOString()
          },
          {
            quiz_attempt_id: quizAttempt.id,
            question_id: 2,
            selected_answer: 'B',
            is_correct: false,
            time_taken: 60,
            answered_at: new Date(Date.now() - 6.5 * 60 * 1000).toISOString()
          }
        ]

        await supabase
          .from('quiz_attempts_details')
          .insert(sampleQuizDetails)

        console.log('✅ Created quiz attempt with details')
      }
    }

    console.log('\n🎉 Test data creation complete!')
    console.log('📋 You can now:')
    console.log('   1. Go to teacher dashboard: http://localhost:3005/teacher')
    console.log('   2. Find the course and click on it')
    console.log('   3. Click on the test student')
    console.log('   4. Click on test/quiz section cards')
    console.log('   5. View detailed question-by-question responses! 📊')

  } catch (error) {
    console.error('💥 Error:', error)
  }
}

createTestDataWithDetails()
