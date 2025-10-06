// API endpoint to get detailed course analytics for teachers
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // Get course basic info
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, course_name, description')
      .eq('id', courseId)
      .single()
    
    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    // Get enrolled students with their overall progress
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        progress_percentage,
        users!inner (
          id,
          username,
          learning_style_id,
          learning_styles (
            name
          )
        )
      `)
      .eq('course_id', courseId)
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return NextResponse.json({ error: enrollmentsError.message }, { status: 500 })
    }
    
    // Get detailed performance data for each student
    const studentsWithPerformance = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        const userId = enrollment.users.id
        
        // Get test performance
        const { data: testAttempts } = await supabase
          .from('test_attempts')
          .select(`
            id,
            score,
            start_time,
            end_time,
            test_sections!inner (
              course_sections!inner (
                course_id
              )
            )
          `)
          .eq('user_id', userId)
          .eq('test_sections.course_sections.course_id', courseId)
          .not('end_time', 'is', null)
        
        // Get quiz performance
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select(`
            id,
            score,
            start_time,
            end_time,
            quiz_sections!inner (
              course_sections!inner (
                course_id
              )
            )
          `)
          .eq('user_id', userId)
          .eq('quiz_sections.course_sections.course_id', courseId)
          .not('end_time', 'is', null)
        
        // Get section progress
        const { data: sectionProgress } = await supabase
          .from('user_section_progress')
          .select(`
            section_type,
            completed,
            completed_at,
            score
          `)
          .eq('user_id', userId)
          .eq('course_section_id', courseId) // This might need adjustment based on actual schema
        
        // Calculate performance metrics
        const testScores = testAttempts?.map(t => t.score || 0) || []
        const quizScores = quizAttempts?.map(q => q.score || 0) || []
        const allScores = [...testScores, ...quizScores]
        
        const avgTestScore = testScores.length > 0 
          ? testScores.reduce((sum, s) => sum + s, 0) / testScores.length
          : 0
        
        const avgQuizScore = quizScores.length > 0 
          ? quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length
          : 0
        
        const overallAvg = allScores.length > 0 
          ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          : 0
        
        return {
          id: enrollment.users.id,
          username: enrollment.users.username,
          learning_style: enrollment.users.learning_styles?.name || 'Not assessed',
          progress_percentage: enrollment.progress_percentage || 0,
          performance: {
            testsCompleted: testAttempts?.length || 0,
            quizzesCompleted: quizAttempts?.length || 0,
            avgTestScore: Math.round(avgTestScore * 100) / 100,
            avgQuizScore: Math.round(avgQuizScore * 100) / 100,
            overallAverage: Math.round(overallAvg * 100) / 100,
            sectionsCompleted: sectionProgress?.filter(s => s.completed).length || 0,
            totalSections: sectionProgress?.length || 0
          },
          recentActivity: {
            lastTestDate: testAttempts?.length > 0 
              ? testAttempts.sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())[0].end_time
              : null,
            lastQuizDate: quizAttempts?.length > 0 
              ? quizAttempts.sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())[0].end_time
              : null
          }
        }
      })
    )
    
    // Calculate course-wide statistics
    const totalStudents = studentsWithPerformance.length
    const avgCourseProgress = totalStudents > 0 
      ? studentsWithPerformance.reduce((sum, s) => sum + s.progress_percentage, 0) / totalStudents
      : 0
    
    const avgCourseScore = totalStudents > 0 
      ? studentsWithPerformance.reduce((sum, s) => sum + s.performance.overallAverage, 0) / totalStudents
      : 0
    
    const completionRate = totalStudents > 0 
      ? (studentsWithPerformance.filter(s => s.progress_percentage >= 100).length / totalStudents) * 100
      : 0
    
    return NextResponse.json({
      course: {
        id: course.id,
        course_name: course.course_name,
        description: course.description
      },
      statistics: {
        totalStudents,
        avgProgress: Math.round(avgCourseProgress * 100) / 100,
        avgScore: Math.round(avgCourseScore * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        activeStudents: studentsWithPerformance.filter(s => 
          s.recentActivity.lastTestDate || s.recentActivity.lastQuizDate
        ).length
      },
      students: studentsWithPerformance
    })
    
  } catch (error) {
    console.error('Error in course analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
