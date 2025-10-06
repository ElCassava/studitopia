const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAnalytics() {
  console.log('🧪 Testing Analytics System...\n')
  
  // Test 1: Check all required tables exist
  console.log('1. Checking Analytics Table Structure:')
  const requiredTables = [
    'quiz_questions',
    'quiz_choices', 
    'quiz_attempts',
    'quiz_attempt_details',
    'learn_sessions',
    'learn_interaction_details',
    'learn_content_items'
  ]
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`   ✅ ${tableName}: Available`)
      }
    } catch (err) {
      console.log(`   ❌ ${tableName}: ${err.message}`)
    }
  }
  
  // Test 2: Check existing test analytics
  console.log('\n2. Checking Test Analytics Data:')
  try {
    const { data: testData, error } = await supabase
      .from('test_attempts')
      .select(`
        *,
        test_attempt_details(*)
      `)
      .limit(5)
    
    if (error) {
      console.log(`   ❌ Test analytics error: ${error.message}`)
    } else {
      console.log(`   ✅ Test analytics: ${testData.length} test attempts found`)
      if (testData.length > 0) {
        const detailCount = testData.reduce((sum, attempt) => sum + (attempt.test_attempt_details?.length || 0), 0)
        console.log(`   📊 Total test answer details: ${detailCount}`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Test analytics exception: ${err.message}`)
  }
  
  // Test 3: Check quiz analytics data
  console.log('\n3. Checking Quiz Analytics Data:')
  try {
    const { data: quizData, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz_attempt_details(*)
      `)
      .limit(5)
    
    if (error) {
      console.log(`   ❌ Quiz analytics error: ${error.message}`)
    } else {
      console.log(`   ✅ Quiz analytics: ${quizData.length} quiz attempts found`)
      if (quizData.length > 0) {
        const detailCount = quizData.reduce((sum, attempt) => sum + (attempt.quiz_attempt_details?.length || 0), 0)
        console.log(`   📊 Total quiz answer details: ${detailCount}`)
        
        // Check for new columns
        const sampleAttempt = quizData[0]
        console.log(`   📊 Sample quiz attempt columns:`)
        console.log(`      - start_time: ${sampleAttempt.start_time ? '✅' : '❌'}`)
        console.log(`      - end_time: ${sampleAttempt.end_time ? '✅' : '❌ (null)'}`)
        console.log(`      - score: ${sampleAttempt.score !== undefined ? '✅' : '❌'}`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Quiz analytics exception: ${err.message}`)
  }
  
  // Test 4: Check learn analytics data
  console.log('\n4. Checking Learn Analytics Data:')
  try {
    const { data: learnData, error } = await supabase
      .from('learn_sessions')
      .select(`
        *,
        learn_interaction_details(*)
      `)
      .limit(5)
    
    if (error) {
      console.log(`   ❌ Learn analytics error: ${error.message}`)
    } else {
      console.log(`   ✅ Learn analytics: ${learnData.length} learn sessions found`)
      if (learnData.length > 0) {
        const interactionCount = learnData.reduce((sum, session) => sum + (session.learn_interaction_details?.length || 0), 0)
        console.log(`   📊 Total learn interactions: ${interactionCount}`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Learn analytics exception: ${err.message}`)
  }
  
  // Test 5: Test analytics views
  console.log('\n5. Testing Analytics Views:')
  
  const views = [
    'student_test_analytics',
    'student_quiz_analytics', 
    'student_learn_analytics'
  ]
  
  for (const viewName of views) {
    try {
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(3)
      
      if (error) {
        console.log(`   ❌ ${viewName}: ${error.message}`)
      } else {
        console.log(`   ✅ ${viewName}: ${data.length} records available`)
      }
    } catch (err) {
      console.log(`   ❌ ${viewName}: ${err.message}`)
    }
  }
  
  // Test 6: Test API endpoints
  console.log('\n6. Testing Analytics API Endpoints:')
  
  try {
    // Test analytics API (should work with existing data)
    const response = await fetch('http://localhost:3004/api/analytics')
    if (response.ok) {
      const apiData = await response.json()
      console.log('   ✅ /api/analytics: Working')
      console.log(`   📊 API returned ${Object.keys(apiData).length} data categories`)
    } else {
      console.log('   ❌ /api/analytics: Not responding or error')
    }
  } catch (err) {
    console.log('   ❌ /api/analytics: Cannot reach (server may not be running on port 3004)')
  }
  
  console.log('\n🏁 Analytics Testing Complete!')
  console.log('\nNext Steps:')
  console.log('1. If any tables are missing, run: node apply-complete-schemas.js')
  console.log('2. Test quiz submission to verify quiz analytics storage')
  console.log('3. Test learn content viewing to verify learn analytics storage')
  console.log('4. Check admin dashboard at: http://localhost:3004/admin/analytics')
}

testAnalytics().catch(console.error)
