import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabase/client';
import { unenrollFromCourse } from '@/common/courses';

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json();
    
    if (!userId || !courseId) {
      return NextResponse.json({ 
        error: 'Missing userId or courseId' 
      }, { status: 400 });
    }

    console.log('🧪 Testing unenroll functionality for:', { userId, courseId });
    
    const supabase = getSupabaseClient();
    
    // First, let's check what data exists before unenrolling
    const { data: courseSections } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);
    
    const sectionIds = courseSections?.map(s => s.id) || [];
    
    // Check existing progress data
    const { data: existingProgress } = await supabase
      .from('user_section_progress') 
      .select('*')
      .eq('user_id', userId)
      .in('course_section_id', sectionIds);
    
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    // Count test attempts
    const { data: learnSections } = await supabase
      .from('learn_sections')
      .select('id')
      .in('course_section_id', sectionIds);
    
    const { data: testSections } = await supabase
      .from('test_sections')
      .select('id')
      .in('course_section_id', sectionIds);
    
    const { data: quizSections } = await supabase
      .from('quiz_sections')
      .select('id')
      .in('course_section_id', sectionIds);

    const learnSectionIds = learnSections?.map(s => s.id) || [];
    const testSectionIds = testSections?.map(s => s.id) || [];
    const quizSectionIds = quizSections?.map(s => s.id) || [];

    const { data: testAttempts } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .in('test_section_id', testSectionIds);

    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .in('quiz_section_id', quizSectionIds);

    const { data: learnSessions } = await supabase
      .from('learn_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('learn_section_id', learnSectionIds);

    const beforeData = {
      courseSections: courseSections?.length || 0,
      userProgress: existingProgress?.length || 0,
      enrollment: existingEnrollment?.length || 0,
      testAttempts: testAttempts?.length || 0,
      quizAttempts: quizAttempts?.length || 0,
      learnSessions: learnSessions?.length || 0
    };

    console.log('📊 Data before unenrollment:', beforeData);

    // Now perform the unenroll
    const success = await unenrollFromCourse(userId, courseId);

    if (!success) {
      return NextResponse.json({ 
        error: 'Unenroll failed' 
      }, { status: 500 });
    }

    // Check what data remains after unenrolling
    const { data: remainingProgress } = await supabase
      .from('user_section_progress')
      .select('*')
      .eq('user_id', userId)
      .in('course_section_id', sectionIds);

    const { data: remainingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    const { data: remainingTestAttempts } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .in('test_section_id', testSectionIds);

    const { data: remainingQuizAttempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .in('quiz_section_id', quizSectionIds);

    const { data: remainingLearnSessions } = await supabase
      .from('learn_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('learn_section_id', learnSectionIds);

    const afterData = {
      userProgress: remainingProgress?.length || 0,
      enrollment: remainingEnrollment?.length || 0,
      testAttempts: remainingTestAttempts?.length || 0,
      quizAttempts: remainingQuizAttempts?.length || 0,
      learnSessions: remainingLearnSessions?.length || 0
    };

    console.log('📊 Data after unenrollment:', afterData);

    const cleanupSuccess = {
      progressCleaned: beforeData.userProgress > 0 && afterData.userProgress === 0,
      enrollmentCleaned: beforeData.enrollment > 0 && afterData.enrollment === 0,
      testAttemptsCleaned: beforeData.testAttempts === 0 || afterData.testAttempts === 0,
      quizAttemptsCleaned: beforeData.quizAttempts === 0 || afterData.quizAttempts === 0,
      learnSessionsCleaned: beforeData.learnSessions === 0 || afterData.learnSessions === 0
    };

    return NextResponse.json({
      success: true,
      message: 'Unenroll test completed',
      beforeData,
      afterData,
      cleanupSuccess,
      allDataCleaned: Object.values(cleanupSuccess).every(v => v === true)
    });

  } catch (error) {
    console.error('Test unenroll error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
