// Node.js script to create auditory test section with first 14 questions
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://erozhukurioezrygpmtt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyb3podWt1cmlvZXpyeWdwbXR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUyNjU1NCwiZXhwIjoyMDc0MTAyNTU0fQ.pvXFC3PjqaJwXVwP0IoqrXKQkkdbGzWP78SCYpWLL38'

const supabase = createClient(supabaseUrl, supabaseKey)

const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
const courseSectionId = '32b25dc6-3b39-40b4-b55c-2c4211cf9452'
const auditoryStyleId = '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
const visualTestSectionId = '3e8019bf-dd1f-42c1-9d31-35a2fbc49aee'

// First 14 question IDs from the debug log (these should become the auditory questions)
const first14QuestionIds = [
  '1d5670ef-7a25-4fe2-8f91-3f8882c7ad4e',
  '83bf5746-d25c-43d9-8d23-45fad1802a9a',
  'cf817a10-1d50-4b0a-b652-6f1a25e9d331',
  '33a48b52-efed-4b8b-9348-3e9e22bcd6b1',
  'ea7fcd44-805a-44fe-9a7a-fbc8dc5ebccd',
  '5b66a0dc-a4c2-484a-b86e-b562555e7c77',
  'ea7c4e36-5181-462d-803e-17377b508974',
  'eda035c1-1b2a-4080-bb79-e50f01330278',
  '749f4ed1-652d-49c0-be20-5c8dcec172a1',
  '3e479ef0-7915-44cc-a937-2156fbf9fa84',
  '86d09fc6-4a07-47cd-baf3-d6272be6a5ee',
  'ae694768-7bc0-4e6b-9842-76d22841dfee',
  '8b087d88-3ad7-4954-9ae6-46302ac18fc8',
  '8b9b886d-8b2d-4eb4-a36b-c6fa96677bd7'
]

async function createAuditoryTestSection() {
  try {
    console.log('🎧 Creating auditory test section...')
    
    // 1. Create test section for auditory learners
    const { data: newTestSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: courseSectionId,
        style_id: auditoryStyleId
      })
      .select()
      .single()
    
    if (testSectionError) {
      console.error('❌ Error creating test section:', testSectionError)
      return
    }
    
    console.log('✅ Created auditory test section:', newTestSection.id)
    
    // 2. Get the first 14 questions from visual test section
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_section_id', visualTestSectionId)
      .in('id', first14QuestionIds)
    
    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError)
      return
    }
    
    console.log(`📝 Found ${questions.length} questions to copy`)
    
    // 3. Copy questions to new auditory test section
    const questionsToInsert = questions.map(q => ({
      test_section_id: newTestSection.id,
      question_text: q.question_text,
      image_url: q.image_url,
      correct_answer: q.correct_answer
    }))
    
    const { data: newQuestions, error: insertQuestionsError } = await supabase
      .from('test_questions')
      .insert(questionsToInsert)
      .select()
    
    if (insertQuestionsError) {
      console.error('❌ Error inserting questions:', insertQuestionsError)
      return
    }
    
    console.log(`✅ Copied ${newQuestions.length} questions`)
    
    // 4. Copy test choices for each question
    let totalChoicesCopied = 0
    
    for (let i = 0; i < questions.length; i++) {
      const originalQuestionId = questions[i].id
      const newQuestionId = newQuestions[i].id
      
      // Get choices for this question
      const { data: choices, error: choicesError } = await supabase
        .from('test_choices')
        .select('choice_text')
        .eq('question_id', originalQuestionId)
      
      if (choicesError) {
        console.error(`❌ Error fetching choices for question ${originalQuestionId}:`, choicesError)
        continue
      }
      
      if (choices && choices.length > 0) {
        const choicesToInsert = choices.map(c => ({
          question_id: newQuestionId,
          choice_text: c.choice_text
        }))
        
        const { error: insertChoicesError } = await supabase
          .from('test_choices')
          .insert(choicesToInsert)
        
        if (insertChoicesError) {
          console.error(`❌ Error inserting choices for question ${newQuestionId}:`, insertChoicesError)
        } else {
          totalChoicesCopied += choicesToInsert.length
          console.log(`✅ Copied ${choicesToInsert.length} choices for question ${i + 1}`)
        }
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Auditory test section ID: ${newTestSection.id}`)
    console.log(`   - Questions copied: ${newQuestions.length}`)
    console.log(`   - Choices copied: ${totalChoicesCopied}`)
    console.log(`\n✨ Auditory learners should now see ${newQuestions.length} questions instead of "not configured" message!`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the migration
createAuditoryTestSection()
