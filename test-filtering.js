// Test the filtering logic for auditory users
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://erozhukurioezrygpmtt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyb3podWt1cmlvZXpyeWdwbXR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUyNjU1NCwiZXhwIjoyMDc0MTAyNTU0fQ.pvXFC3PjqaJwXVwP0IoqrXKQkkdbGzWP78SCYpWLL38'

const supabase = createClient(supabaseUrl, supabaseKey)

const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
const auditoryStyleId = '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
const visualStyleId = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'

async function testFiltering() {
  console.log('🧪 Testing test page filtering logic...\n')
  
  // Test the exact query that the page uses
  const { data: courseSections, error } = await supabase
    .from('course_sections')
    .select(`
      id,
      course_id,
      section_type,
      test_sections (
        id,
        style_id,
        test_questions (
          id,
          question_text,
          correct_answer,
          test_choices (
            id,
            choice_text
          )
        )
      )
    `)
    .eq('course_id', courseId)
    .eq('section_type', 'test')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log('📋 Raw course sections data:')
  console.log(`   - Found ${courseSections.length} course sections`)
  
  // Simulate filtering for auditory user
  console.log('\n🎧 Simulating auditory user filtering...')
  const auditoryTestSections = []
  
  courseSections.forEach(courseSection => {
    const testSections = courseSection.test_sections || []
    const filteredSections = testSections.filter(ts => ts.style_id === auditoryStyleId)
    
    console.log(`   - Course section ${courseSection.id}:`)
    console.log(`     - Total test sections: ${testSections.length}`)
    console.log(`     - Auditory test sections: ${filteredSections.length}`)
    
    filteredSections.forEach(ts => {
      const questionCount = ts.test_questions?.length || 0
      console.log(`     - Test section ${ts.id}: ${questionCount} questions`)
      auditoryTestSections.push(ts)
    })
  })
  
  console.log(`\n📊 Summary for auditory learner:`)
  console.log(`   - Total auditory test sections: ${auditoryTestSections.length}`)
  console.log(`   - Total questions: ${auditoryTestSections.reduce((sum, ts) => sum + (ts.test_questions?.length || 0), 0)}`)
  
  // Simulate filtering for visual user
  console.log('\n👁️ Simulating visual user filtering...')
  const visualTestSections = []
  
  courseSections.forEach(courseSection => {
    const testSections = courseSection.test_sections || []
    const filteredSections = testSections.filter(ts => ts.style_id === visualStyleId)
    
    filteredSections.forEach(ts => {
      const questionCount = ts.test_questions?.length || 0
      console.log(`   - Test section ${ts.id}: ${questionCount} questions`)
      visualTestSections.push(ts)
    })
  })
  
  console.log(`\n📊 Summary for visual learner:`)
  console.log(`   - Total visual test sections: ${visualTestSections.length}`)
  console.log(`   - Total questions: ${visualTestSections.reduce((sum, ts) => sum + (ts.test_questions?.length || 0), 0)}`)
  
  console.log('\n✅ Test filtering completed!')
  
  if (auditoryTestSections.length > 0) {
    console.log('🎉 SUCCESS: Auditory learners will now see test content!')
  } else {
    console.log('❌ ISSUE: Auditory learners will still see "not configured" message')
  }
}

testFiltering()
