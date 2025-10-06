import { NextResponse } from 'next/server';
import { getCourseById, getUserCourseProgress } from '@/common/courses';

export async function GET() {
  try {
    const testUserId = '7a94e960-9da8-4a20-820a-938b9f0ec14b'; // admin user
    const testCourseId = '35b8a545-de10-4450-824a-38abb30b67b9'; // first course

    console.log('Testing complete learn page flow...');

    // Test 1: Get course details
    console.log('1. Testing getCourseById...');
    const courseData = await getCourseById(testCourseId, testUserId);
    
    if (!courseData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Course not found',
        step: 'getCourseById'
      });
    }

    if (!courseData.is_enrolled) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not enrolled in course',
        step: 'enrollment_check',
        courseData
      });
    }

    // Test 2: Get user progress
    console.log('2. Testing getUserCourseProgress...');
    const progress = await getUserCourseProgress(testUserId, testCourseId);

    return NextResponse.json({ 
      success: true,
      message: 'Learn page flow test completed successfully',
      results: {
        courseData,
        progress,
        isEnrolled: courseData.is_enrolled,
        progressPercentage: progress?.progressPercentage || 0,
        completedSections: progress?.completedSections || 0,
        totalSections: progress?.totalSections || 0
      }
    });

  } catch (error) {
    console.error('Error in learn page flow test:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'exception'
    }, { status: 500 });
  }
}
