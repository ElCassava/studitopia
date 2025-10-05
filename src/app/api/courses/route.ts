import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Get all courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, course_name')
      .order('course_name')

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    return NextResponse.json({ courses: courses || [] })

  } catch (error) {
    console.error('Error in courses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
