require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function createSampleTestData() {
  try {
    console.log('🧪 Creating sample test data for section details demonstration...');
    
    const studentId = '6f94132f-bd5f-4a73-b66a-8eecf3a203b4';
    const courseId = '35b8a545-de10-4450-824a-38abb30b67b9';
    
    // Get test sections that have questions
    const { data: testSections } = await supabase
      .from('test_sections')
      .select(`
        id,
        course_section_id,
        course_sections!inner(course_id)
      `)
      .eq('course_sections.course_id', courseId)
      .limit(1);
    
    if (testSections && testSections.length > 0) {
      const testSection = testSections[0];
      
      // Create a test attempt
      const { data: testAttempt, error: attemptError } = await supabase
        .from('test_attempts')
        .insert({
          user_id: studentId,
          test_section_id: testSection.id,
          start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          end_time: new Date().toISOString(),
          score: 75
        })
        .select()
        .single();
      
      if (attemptError) {
        console.log('Test attempt error:', attemptError.message);
        return;
      }
      
      console.log('✅ Created test attempt with 75% score');
      
      // Get test questions for this section
      const { data: testQuestions } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_section_id', testSection.id)
        .limit(4);
      
      if (testQuestions && testQuestions.length > 0) {
        // Create sample question responses
        const responses = [
          { questionIndex: 0, selectedAnswer: 'A', isCorrect: true, timeTaken: 45 },
          { questionIndex: 1, selectedAnswer: 'C', isCorrect: false, timeTaken: 67 },
          { questionIndex: 2, selectedAnswer: 'B', isCorrect: true, timeTaken: 32 },
          { questionIndex: 3, selectedAnswer: 'D', isCorrect: true, timeTaken: 54 }
        ];
        
        for (let i = 0; i < Math.min(testQuestions.length, responses.length); i++) {
          const question = testQuestions[i];
          const response = responses[i];
          
          const { error: detailError } = await supabase
            .from('test_attempt_details')
            .insert({
              test_attempt_id: testAttempt.id,
              question_id: question.id,
              selected_answer: response.selectedAnswer,
              is_correct: response.isCorrect,
              time_taken: response.timeTaken
            });
          
          if (!detailError) {
            console.log(`✅ Added response for question ${i + 1}: ${response.selectedAnswer} (${response.isCorrect ? 'correct' : 'incorrect'})`);
          }
        }
      }
      
      // Mark the corresponding section as completed in user progress
      const { error: progressError } = await supabase
        .from('user_section_progress')
        .upsert({
          user_id: studentId,
          course_section_id: testSection.course_section_id,
          completed: true,
          completed_at: new Date().toISOString(),
          score: 75
        });
      
      if (!progressError) {
        console.log('✅ Updated section progress');
      }
      
      // Update enrollment progress
      const { data: totalSections } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
      
      const { data: completedSections } = await supabase
        .from('user_section_progress')
        .select('id')
        .eq('user_id', studentId)
        .eq('completed', true);
      
      const progressPercentage = Math.round((completedSections?.length || 0) / (totalSections?.length || 1) * 100);
      
      await supabase
        .from('enrollments')
        .update({ progress_percentage: progressPercentage })
        .eq('user_id', studentId)
        .eq('course_id', courseId);
      
      console.log(`✅ Updated enrollment progress to ${progressPercentage}%`);
      
      console.log('');
      console.log('🎉 Sample test data created successfully!');
      console.log('📋 You can now:');
      console.log('   1. Navigate to teacher dashboard');
      console.log('   2. Click Mathematics 101');
      console.log('   3. Click student1 to see section details');
      console.log('   4. Click on any test section card to see detailed responses');
      console.log('   5. View question-by-question breakdown with correct/incorrect answers');
      
    } else {
      console.log('❌ No test sections found for this course');
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

createSampleTestData();
