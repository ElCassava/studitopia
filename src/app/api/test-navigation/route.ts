import { NextRequest, NextResponse } from 'next/server';
import { enrollInCourse, getUserCourseProgress, getNextAvailableSections } from '@/common/courses';

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json();
    
    if (!courseId || !userId) {
      return NextResponse.json({ error: 'courseId and userId are required' }, { status: 400 });
    }
    
    console.log('🧭 Testing navigation logic for:', { courseId, userId });
    
    // First, enroll the user
    const enrollResult = await enrollInCourse(userId, courseId);
    console.log('🧭 Enrollment result:', enrollResult);
    
    // Get user progress
    const progressData = await getUserCourseProgress(userId, courseId);
    console.log('🧭 Progress data:', progressData);
    
    // Get available sections
    const availableSections = await getNextAvailableSections(userId, courseId);
    console.log('🧭 Available sections:', availableSections);
    
    // Simulate navigation logic
    if (!progressData || !availableSections) {
      return NextResponse.json({
        success: true,
        enrollResult,
        recommendedAction: 'go to learn page (no progress data)',
        route: `/courses/${courseId}/learn`
      });
    }
    
    // Check section completion status by type
    const learnSections = progressData.sectionProgress.filter(s => s.section_type === 'learn');
    const testSections = progressData.sectionProgress.filter(s => s.section_type === 'test');
    const quizSections = progressData.sectionProgress.filter(s => s.section_type === 'quiz');

    const learnCompleted = learnSections.length > 0 && learnSections.every(s => s.completed);
    const testCompleted = testSections.length > 0 && testSections.every(s => s.completed);
    const quizCompleted = quizSections.length > 0 && quizSections.every(s => s.completed);
    
    let recommendedAction = '';
    let route = '';
    
    if (!learnCompleted && availableSections.learn.length > 0) {
      recommendedAction = 'go to learn page (learn sections not completed)';
      route = `/courses/${courseId}/learn`;
    } else if (learnCompleted && !testCompleted && availableSections.test.length > 0) {
      recommendedAction = 'go to test page (learn completed, test not completed)';
      route = `/courses/${courseId}/test`;
    } else if (learnCompleted && testCompleted && !quizCompleted && availableSections.quiz.length > 0) {
      recommendedAction = 'go to quiz page (learn and test completed, quiz not completed)';
      route = `/courses/${courseId}/quiz`;
    } else if (learnCompleted && testCompleted && quizCompleted) {
      recommendedAction = 'course completed - stay on overview';
      route = `/courses/${courseId}`;
    } else {
      recommendedAction = 'fallback to learn page';
      route = `/courses/${courseId}/learn`;
    }
    
    return NextResponse.json({
      success: true,
      enrollResult,
      progressData: {
        totalSections: progressData.totalSections,
        completedSections: progressData.completedSections,
        progressPercentage: progressData.progressPercentage,
        learnSections: learnSections.length,
        testSections: testSections.length,
        quizSections: quizSections.length,
        learnCompleted,
        testCompleted,
        quizCompleted
      },
      availableSections: {
        learn: availableSections.learn.length,
        test: availableSections.test.length,
        quiz: availableSections.quiz.length
      },
      recommendedAction,
      route
    });
    
  } catch (error) {
    console.error('🧭 Error testing navigation:', error);
    return NextResponse.json({ 
      error: 'Navigation test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
