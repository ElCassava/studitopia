// Utility script to populate the database with test data
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

export async function populateTestData() {
  try {
    console.log('Starting to populate test data...');

    // Create sample courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .insert([
        {
          course_name: 'Introduction to Web Development',
          description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build your first website.'
        },
        {
          course_name: 'React for Beginners',
          description: 'Master React.js and build modern, interactive web applications.'
        },
        {
          course_name: 'Full Stack JavaScript',
          description: 'Complete course covering both frontend and backend JavaScript development.'
        }
      ])
      .select();

    if (coursesError) {
      console.error('Error creating courses:', coursesError);
      return false;
    }

    console.log('Created courses:', courses);

    // Create course sections for each course
    for (const course of courses || []) {
      // Create learn sections
      const { data: learnCourseSections, error: learnError } = await supabase
        .from('course_sections')
        .insert([
          { course_id: course.id, section_type: 'learn' },
          { course_id: course.id, section_type: 'learn' },
          { course_id: course.id, section_type: 'learn' }
        ])
        .select();

      // Create learn_sections and learn_contents for each course section
      if (learnCourseSections && !learnError) {
        for (let i = 0; i < learnCourseSections.length; i++) {
          const courseSection = learnCourseSections[i];
          
          // Create learn_section (linking course_section to learning content)
          const { data: learnSection, error: learnSectionError } = await supabase
            .from('learn_sections')
            .insert([{
              course_section_id: courseSection.id,
              style_id: null // We can add learning styles later
            }])
            .select()
            .single();

          if (learnSection && !learnSectionError) {
            // Create learn_content for this learn_section
            const contentData = [
              {
                description: `Introduction to Core Concepts - Learn the fundamental concepts that form the foundation of this course. This section covers the basic principles and provides a solid understanding of what you'll be working with throughout the rest of the course.`,
              },
              {
                description: `Understanding the Basics - In this section, we'll dive deeper into the basic principles and explore how they apply in real-world scenarios. You'll learn practical applications and see examples of how these concepts work in practice.`,
              },
              {
                description: `Advanced Techniques - Building on what you've learned, we'll explore more advanced techniques and methodologies. This section will challenge you to think critically and apply your knowledge to more complex problems and scenarios.`,
              }
            ];

            await supabase
              .from('learn_contents')
              .insert([{
                learn_section_id: learnSection.id,
                description: contentData[i % contentData.length].description,
                image_url: null
              }]);
          }
        }
      }

      // Create test sections
      const { data: testSections, error: testError } = await supabase
        .from('course_sections')
        .insert([
          { course_id: course.id, section_type: 'test' },
          { course_id: course.id, section_type: 'test' }
        ])
        .select();

      // Create quiz sections
      const { data: quizSections, error: quizError } = await supabase
        .from('course_sections')
        .insert([
          { course_id: course.id, section_type: 'quiz' },
          { course_id: course.id, section_type: 'quiz' },
          { course_id: course.id, section_type: 'quiz' }
        ])
        .select();

      if (learnError || testError || quizError) {
        console.error('Error creating sections:', { learnError, testError, quizError });
      } else {
        console.log(`Created sections for course ${course.course_name}`);
      }
    }

    // Create a test user if it doesn't exist
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'testuser')
      .single();

    if (!existingUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            username: 'testuser',
            password: 'password123', // In a real app, this should be hashed
            email: 'test@example.com',
            role: 'student'
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('Error creating test user:', userError);
      } else {
        console.log('Created test user:', newUser);
      }
    }

    // Create an admin user if it doesn't exist
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!existingAdmin) {
      const { data: newAdmin, error: adminError } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            password: 'admin123', // In a real app, this should be hashed
            email: 'admin@example.com',
            role: 'admin'
          }
        ])
        .select()
        .single();

      if (adminError) {
        console.error('Error creating admin user:', adminError);
      } else {
        console.log('Created admin user:', newAdmin);
      }
    }

    console.log('Test data population completed successfully!');
    return true;

  } catch (error) {
    console.error('Error populating test data:', error);
    return false;
  }
}

export async function clearTestData() {
  try {
    console.log('Clearing test data...');

    // Delete in reverse order of dependencies
    await supabase.from('user_section_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('course_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().eq('username', 'testuser');

    console.log('Test data cleared successfully!');
    return true;

  } catch (error) {
    console.error('Error clearing test data:', error);
    return false;
  }
}
