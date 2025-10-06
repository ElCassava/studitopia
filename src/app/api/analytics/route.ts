import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const analyticsType = searchParams.get('type') || 'overview' // overview, detailed, performance

    const supabase = getSupabaseClient()

    let response = {}

    if (analyticsType === 'overview') {
      // Query test attempts directly with related data
      let testStatsQuery = supabase
        .from('test_attempts')
        .select(`
          id,
          user_id,
          test_section_id,
          start_time,
          end_time,
          score,
          users!inner(
            id,
            username,
            learning_style_id,
            learning_styles(id, name)
          ),
          test_sections!inner(
            id,
            course_section_id,
            course_sections!inner(
              course_id,
              courses!inner(id, course_name)
            )
          )
        `)
        .not('end_time', 'is', null) // Only completed tests
      
      // Query quiz attempts directly with related data
      let quizStatsQuery = supabase
        .from('quiz_attempts')
        .select(`
          id,
          user_id,
          quiz_section_id,
          start_time,
          end_time,
          score,
          users!inner(
            id,
            username,
            learning_style_id,
            learning_styles(id, name)
          ),
          quiz_sections!inner(
            id,
            course_section_id,
            course_sections!inner(
              course_id,
              courses!inner(id, course_name)
            )
          )
        `)
        .not('end_time', 'is', null) // Only completed quizzes
      
      // Apply filters only if provided
      if (courseId) {
        testStatsQuery = testStatsQuery.eq('test_sections.course_sections.course_id', courseId)
        quizStatsQuery = quizStatsQuery.eq('quiz_sections.course_sections.course_id', courseId)
      } else if (userId) {
        testStatsQuery = testStatsQuery.eq('user_id', userId)
        quizStatsQuery = quizStatsQuery.eq('user_id', userId)
      }

      const { data: testAttempts, error: testError } = await testStatsQuery
      const { data: quizAttempts, error: quizError } = await quizStatsQuery

      if (testError) console.error('Test stats error:', testError)
      if (quizError) console.error('Quiz stats error:', quizError)

      // Transform data to match expected format
      const testStats = (testAttempts || []).map(attempt => ({
        user_id: attempt.user_id,
        username: attempt.users?.username || 'Unknown',
        learning_style_id: attempt.users?.learning_style_id,
        learning_style: attempt.users?.learning_styles?.name || null,
        course_id: attempt.test_sections?.course_sections?.course_id,
        course_name: attempt.test_sections?.course_sections?.courses?.course_name || 'Unknown Course',
        test_section_id: attempt.test_section_id,
        start_time: attempt.start_time,
        end_time: attempt.end_time,
        score: attempt.score || 0,
        duration_minutes: attempt.start_time && attempt.end_time 
          ? (new Date(attempt.end_time).getTime() - new Date(attempt.start_time).getTime()) / (1000 * 60)
          : 0
      }))

      const quizStats = (quizAttempts || []).map(attempt => ({
        user_id: attempt.user_id,
        username: attempt.users?.username || 'Unknown',
        learning_style_id: attempt.users?.learning_style_id,
        learning_style: attempt.users?.learning_styles?.name || null,
        course_id: attempt.quiz_sections?.course_sections?.course_id,
        course_name: attempt.quiz_sections?.course_sections?.courses?.course_name || 'Unknown Course',
        quiz_section_id: attempt.quiz_section_id,
        start_time: attempt.start_time,
        end_time: attempt.end_time,
        score: attempt.score || 0,
        duration_minutes: attempt.start_time && attempt.end_time 
          ? (new Date(attempt.end_time).getTime() - new Date(attempt.start_time).getTime()) / (1000 * 60)
          : 0
      }))

      response = {
        testStats: testStats,
        quizStats: quizStats,
        summary: {
          totalTests: testStats.length,
          totalQuizzes: quizStats.length,
          avgTestScore: testStats.length > 0 
            ? testStats.reduce((sum, t) => sum + (t.score || 0), 0) / testStats.length
            : 0,
          avgQuizScore: quizStats.length > 0 
            ? quizStats.reduce((sum, q) => sum + (q.score || 0), 0) / quizStats.length
            : 0
        }
      }
    }

    if (analyticsType === 'detailed') {
      // Detailed question-by-question analysis
      console.log('Fetching detailed analytics for courseId:', courseId, 'userId:', userId)
      
      // Query test attempt details with complete user and question information
      let testDetailsQuery = supabase
        .from('test_attempt_details')
        .select(`
          *,
          test_attempts!inner(
            user_id,
            test_section_id,
            start_time,
            score,
            users!inner(username, learning_style_id)
          ),
          test_questions!inner(question_text, correct_answer)
        `)

      // Apply filters
      if (courseId) {
        testDetailsQuery = testDetailsQuery
          .eq('test_attempts.test_sections.course_sections.course_id', courseId)
      } else if (userId) {
        testDetailsQuery = testDetailsQuery.eq('test_attempts.user_id', userId)
      }

      const { data: testDetails, error: testDetailsError } = await testDetailsQuery

      console.log('Test details query result:', { 
        count: testDetails?.length || 0, 
        error: testDetailsError,
        sample: testDetails?.[0] 
      })
      
      if (testDetailsError) {
        console.error('Error fetching test details:', testDetailsError)
      }

      // Quiz details query - need to handle missing quiz_questions table  
      console.log('Fetching quiz details...')
      
      let quizDetailsQuery = supabase
        .from('quiz_attempt_details')
        .select(`
          *,
          quiz_attempts!inner(
            user_id,
            quiz_section_id,
            start_time,
            score,
            users!inner(username, learning_style_id)
          )
        `)
      
      // Apply filters only if provided
      if (courseId) {
        // This path may not work without proper course relationship - for now get all
        console.log('Course-based quiz filtering not yet implemented')
      } else if (userId) {
        quizDetailsQuery = quizDetailsQuery.eq('quiz_attempts.user_id', userId)
      }
      // If no filters, get all data
      
      const { data: quizDetails, error: quizDetailsError } = await quizDetailsQuery
      
      console.log('Quiz details query result:', { 
        count: quizDetails?.length || 0, 
        error: quizDetailsError,
        sample: quizDetails?.[0] 
      })
      
      if (quizDetailsError) {
        console.error('Error fetching quiz details:', quizDetailsError)
      }

      response = {
        testDetails: testDetails || [],
        quizDetails: quizDetails || []
      }
    }

    if (analyticsType === 'performance') {
      // Performance trends over time
      const { data: performanceData } = await supabase
        .rpc('get_performance_trends', {
          target_course_id: courseId,
          target_user_id: userId
        })

      response = {
        performanceData: performanceData || []
      }
    }

    if (analyticsType === 'learning-style-analysis') {
      // Simplified learning style analysis using test attempts only for now
      let learningStyleQuery = supabase
        .from('test_attempts')
        .select(`
          score,
          start_time,
          end_time,
          users!inner(
            learning_style_id,
            learning_styles(name)
          )
        `)
        .not('end_time', 'is', null)

      // Apply filters
      if (courseId) {
        // For course filtering, we need to join through test_sections
        learningStyleQuery = learningStyleQuery
          .select(`
            score,
            start_time,
            end_time,
            users!inner(
              learning_style_id,
              learning_styles(name)
            ),
            test_sections!inner(
              course_section_id,
              course_sections!inner(course_id)
            )
          `)
          .eq('test_sections.course_sections.course_id', courseId)
      } else if (userId) {
        learningStyleQuery = learningStyleQuery.eq('user_id', userId)
      }

      const { data: testData, error: testLSError } = await learningStyleQuery

      if (testLSError) {
        console.error('Learning style analysis error:', testLSError)
        return NextResponse.json({ error: 'Learning style analysis failed' }, { status: 500 })
      }

      const styleAnalysis = new Map()
      
      if (testData && Array.isArray(testData)) {
        testData.forEach((attempt) => {
          const styleName = attempt.users?.learning_styles?.[0]?.name || attempt.users?.learning_styles?.name
          if (!styleName) return

          if (!styleAnalysis.has(styleName)) {
            styleAnalysis.set(styleName, {
              attempts: 0,
              totalScore: 0,
              totalDuration: 0
            })
          }

          const style = styleAnalysis.get(styleName)
          style.attempts++
          style.totalScore += attempt.score || 0
          
          // Calculate duration
          if (attempt.start_time && attempt.end_time) {
            const duration = (new Date(attempt.end_time).getTime() - new Date(attempt.start_time).getTime()) / (1000 * 60)
            style.totalDuration += duration
          }
        })
      }

      // Convert Map to object and calculate averages
      const styleAnalysisObject = {}
      styleAnalysis.forEach((data, style) => {
        styleAnalysisObject[style] = {
          ...data,
          avgScore: data.attempts > 0 ? data.totalScore / data.attempts : 0,
          avgDuration: data.attempts > 0 ? data.totalDuration / data.attempts : 0,
          successRate: data.attempts > 0 ? (data.totalScore / data.attempts) / 100 : 0
        }
      })

      response = {
        learningStyleAnalysis: styleAnalysisObject
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 })
  }
}

// Helper function for performance trends (would be implemented as a PostgreSQL function)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create-performance-trends-function') {
      const supabase = getSupabaseClient()
      
      // Create the PostgreSQL function for performance trends
      const functionSQL = `
        CREATE OR REPLACE FUNCTION get_performance_trends(
          target_course_id UUID DEFAULT NULL,
          target_user_id UUID DEFAULT NULL
        )
        RETURNS TABLE (
          date_period DATE,
          avg_test_score NUMERIC,
          avg_quiz_score NUMERIC,
          total_attempts BIGINT,
          learning_style TEXT
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          WITH daily_stats AS (
            SELECT 
              DATE(ta.start_time) as test_date,
              u.learning_style_id,
              ls.name as learning_style,
              AVG(ta.score) as avg_test_score,
              COUNT(*) as test_attempts
            FROM test_attempts ta
            JOIN users u ON ta.user_id = u.id
            LEFT JOIN learning_styles ls ON u.learning_style_id = ls.id
            LEFT JOIN test_sections ts ON ta.test_section_id = ts.id
            LEFT JOIN course_sections cs ON ts.course_section_id = cs.id
            WHERE (target_course_id IS NULL OR cs.course_id = target_course_id)
              AND (target_user_id IS NULL OR ta.user_id = target_user_id)
              AND ta.end_time IS NOT NULL
            GROUP BY DATE(ta.start_time), u.learning_style_id, ls.name
          ),
          quiz_stats AS (
            SELECT 
              DATE(qa.start_time) as quiz_date,
              u.learning_style_id,
              AVG(qa.score) as avg_quiz_score,
              COUNT(*) as quiz_attempts
            FROM quiz_attempts qa
            JOIN users u ON qa.user_id = u.id
            LEFT JOIN quiz_sections qs ON qa.quiz_section_id = qs.id
            LEFT JOIN course_sections cs ON qs.course_section_id = cs.id
            WHERE (target_course_id IS NULL OR cs.course_id = target_course_id)
              AND (target_user_id IS NULL OR qa.user_id = target_user_id)
              AND qa.end_time IS NOT NULL
            GROUP BY DATE(qa.start_time), u.learning_style_id
          )
          SELECT 
            COALESCE(ds.test_date, qs.quiz_date) as date_period,
            ds.avg_test_score,
            qs.avg_quiz_score,
            (ds.test_attempts + COALESCE(qs.quiz_attempts, 0)) as total_attempts,
            ds.learning_style
          FROM daily_stats ds
          FULL OUTER JOIN quiz_stats qs ON ds.test_date = qs.quiz_date 
            AND ds.learning_style_id = qs.learning_style_id
          ORDER BY date_period DESC;
        END;
        $$;
      `

      const { error } = await supabase.rpc('exec', { sql: functionSQL })
      
      if (error) {
        console.error('Error creating function:', error)
        return NextResponse.json({ error: 'Failed to create function' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in analytics setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
