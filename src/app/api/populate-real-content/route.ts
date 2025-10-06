import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function POST() {
  try {
    console.log('Populating real test and quiz content...');
    const supabase = getSupabaseClient();

    // Get existing course sections
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id, course_id, section_type')
      .in('section_type', ['test', 'quiz']);

    if (sectionsError) {
      console.error('Error fetching course sections:', sectionsError);
      return NextResponse.json({ success: false, error: sectionsError.message });
    }

    console.log('Found course sections:', courseSections?.length || 0);

    // Process test sections
    const testSections = courseSections?.filter(s => s.section_type === 'test') || [];
    
    for (const section of testSections) {
      // Check if test_section already exists
      const { data: existingTestSection } = await supabase
        .from('test_sections')
        .select('id')
        .eq('course_section_id', section.id)
        .single();

      let testSectionId = existingTestSection?.id;

      if (!existingTestSection) {
        // Create test_section
        const { data: newTestSection, error: testSectionError } = await supabase
          .from('test_sections')
          .insert({
            course_section_id: section.id,
            style_id: null
          })
          .select('id')
          .single();

        if (testSectionError) {
          console.error('Error creating test section:', testSectionError);
          continue;
        }

        testSectionId = newTestSection.id;
      }

      // Check if questions already exist
      const { data: existingQuestions } = await supabase
        .from('test_questions')
        .select('id')
        .eq('test_section_id', testSectionId);

      if (existingQuestions && existingQuestions.length > 0) {
        console.log('Questions already exist for test section:', testSectionId);
        continue;
      }

      // Create sample test questions
      const sampleQuestions = [
        {
          question_text: "What is the fundamental principle of good software design?",
          correct_answer: "Separation of concerns",
          choices: [
            "Making everything as complex as possible",
            "Separation of concerns",
            "Writing all code in one file",
            "Avoiding documentation"
          ]
        },
        {
          question_text: "Which approach leads to more maintainable code?",
          correct_answer: "Following established patterns and best practices",
          choices: [
            "Writing code without any structure",
            "Following established patterns and best practices", 
            "Copying code from random sources",
            "Ignoring coding standards"
          ]
        }
      ];

      for (const question of sampleQuestions) {
        // Create test question
        const { data: testQuestion, error: questionError } = await supabase
          .from('test_questions')
          .insert({
            test_section_id: testSectionId,
            question_text: question.question_text,
            correct_answer: question.correct_answer,
            image_url: null
          })
          .select('id')
          .single();

        if (questionError) {
          console.error('Error creating test question:', questionError);
          continue;
        }

        // Create test choices
        const choices = question.choices.map(choice => ({
          question_id: testQuestion.id,
          choice_text: choice
        }));

        const { error: choicesError } = await supabase
          .from('test_choices')
          .insert(choices);

        if (choicesError) {
          console.error('Error creating test choices:', choicesError);
        }
      }

      console.log('Created test questions for section:', section.id);
    }

    // Process quiz sections
    const quizSections = courseSections?.filter(s => s.section_type === 'quiz') || [];
    
    for (const section of quizSections) {
      // Check if quiz_section already exists
      const { data: existingQuizSection } = await supabase
        .from('quiz_sections')
        .select('id')
        .eq('course_section_id', section.id)
        .single();

      let quizSectionId = existingQuizSection?.id;

      if (!existingQuizSection) {
        // Create quiz_section
        const { data: newQuizSection, error: quizSectionError } = await supabase
          .from('quiz_sections')
          .insert({
            course_section_id: section.id,
            style_id: null
          })
          .select('id')
          .single();

        if (quizSectionError) {
          console.error('Error creating quiz section:', quizSectionError);
          continue;
        }

        quizSectionId = newQuizSection.id;
      }

      // Check if content already exists
      const { data: existingContent } = await supabase
        .from('quiz_contents')
        .select('id')
        .eq('quiz_section_id', quizSectionId);

      if (existingContent && existingContent.length > 0) {
        console.log('Content already exists for quiz section:', quizSectionId);
        continue;
      }

      // Create sample quiz content
      const { error: contentError } = await supabase
        .from('quiz_contents')
        .insert({
          quiz_section_id: quizSectionId,
          description: 'Quick knowledge check to reinforce key concepts covered in this section.',
          image_url: null
        });

      if (contentError) {
        console.error('Error creating quiz content:', contentError);
      } else {
        console.log('Created quiz content for section:', section.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Real test and quiz content populated successfully!',
      testSections: testSections.length,
      quizSections: quizSections.length
    });

  } catch (error) {
    console.error('Error populating content:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
