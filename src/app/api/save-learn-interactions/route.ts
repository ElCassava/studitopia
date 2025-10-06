// API endpoint for storing detailed learn section interactions
import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId, 
      courseId, 
      learnSectionId, 
      contentItems,
      interactions,
      totalTimeSpent,
      completionPercentage,
      startTime, 
      endTime 
    } = body

    console.log('Saving learn interactions:', {
      userId,
      courseId,
      learnSectionId,
      interactionsCount: interactions?.length || 0,
      totalTimeSpent,
      completionPercentage
    })

    if (!userId || !courseId || !learnSectionId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // First ensure learn section exists (create if it doesn't exist for testing purposes)
    const { data: existingLearnSection } = await supabase
      .from('learn_sections')
      .select('id')
      .eq('id', learnSectionId)
      .single()

    if (!existingLearnSection) {
      console.log('Learn section does not exist, creating it for analytics testing...')
      // Create a course section first (if needed)
      const { data: courseSection, error: courseSectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseId,
          section_type: 'learn'
        })
        .select()
        .single()

      if (courseSectionError) {
        console.error('Error creating course section:', courseSectionError)
      }

      // Create the learn section
      const { error: learnSectionError } = await supabase
        .from('learn_sections')
        .insert({
          id: learnSectionId,
          course_section_id: courseSection?.id || learnSectionId, // Fallback to learnSectionId
          style_id: 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14' // Use visual learning style
        })

      if (learnSectionError) {
        console.error('Error creating learn section:', learnSectionError)
      } else {
        console.log('Created learn section for analytics testing')
      }
    }

    // Create learn session record
    const { data: learnSession, error: sessionError } = await supabase
      .from('learn_sessions')
      .insert({
        user_id: userId,
        learn_section_id: learnSectionId,
        start_time: startTime,
        end_time: endTime,
        total_time_spent: totalTimeSpent,
        completion_percentage: completionPercentage,
        completed: completionPercentage >= 100
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating learn session:', sessionError)
      return NextResponse.json({ 
        error: 'Failed to create learn session' 
      }, { status: 500 })
    }

    // Create detailed interaction records if provided
    if (interactions && interactions.length > 0) {
      const interactionDetails = interactions.map((interaction: any) => ({
        learn_session_id: learnSession.id,
        content_id: interaction.contentId,
        interaction_type: interaction.type || 'view', // 'view', 'scroll', 'click', 'pause'
        time_spent: interaction.timeSpent || 0,
        engagement_score: interaction.engagementScore || 50, // 0-100 score
        interaction_data: interaction.data ? JSON.stringify(interaction.data) : null,
        timestamp: interaction.timestamp || endTime
      }))

      const { error: detailsError } = await supabase
        .from('learn_interaction_details')
        .insert(interactionDetails)

      if (detailsError) {
        console.error('Error creating learn interaction details:', detailsError)
        return NextResponse.json({ 
          error: 'Failed to save learn interaction details' 
        }, { status: 500 })
      }
    }

    // Also update the general progress tracking
    const { error: progressError } = await supabase
      .from('user_section_progress')
      .upsert({
        user_id: userId,
        course_section_id: courseId,
        section_type: 'learn',
        completed: completionPercentage >= 100,
        completed_at: completionPercentage >= 100 ? endTime : null,
        score: Math.round(completionPercentage) // Use completion percentage as score
      })

    if (progressError) {
      console.error('Error updating progress:', progressError)
    }

    return NextResponse.json({ 
      success: true,
      learnSessionId: learnSession.id
    })

  } catch (error) {
    console.error('Unexpected error saving learn interactions:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
