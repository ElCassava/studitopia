// Test the student-details API directly
const testStudentDetailsAPI = async () => {
  console.log('🔍 Testing student-details API...')
  
  try {
    // Test with sample data - we'll use any available student ID
    const response = await fetch('http://localhost:3005/api/student-details?studentId=test&courseId=test')
    const data = await response.json()
    
    console.log('API Response Status:', response.status)
    console.log('API Response Data:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ API is working!')
      console.log('📊 Student Details Available')
      
      if (data.testAttempts && data.testAttempts.length > 0) {
        console.log(`📝 Found ${data.testAttempts.length} test attempts`)
        data.testAttempts.forEach((attempt, i) => {
          console.log(`   Test ${i + 1}: Score ${attempt.score}%, ${attempt.questions?.length || 0} questions`)
        })
      } else {
        console.log('📝 No test attempts found - this is expected if no test data exists')
      }
      
      if (data.sectionProgress && data.sectionProgress.sections) {
        console.log(`📋 Found ${data.sectionProgress.sections.length} sections`)
      }
    } else {
      console.log('❌ API Error:', data.error)
    }
    
  } catch (error) {
    console.log('💥 Request failed:', error.message)
  }
}

testStudentDetailsAPI()
