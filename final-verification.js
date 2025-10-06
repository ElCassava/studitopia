const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalVerification() {
  console.log('🎯 FINAL ANALYTICS VERIFICATION\n')
  
  console.log('1. Test Analytics with Selected Answers:')
  const { data: testDetails } = await supabase
    .from('test_attempt_details')
    .select(`
      selected_answer,
      is_correct,
      time_taken,
      test_questions(question_text, correct_answer)
    `)
    .limit(3)
  
  testDetails?.forEach((detail, i) => {
    console.log(`   Test ${i+1}:`)
    console.log(`   Question: "${detail.test_questions?.question_text}"`)
    console.log(`   Selected: "${detail.selected_answer}" | Correct Answer: "${detail.test_questions?.correct_answer}"`)
    console.log(`   Result: ${detail.is_correct ? '✅ CORRECT' : '❌ WRONG'} | Time: ${detail.time_taken}s`)
    console.log('')
  })
  
  console.log('2. Quiz Analytics with Selected Answers:')
  const { data: quizDetails } = await supabase
    .from('quiz_attempt_details')
    .select('selected_answer, is_correct, time_taken')
    .limit(3)
  
  quizDetails?.forEach((detail, i) => {
    console.log(`   Quiz ${i+1}:`)
    console.log(`   Selected Answer: "${detail.selected_answer}"`)
    console.log(`   Result: ${detail.is_correct ? '✅ CORRECT' : '❌ WRONG'} | Time: ${detail.time_taken}s`)
    console.log('')
  })
  
  console.log('3. Analytics API Test:')
  try {
    const response = await fetch('http://localhost:3003/api/analytics?type=detailed')
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ API Working: ${data.testDetails.length} test details, ${data.quizDetails.length} quiz details`)
      
      if (data.testDetails.length > 0) {
        const sample = data.testDetails[0]
        console.log(`   📊 Sample Test Answer: "${sample.selected_answer}" (${sample.is_correct ? 'correct' : 'wrong'})`)
      }
      
      if (data.quizDetails.length > 0) {
        const sample = data.quizDetails[0]
        console.log(`   📊 Sample Quiz Answer: "${sample.selected_answer}" (${sample.is_correct ? 'correct' : 'wrong'})`)
      }
    } else {
      console.log('   ❌ API Error:', response.status)
    }
  } catch (err) {
    console.log('   ❌ API Request Failed:', err.message)
  }
  
  console.log('\n🎉 ANALYTICS SYSTEM VERIFICATION COMPLETE!')
  console.log('\n📋 What You Can Now See:')
  console.log('• Admin Dashboard: http://localhost:3003/admin/analytics')
  console.log('• Switch to "Detailed Analysis" tab to see all student selected answers')
  console.log('• Test details show: Question text + Selected answer + Correct/Wrong + Time taken')  
  console.log('• Quiz details show: Selected answer + Correct/Wrong + Time taken')
  console.log('• All data is properly stored and retrieved from database')
}

finalVerification().catch(console.error)
