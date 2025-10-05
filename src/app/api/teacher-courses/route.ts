// API endpoint to get courses with enrollment data for teachers
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all courses with enrollment counts and student details
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        course_name,
        description,
        enrollments (
          id,
          progress_percentage,
          user_id,
          users!inner (
            id,
            username,
            learning_style_id,
            learning_styles (
              name
            )
          )
        )
      `)
      .order('course_name')
    
    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }
    
    // Transform data to include enrollment stats
    const coursesWithStats = courses?.map(course => {
      const enrollments = course.enrollments || []
      const totalStudents = enrollments.length
      const avgProgress = totalStudents > 0 
        ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalStudents
        : 0
      
      return {
        id: course.id,
        course_name: course.course_name,
        description: course.description,
        totalStudents,
        avgProgress: Math.round(avgProgress * 100) / 100,
        students: enrollments.map(enrollment => ({
          id: enrollment.users.id,
          username: enrollment.users.username,
          progress_percentage: enrollment.progress_percentage || 0,
          learning_style: enrollment.users.learning_styles?.name || 'Not assessed'
        }))
      }
    })
    
    return NextResponse.json({ courses: coursesWithStats || [] })
    
  } catch (error) {
    console.error('Error in teacher courses API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
