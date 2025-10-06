import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get recent test attempts
    const { data: testAttempts, error: testError } = await supabase
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
      .limit(5);
    
    if (testError) {
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }
    
    // Get attempt details for these attempts
    const attemptDetails = await Promise.all(
      (testAttempts || []).map(async (attempt) => {
        const { data: details, error: detailsError } = await supabase
          .from('test_attempt_details')
          .select('*')
          .eq('test_attempt_id', attempt.id);
        
        return {
          attempt_id: attempt.id,
          user_id: attempt.user_id,
          score: attempt.score,
          details_count: details?.length || 0,
          details: details || [],
          error: detailsError?.message || null
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      totalAttempts: testAttempts?.length || 0,
      attemptsWithDetails: attemptDetails.filter(a => a.details_count > 0).length,
      sampleData: attemptDetails[0] || null,
      allData: attemptDetails
    });
    
  } catch (error) {
    console.error('Error checking attempt details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
