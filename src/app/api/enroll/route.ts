import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json({ 
        success: false, 
        message: 'userId and courseId are required' 
      }, { status: 400 });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ 
        success: false, 
        message: 'User is already enrolled in this course' 
      });
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0
      }])
      .select()
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create enrollment' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment created successfully!',
      enrollment 
    });

  } catch (error) {
    console.error('API Error creating enrollment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error creating enrollment', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
