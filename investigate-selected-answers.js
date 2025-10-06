const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigateSelectedAnswers() {
  console.log('🔍 Investigating Selected Answers Issue...\n')
  
  // 1. Check test_attempt_details for selected answers
  console.log('1. Checking test_attempt_details table:')
  const { data: testDetails, error: testError } = await supabase
    .from('test_attempt_details')
    .select('*')
    .limit(10)
  
  if (testError) {
    console.log('   ❌ Error:', testError.message)
  } else {
    console.log(`   ✅ Found ${testDetails.length} test attempt details`)
    testDetails.forEach((detail, i) => {
      console.log(`   ${i+1}. Question ID: ${detail.question_id}`)
      console.log(`       Selected Answer: "${detail.selected_answer}"`)
      console.log(`       Is Correct: ${detail.is_correct}`)
      console.log(`       Time Taken: ${detail.time_taken}s`)
      console.log(`       Answered At: ${detail.answered_at}`)
      console.log('')
    })
  }
  
  // 2. Check quiz_attempt_details for selected answers
  console.log('2. Checking quiz_attempt_details table:')
  const { data: quizDetails, error: quizError } = await supabase
    .from('quiz_attempt_details')
    .select('*')
    .limit(10)
  
  if (quizError) {
    console.log('   ❌ Error:', quizError.message)
  } else {
    console.log(`   ✅ Found ${quizDetails.length} quiz attempt details`)
    quizDetails.forEach((detail, i) => {
      console.log(`   ${i+1}. Question ID: ${detail.question_id}`)
      console.log(`       Selected Answer: "${detail.selected_answer}"`)
      console.log(`       Is Correct: ${detail.is_correct}`)
      console.log(`       Time Taken: ${detail.time_taken}s`)
      console.log(`       Answered At: ${detail.answered_at}`)
      console.log('')
    })
  }
  
  // 3. Check what the analytics API returns for detailed data
  console.log('3. Testing analytics API detailed endpoint:')
  try {
    const response = await fetch('http://localhost:3004/api/analytics?type=detailed')
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Detailed analytics response:')
      console.log('   Test Details count:', data.testDetails?.length || 0)
      console.log('   Quiz Details count:', data.quizDetails?.length || 0)
      
      if (data.testDetails && data.testDetails.length > 0) {
        console.log('   Sample test detail:')
        console.log('   ', JSON.stringify(data.testDetails[0], null, 4))
      }
      
      if (data.quizDetails && data.quizDetails.length > 0) {
        console.log('   Sample quiz detail:')
        console.log('   ', JSON.stringify(data.quizDetails[0], null, 4))
      }
    } else {
      console.log('   ❌ API error:', response.status, response.statusText)
    }
  } catch (err) {
    console.log('   ❌ API request failed:', err.message)
  }
  
  // 4. Check if we have actual question text data
  console.log('\n4. Checking question data availability:')
  
  console.log('   Testing test_questions table:')
  const { data: testQuestions, error: testQError } = await supabase
    .from('test_questions')
    .select('*')
    .limit(3)
  
  if (testQError) {
    console.log('   ❌ Test questions error:', testQError.message)
  } else {
    console.log(`   ✅ Found ${testQuestions.length} test questions`)
  }
  
  console.log('   Testing quiz_questions table:')
  const { data: quizQuestions, error: quizQError } = await supabase
    .from('quiz_questions')
    .select('*')
    .limit(3)
  
  if (quizQError) {
    console.log('   ❌ Quiz questions error:', quizQError.message)
  } else {
    console.log(`   ✅ Found ${quizQuestions.length} quiz questions`)
  }
  
  // 5. Check admin analytics page data structure
  console.log('\n5. Testing what admin dashboard receives:')
  try {
    const overviewResponse = await fetch('http://localhost:3004/api/analytics?type=overview')
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json()
      console.log('   Overview data structure:')
      console.log('   - testStats count:', overviewData.testStats?.length || 0)
      console.log('   - quizStats count:', overviewData.quizStats?.length || 0)
      
      if (overviewData.testStats && overviewData.testStats.length > 0) {
        console.log('   Sample test stat fields:', Object.keys(overviewData.testStats[0]))
      }
    }
  } catch (err) {
    console.log('   ❌ Cannot test admin dashboard data:', err.message)
  }
}

async function investigateSelectedAnswers() {
  console.log('🔍 Investigating Selected Answers Issue...\n')
  
  // Check test attempt details with selected answers
  console.log('1. Test Attempt Details (with selected answers):')
  const { data: testDetails, error: testError } = await supabase
    .from('test_attempt_details')
    .select(`
      *,
      test_attempts!inner(
        user_id,
        test_section_id,
        start_time,
        end_time,
        score
      )
    `)
    .limit(10)
  
  if (testError) {
    console.log('   ❌ Error:', testError.message)
  } else {
    console.log(`   📊 Found ${testDetails.length} test answer records`)
    testDetails.forEach((detail, i) => {
      console.log(`   ${i+1}. Question ID: ${detail.question_id}`)
      console.log(`      Selected Answer: "${detail.selected_answer}"`)
      console.log(`      Is Correct: ${detail.is_correct}`)
      console.log(`      Time Taken: ${detail.time_taken}s`)
      console.log(`      Test Attempt ID: ${detail.test_attempt_id}`)
      console.log('      ---')
    })
  }
  
  // Check quiz attempt details with selected answers
  console.log('\n2. Quiz Attempt Details (with selected answers):')
  const { data: quizDetails, error: quizError } = await supabase
    .from('quiz_attempt_details')
    .select(`
      *,
      quiz_attempts!inner(
        user_id,
        quiz_section_id,
        start_time,
        end_time,
        score
      )
    `)
    .limit(10)
  
  if (quizError) {
    console.log('   ❌ Error:', quizError.message)
  } else {
    console.log(`   📊 Found ${quizDetails.length} quiz answer records`)
    quizDetails.forEach((detail, i) => {
      console.log(`   ${i+1}. Question ID: ${detail.question_id}`)
      console.log(`      Selected Answer: "${detail.selected_answer}"`)
      console.log(`      Is Correct: ${detail.is_correct}`)
      console.log(`      Time Taken: ${detail.time_taken}s`)
      console.log(`      Quiz Attempt ID: ${detail.quiz_attempt_id}`)
      console.log('      ---')
    })
  }
  
  // Test the detailed analytics API
  console.log('\n3. Testing Detailed Analytics API:')
  try {
    const response = await fetch('http://localhost:3004/api/analytics?type=detailed')
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ API Response Structure:')
      console.log(`   - Test Details: ${data.testDetails?.length || 0} records`)
      console.log(`   - Quiz Details: ${data.quizDetails?.length || 0} records`)
      
      if (data.testDetails && data.testDetails.length > 0) {
        console.log('\n   📋 Sample Test Detail:')
        const sample = data.testDetails[0]
        console.log(`   - Selected Answer: "${sample.selected_answer}"`)
        console.log(`   - Is Correct: ${sample.is_correct}`)
        console.log(`   - Question ID: ${sample.question_id}`)
      }
      
      if (data.quizDetails && data.quizDetails.length > 0) {
        console.log('\n   📋 Sample Quiz Detail:')
        const sample = data.quizDetails[0]
        console.log(`   - Selected Answer: "${sample.selected_answer}"`)
        console.log(`   - Is Correct: ${sample.is_correct}`)
        console.log(`   - Question ID: ${sample.question_id}`)
      }
    } else {
      console.log(`   ❌ API Error: ${response.status}`)
    }
  } catch (err) {
    console.log('   ❌ Cannot reach API (server may not be running)')
  }
  
  // Check admin analytics page for missing data
  console.log('\n4. Checking Admin Analytics Display Logic:')
  console.log('   The admin dashboard should show detailed answers in the "detailed" view.')
  console.log('   If selected answers are not showing, the issue might be in:')
  console.log('   - Admin analytics page rendering logic')
  console.log('   - Analytics API detailed query')
  console.log('   - Data display components')
  
  console.log('\n🎯 Next Steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Visit: http://localhost:3004/admin/analytics')
  console.log('3. Switch to "Detailed" analytics view')
  console.log('4. Look for selected answer columns in the data tables')
}

investigateSelectedAnswers().catch(console.error)
