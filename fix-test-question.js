const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

async function fixTestQuestion() {
  console.log('🔧 Fixing Test Question #3 Correct Answer...\n')
  
  // 1. Update the correct answer in test_questions table
  console.log('Step 1: Updating correct answer from "2" to "4"')
  const { data: questionUpdate, error: questionError } = await supabase
    .from('test_questions')
    .update({ correct_answer: '4' })
    .eq('id', '550e8400-e29b-41d4-a716-446655440002')
    .select()
    
  if (questionError) {
    console.log('❌ Error updating question:', questionError.message)
    return
  } else {
    console.log('✅ Updated question:', questionUpdate[0])
  }
  
  // 2. Update the student's answer to be marked as incorrect (since they selected "2" but correct is "4")
  console.log('\nStep 2: Marking student answer as incorrect')
  const { data: attemptUpdate, error: attemptError } = await supabase
    .from('test_attempt_details')
    .update({ is_correct: false })
    .eq('question_id', '550e8400-e29b-41d4-a716-446655440002')
    .eq('selected_answer', '2')
    .select()
    
  if (attemptError) {
    console.log('❌ Error updating attempt:', attemptError.message)
  } else {
    console.log('✅ Updated attempt details:', attemptUpdate[0])
  }
  
  // 3. Verify the fix
  console.log('\nStep 3: Verifying the fix')
  const { data: verification } = await supabase
    .from('test_attempt_details')
    .select(`
      selected_answer,
      is_correct,
      test_questions(question_text, correct_answer)
    `)
    .eq('question_id', '550e8400-e29b-41d4-a716-446655440002')
    .single()
    
  if (verification) {
    console.log('📊 Verification Results:')
    console.log(`Question: "${verification.test_questions.question_text}"`)
    console.log(`Correct Answer: "${verification.test_questions.correct_answer}"`)
    console.log(`Student Selected: "${verification.selected_answer}"`)
    console.log(`Marked as: ${verification.is_correct ? '✅ CORRECT' : '❌ WRONG'}`)
  }
  
  console.log('\n🎯 Fix Complete! The question "What is 2 + 2?" now has correct answer "4"')
}

fixTestQuestion().catch(console.error)
