import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

export async function GET() {
  try {
    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', 'admin')
      .single();

    // Get first course
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, course_name')
      .limit(1);

    if (userError || coursesError || !adminUser || !courses || courses.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Could not find admin user or courses',
        errors: { userError, coursesError }
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      adminUser,
      course: courses[0]
    });

  } catch (error) {
    console.error('API Error getting info:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error getting info', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
