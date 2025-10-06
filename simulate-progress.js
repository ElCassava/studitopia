require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function simulateStudentProgress() {
  try {
    console.log('🎓 Simulating realistic student progress...');
    
    const studentId = '6f94132f-bd5f-4a73-b66a-8eecf3a203b4';
    const courseId = '35b8a545-de10-4450-824a-38abb30b67b9';
    
    // Get sections organized by type
    const { data: sections } = await supabase
      .from('course_sections')
      .select('id, section_type')
      .eq('course_id', courseId)
      .order('section_type');
    
    if (sections && sections.length > 0) {
      console.log(`Found ${sections.length} sections total`);
      
      // Simulate completing first 3 learning sections
      const learnSections = sections.filter(s => s.section_type === 'learn').slice(0, 3);
      const testSections = sections.filter(s => s.section_type === 'test').slice(0, 1);
      
      // Complete learning sections
      for (let i = 0; i < learnSections.length; i++) {
        const section = learnSections[i];
        const { error } = await supabase
          .from('user_section_progress')
          .upsert({
            user_id: studentId,
            course_section_id: section.id,
            completed: true,
            completed_at: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000).toISOString(), // Staggered completion dates
            score: null // Learning sections don't have scores
          });
        
        if (!error) {
          console.log(`✅ Completed learning section ${i + 1}`);
        }
      }
      
      // Complete one test section
      if (testSections.length > 0) {
        const { error } = await supabase
          .from('user_section_progress')
          .upsert({
            user_id: studentId,
            course_section_id: testSections[0].id,
            completed: true,
            completed_at: new Date().toISOString(),
            score: 87 // Test score
          });
        
        if (!error) {
          console.log(`✅ Completed test with 87% score`);
        }
      }
      
      // Calculate accurate progress (4 out of 20 sections = 20%)
      const completedSections = learnSections.length + testSections.length;
      const progressPercentage = Math.round((completedSections / sections.length) * 100);
      
      // Update enrollment progress
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ progress_percentage: progressPercentage })
        .eq('user_id', studentId)
        .eq('course_id', courseId);
      
      if (!enrollError) {
        console.log(`✅ Updated enrollment progress to ${progressPercentage}%`);
      }
      
      console.log('');
      console.log('🎉 Simulated Progress Complete!');
      console.log(`📊 Results:`);
      console.log(`   • 3 Learning sections completed`);
      console.log(`   • 1 Test completed (87% score)`);
      console.log(`   • Overall progress: ${progressPercentage}% (${completedSections}/${sections.length} sections)`);
      console.log('');
      console.log('🔍 Now you can see:');
      console.log('   • Grouped sections with progress bars per type');
      console.log('   • Green completion indicators for finished sections');
      console.log('   • Score badges for completed tests/quizzes');
      console.log('   • Accurate overall progress calculation');
      
    } else {
      console.log('❌ No sections found');
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

// Uncomment the line below to run the simulation
// simulateStudentProgress();

console.log('📝 To simulate student progress, uncomment the last line in this file and run again.');
console.log('💡 This will show how the UI looks with actual completed sections vs all incomplete.');
