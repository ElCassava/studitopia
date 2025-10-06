require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function createSampleProgress() {
  try {
    console.log('📚 Creating sample section progress for demonstration...');
    console.log('Connecting to database...');
    
    const studentId = '6f94132f-bd5f-4a73-b66a-8eecf3a203b4'; // student1
    
    // Get a few sections to mark as completed
    const { data: sections } = await supabase
      .from('course_sections')
      .select('id, section_type')
      .eq('course_id', '35b8a545-de10-4450-824a-38abb30b67b9')
      .limit(5);
    
    if (sections && sections.length > 0) {
      // Mark first 3 sections as completed
      const completedSections = sections.slice(0, 3);
      
      for (let i = 0; i < completedSections.length; i++) {
        const section = completedSections[i];
        
        const progressData = {
          user_id: studentId,
          course_section_id: section.id,
          completed: true,
          completed_at: new Date().toISOString(),
          score: section.section_type === 'learn' ? null : Math.floor(Math.random() * 30) + 70 // 70-100% for tests/quizzes
        };
        
        const { error } = await supabase
          .from('user_section_progress')
          .upsert(progressData);
        
        if (error) {
          console.log(`⚠️  Error for section ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Marked section ${i + 1} (${section.section_type}) as completed`);
        }
      }
      
      // Update enrollment progress to reflect completion
      const completionPercentage = Math.round((3 / sections.length) * 100);
      
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ progress_percentage: completionPercentage })
        .eq('user_id', studentId)
        .eq('course_id', '35b8a545-de10-4450-824a-38abb30b67b9');
      
      if (enrollError) {
        console.log('⚠️  Error updating enrollment:', enrollError.message);
      } else {
        console.log(`✅ Updated enrollment progress to ${completionPercentage}%`);
      }
      
      console.log('');
      console.log('🎉 Sample progress created! Now you can see:');
      console.log('   1. Teacher dashboard shows updated progress percentage');
      console.log('   2. Course analytics reflects completed sections');
      console.log('   3. Student details show which sections are completed vs not completed');
      console.log('   4. Green indicators for completed sections, gray for incomplete');
      
    } else {
      console.log('❌ No sections found');
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

createSampleProgress();
