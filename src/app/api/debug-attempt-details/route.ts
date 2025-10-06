import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    const supabase = getSupabaseClient();
    
    // Get test attempts with detailed tracking
    let testQuery = supabase
      .from('test_attempts')
      .select(`
        id,
        user_id,
        test_section_id,
        start_time,
        end_time,
        score,
        test_sections (
          id,
          course_sections (
            id,
            course_id,
            courses (
              course_name
            )
          )
        )
      `)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(10);
    
    if (userId) {
      testQuery = testQuery.eq('user_id', userId);
    }
    
    if (courseId) {
      testQuery = testQuery.eq('test_sections.course_sections.course_id', courseId);
    }
    
    const { data: testAttempts, error: testError } = await testQuery;
    
    if (testError) {
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }
    
    // Get detailed attempt data for each test
    const detailedAttempts = await Promise.all(
      (testAttempts || []).map(async (attempt) => {
        const { data: details, error: detailsError } = await supabase
          .from('test_attempt_details')
          .select(`
            id,
            question_id,
            selected_answer,
            is_correct,
            time_taken,
            answered_at,
            test_questions (
              id,
              question_text,
              correct_answer
            )
          `)
          .eq('test_attempt_id', attempt.id)
          .order('question_id');
        
        return {
          ...attempt,
          questionDetails: details || [],
          detailsError: detailsError?.message || null
        };
      })
    );
    
    // Calculate summary statistics
    const totalAttempts = detailedAttempts.length;
    const totalQuestions = detailedAttempts.reduce((sum, attempt) => sum + attempt.questionDetails.length, 0);
    const correctAnswers = detailedAttempts.reduce((sum, attempt) => 
      sum + attempt.questionDetails.filter(q => q.is_correct).length, 0
    );
    
    return NextResponse.json({
      success: true,
      summary: {
        totalAttempts,
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        accuracyRate: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      },
      attempts: detailedAttempts,
      sampleAttempt: detailedAttempts[0] || null
    });
    
  } catch (error) {
    console.error('Error in debug attempt details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
