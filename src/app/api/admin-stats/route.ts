import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total courses count
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })

    // Get total test attempts count
    const { count: totalTestAttempts } = await supabase
      .from('test_attempts')
      .select('*', { count: 'exact', head: true })
      .not('end_time', 'is', null) // Only completed tests

    // Get total quiz attempts count
    const { count: totalQuizAttempts } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .not('end_time', 'is', null) // Only completed quizzes

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentTests } = await supabase
      .from('test_attempts')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', sevenDaysAgo.toISOString())
      .not('end_time', 'is', null)

    const { count: recentQuizzes } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', sevenDaysAgo.toISOString())
      .not('end_time', 'is', null)

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Calculate system health (basic uptime simulation based on recent activity)
    const totalRecentActivity = (recentTests || 0) + (recentQuizzes || 0)
    const systemHealth = totalRecentActivity > 0 ? 99.9 : 95.0 // Simple health calculation

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalTestCompletions: (totalTestAttempts || 0) + (totalQuizAttempts || 0),
      systemHealth: systemHealth,
      recentActivity: {
        tests: recentTests || 0,
        quizzes: recentQuizzes || 0,
        newUsers: recentUsers || 0
      },
      // Calculate growth percentages (simplified)
      growthStats: {
        userGrowth: recentUsers ? Math.min(Math.round((recentUsers / (totalUsers || 1)) * 100), 50) : 0,
        activityGrowth: totalRecentActivity ? Math.min(Math.round((totalRecentActivity / Math.max(totalTestAttempts || 1, 1)) * 100), 25) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
