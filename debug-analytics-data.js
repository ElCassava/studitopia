const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAnalytics() {
  console.log('🔍 Debug Analytics Data...\n')
  
  // Check raw test attempts
  console.log('1. Raw test attempts:')
  const { data: testAttempts, error: testError } = await supabase
    .from('test_attempts')
    .select('*')
    .limit(5)
  
  if (testError) {
    console.log('   ❌ Error:', testError.message)
  } else {
    console.log('   📊 Found', testAttempts.length, 'test attempts')
    testAttempts.forEach((attempt, i) => {
      console.log(`   ${i+1}. User: ${attempt.user_id}, Score: ${attempt.score}, End: ${attempt.end_time ? '✅' : '❌'}`)
    })
  }
  
  // Check raw quiz attempts  
  console.log('\n2. Raw quiz attempts:')
  const { data: quizAttempts, error: quizError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .limit(5)
  
  if (quizError) {
    console.log('   ❌ Error:', quizError.message)
  } else {
    console.log('   📊 Found', quizAttempts.length, 'quiz attempts')
    quizAttempts.forEach((attempt, i) => {
      console.log(`   ${i+1}. User: ${attempt.user_id}, Score: ${attempt.score}, End: ${attempt.end_time ? '✅' : '❌'}`)
    })
  }
  
  // Test analytics views
  console.log('\n3. Analytics views:')
  
  console.log('   Testing student_test_analytics view...')
  const { data: testAnalyticsView, error: testViewError } = await supabase
    .from('student_test_analytics')
    .select('*')
    .limit(3)
  
  if (testViewError) {
    console.log('   ❌ Test analytics view error:', testViewError.message)
  } else {
    console.log('   ✅ Test analytics view:', testAnalyticsView.length, 'records')
  }
  
  console.log('   Testing student_quiz_analytics view...')
  const { data: quizAnalyticsView, error: quizViewError } = await supabase
    .from('student_quiz_analytics')  
    .select('*')
    .limit(3)
  
  if (quizViewError) {
    console.log('   ❌ Quiz analytics view error:', quizViewError.message)
  } else {
    console.log('   ✅ Quiz analytics view:', quizAnalyticsView.length, 'records')
  }
  
  // Test API with parameters
  console.log('\n4. Testing analytics API with parameters:')
  if (testAttempts.length > 0) {
    const sampleUserId = testAttempts[0].user_id
    console.log('   Testing with userId:', sampleUserId)
    
    try {
      const response = await fetch(`http://localhost:3004/api/analytics?userId=${sampleUserId}&type=overview`)
      if (response.ok) {
        const data = await response.json()
        console.log('   ✅ API response:', JSON.stringify(data, null, 2))
      } else {
        console.log('   ❌ API error status:', response.status)
      }
    } catch (err) {
      console.log('   ❌ API request failed:', err.message)
    }
  }
}

debugAnalytics().catch(console.error)
