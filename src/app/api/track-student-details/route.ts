import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      courseId, 
      testSectionId, 
      testAttemptId,
      detailedAnswers 
    } = body;

    if (!userId || !testSectionId || !testAttemptId || !detailedAnswers) {
      return NextResponse.json({ 
        error: 'Missing required fields for tracking student details' 
      }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    console.log('Tracking student attempt details:', {
      userId,
      testSectionId, 
      testAttemptId,
      answersCount: detailedAnswers.length
    });

    // Prepare detailed tracking records
    const trackingRecords = detailedAnswers.map((answer: any) => ({
      test_attempt_id: testAttemptId,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer?.toString() || null,
      is_correct: answer.isCorrect,
      time_taken: answer.timeSpent || 0
      // Note: answered_at column not available in current schema
    }));

    // Insert detailed tracking records
    const { error: trackingError } = await supabase
      .from('test_attempt_details')
      .insert(trackingRecords);

    if (trackingError) {
      console.error('Error inserting student attempt details:', trackingError);
      return NextResponse.json({ 
        error: 'Failed to track student attempt details',
        details: trackingError
      }, { status: 500 });
    }

    // Calculate and return statistics
    const correctAnswers = detailedAnswers.filter((a: any) => a.isCorrect).length;
    const totalQuestions = detailedAnswers.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    console.log(`✅ Successfully tracked ${trackingRecords.length} student attempt details`);

    return NextResponse.json({
      success: true,
      tracked: trackingRecords.length,
      statistics: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        accuracy
      }
    });

  } catch (error) {
    console.error('Unexpected error tracking student attempt details:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
