import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('🧪 Starting end-to-end test attempt tracking simulation...');
    
    // Use existing course and user data
    const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08';
    const testSectionId = '3e8019bf-dd1f-42c1-9d31-35a2fbc49aee';
    const userId = '3f4505a0-3042-4774-bfa6-3010d59b1d2c'; // bob02
    
    // Get actual test questions from the course
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_text,
        correct_answer,
        test_choices (
          id,
          choice_text
        )
      `)
      .eq('test_section_id', testSectionId)
      .order('id')
      .limit(5); // Test with first 5 questions
    
    if (questionsError) {
      return NextResponse.json({ 
        error: 'Failed to get test questions',
        details: questionsError 
      }, { status: 500 });
    }
    
    if (!testQuestions || testQuestions.length === 0) {
      return NextResponse.json({ 
        error: 'No test questions found for this section'
      }, { status: 404 });
    }
    
    console.log(`📝 Found ${testQuestions.length} test questions`);
    
    // Simulate test submission with mix of correct and incorrect answers
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 10 * 60 * 1000); // 10 minutes later
    
    // Create test attempt
    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: userId,
        test_section_id: testSectionId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        score: 80 // Will calculate actual score
      })
      .select()
      .single();
    
    if (attemptError) {
      return NextResponse.json({ 
        error: 'Failed to create test attempt',
        details: attemptError 
      }, { status: 500 });
    }
    
    console.log(`✅ Created test attempt: ${testAttempt.id}`);
    
    // Simulate detailed answers with some correct and some incorrect
    const detailedAnswers = testQuestions.map((question, index) => {
      const choices = question.test_choices || [];
      const correctChoiceText = question.correct_answer;
      const correctIndex = choices.findIndex((choice: any) => 
        choice.choice_text.startsWith(correctChoiceText + '.')
      );
      
      // Simulate: answer first 4 correctly, last 1 incorrectly
      const userSelectedIndex = index < 4 ? correctIndex : (correctIndex + 1) % choices.length;
      const isCorrect = userSelectedIndex === correctIndex;
      
      return {
        test_attempt_id: testAttempt.id,
        question_id: question.id,
        selected_answer: userSelectedIndex.toString(),
        is_correct: isCorrect,
        time_taken: Math.floor(Math.random() * 60) + 30, // 30-90 seconds per question
      };
    });
    
    // Insert detailed tracking data
    const { error: detailsError } = await supabase
      .from('test_attempt_details')
      .insert(detailedAnswers);
    
    if (detailsError) {
      return NextResponse.json({ 
        error: 'Failed to insert detailed answers',
        details: detailsError 
      }, { status: 500 });
    }
    
    console.log(`✅ Inserted ${detailedAnswers.length} detailed answer records`);
    
    // Calculate actual score
    const correctAnswers = detailedAnswers.filter(a => a.is_correct).length;
    const actualScore = Math.round((correctAnswers / detailedAnswers.length) * 100);
    
    // Update test attempt with actual score
    await supabase
      .from('test_attempts')
      .update({ score: actualScore })
      .eq('id', testAttempt.id);
    
    // Verify the tracking worked by fetching the data back
    const { data: verifyDetails, error: verifyError } = await supabase
      .from('test_attempt_details')
      .select(`
        id,
        question_id,
        selected_answer,
        is_correct,
        time_taken,
        test_questions (
          question_text,
          correct_answer
        )
      `)
      .eq('test_attempt_id', testAttempt.id);
    
    console.log(`🔍 Verification: Found ${verifyDetails?.length || 0} tracked details`);
    
    return NextResponse.json({
      success: true,
      message: 'End-to-end test attempt tracking completed successfully!',
      testAttempt: {
        id: testAttempt.id,
        userId: userId,
        testSectionId: testSectionId,
        score: actualScore,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      tracking: {
        questionsTotal: testQuestions.length,
        correctAnswers: correctAnswers,
        incorrectAnswers: detailedAnswers.length - correctAnswers,
        detailsInserted: detailedAnswers.length,
        detailsVerified: verifyDetails?.length || 0
      },
      sampleDetails: verifyDetails?.slice(0, 2) || []
    });
    
  } catch (error) {
    console.error('Error in end-to-end test:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
