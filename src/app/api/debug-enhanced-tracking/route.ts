import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    const supabase = getSupabaseClient();
    
    // Get latest test attempts with details
    const { data: testAttempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select(`
        id,
        user_id,
        test_section_id,
        start_time,
        end_time,
        score
      `)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(3);
    
    if (attemptsError) {
      return NextResponse.json({ error: attemptsError.message }, { status: 500 });
    }
    
    // Get detailed tracking for these attempts
    const attemptDetails = await Promise.all(
      (testAttempts || []).map(async (attempt) => {
        const { data: details, error: detailsError } = await supabase
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
          .eq('test_attempt_id', attempt.id)
          .order('question_id');
        
        return {
          attempt: attempt,
          detailsCount: details?.length || 0,
          details: details || [],
          detailsError: detailsError?.message || null
        };
      })
    );
    
    // Get user info for context
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, learning_style_id')
      .in('id', (testAttempts || []).map(a => a.user_id));
    
    return NextResponse.json({
      success: true,
      totalAttempts: testAttempts?.length || 0,
      attemptsWithDetails: attemptDetails.filter(a => a.detailsCount > 0).length,
      attemptDetails,
      users: users || [],
      summary: {
        totalQuestions: attemptDetails.reduce((sum, a) => sum + a.detailsCount, 0),
        correctAnswers: attemptDetails.reduce((sum, a) => 
          sum + (a.details?.filter((d: any) => d.is_correct).length || 0), 0
        )
      }
    });
    
  } catch (error) {
    console.error('Error in enhanced attempt tracking debug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
