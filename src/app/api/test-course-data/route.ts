import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/common/courses';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }
    
    console.log('🔍 Testing getCourseById with:', { courseId, userId });
    
    const courseData = await getCourseById(courseId, userId || undefined);
    
    console.log('🔍 Result from getCourseById:', courseData);
    
    return NextResponse.json({
      success: true,
      courseId,
      userId,
      courseData,
      sections: courseData?.sections,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🔍 Error in test API:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
