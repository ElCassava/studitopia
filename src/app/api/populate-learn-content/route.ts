import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

export async function POST() {
  try {
    console.log('API: Starting to populate learn content...');

    // Get existing course sections of type 'learn'
    const { data: existingLearnSections, error: fetchError } = await supabase
      .from('course_sections')
      .select('id, course_id')
      .eq('section_type', 'learn');

    if (fetchError) {
      console.error('Error fetching existing learn sections:', fetchError);
      return NextResponse.json({ success: false, message: 'Failed to fetch existing sections' }, { status: 500 });
    }

    console.log('Found existing learn sections:', existingLearnSections?.length || 0);

    // For each course section, create learn_section and learn_content if they don't exist
    for (let i = 0; i < (existingLearnSections || []).length; i++) {
      const courseSection = existingLearnSections![i];
      
      // Check if learn_section already exists
      const { data: existingLearnSection } = await supabase
        .from('learn_sections')
        .select('id')
        .eq('course_section_id', courseSection.id)
        .single();

      if (!existingLearnSection) {
        // Create learn_section
        const { data: learnSection, error: learnSectionError } = await supabase
          .from('learn_sections')
          .insert([{
            course_section_id: courseSection.id,
            style_id: null
          }])
          .select()
          .single();

        if (learnSection && !learnSectionError) {
          // Create learn_content
          const contentData = [
            `Introduction to Core Concepts - Learn the fundamental concepts that form the foundation of this course. This section covers the basic principles and provides a solid understanding of what you'll be working with throughout the rest of the course.`,
            `Understanding the Basics - In this section, we'll dive deeper into the basic principles and explore how they apply in real-world scenarios. You'll learn practical applications and see examples of how these concepts work in practice.`,
            `Advanced Techniques - Building on what you've learned, we'll explore more advanced techniques and methodologies. This section will challenge you to think critically and apply your knowledge to more complex problems and scenarios.`,
            `Best Practices - Learn industry best practices and common patterns that will help you apply these concepts effectively in real-world projects.`,
            `Practical Applications - Now let's see how these concepts work in practice. We'll walk through several examples and case studies to reinforce your understanding.`
          ];

          await supabase
            .from('learn_contents')
            .insert([{
              learn_section_id: learnSection.id,
              description: contentData[i % contentData.length],
              image_url: null
            }]);

          console.log(`Created learn content for section ${i + 1}`);
        } else {
          console.error('Error creating learn section:', learnSectionError);
        }
      } else {
        console.log(`Learn section already exists for course section ${courseSection.id}`);
      }
    }

    console.log('Learn content population completed successfully!');
    return NextResponse.json({ success: true, message: 'Learn content populated successfully!' });

  } catch (error) {
    console.error('API Error populating learn content:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error populating learn content', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
