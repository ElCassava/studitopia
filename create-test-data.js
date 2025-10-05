require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function createTestData() {
  try {
    console.log('🎯 Creating minimal test data for clickable students demo...');
    
    // Get existing data
    const { data: users } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('role', 'student')
      .limit(2);
    
    const { data: courses } = await supabase
      .from('courses')
      .select('id, course_name')
      .limit(1);
    
    if (!users || users.length === 0) {
      console.log('❌ No students found');
      return;
    }
    
    if (!courses || courses.length === 0) {
      console.log('❌ No courses found');
      return;
    }
    
    const student = users[0];
    const course = courses[0];
    
    console.log(`📚 Using student: ${student.username}`);
    console.log(`📖 Using course: ${course.course_name}`);
    
    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: student.id,
        course_id: course.id,
        progress_percentage: 75,
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (enrollError) {
      console.log('⚠️  Enrollment might already exist:', enrollError.message);
    } else {
      console.log('✅ Created enrollment');
    }
    
    console.log('🎉 Test data setup complete!');
    console.log('📋 You can now test:');
    console.log('   1. Teacher dashboard shows the course with 1 student');
    console.log('   2. Clicking the course shows student list');  
    console.log('   3. Clicking the student shows student details');
    console.log('   4. All APIs use direct database queries (no views)');
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

createTestData();
