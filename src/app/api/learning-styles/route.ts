// API endpoint to get learning styles information
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all learning styles
    const { data: learningStyles, error: stylesError } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    if (stylesError) {
      return NextResponse.json({ error: stylesError.message }, { status: 500 })
    }
    
    // Get count of users for each learning style
    const { data: userCounts, error: usersError } = await supabase
      .from('users')
      .select('learning_style_id')
      .not('learning_style_id', 'is', null)
    
    if (usersError) {
      console.warn('Could not fetch user learning style counts:', usersError)
    }
    
    // Count users per learning style
    const styleUserCounts: Record<string, number> = {}
    userCounts?.forEach(user => {
      if (user.learning_style_id) {
        styleUserCounts[user.learning_style_id] = (styleUserCounts[user.learning_style_id] || 0) + 1
      }
    })
    
    // Get learn sections count per learning style
    const { data: learnSections, error: sectionsError } = await supabase
      .from('learn_sections')
      .select('style_id')
    
    if (sectionsError) {
      console.warn('Could not fetch learn sections counts:', sectionsError)
    }
    
    const styleSectionCounts: Record<string, number> = {}
    learnSections?.forEach(section => {
      if (section.style_id) {
        styleSectionCounts[section.style_id] = (styleSectionCounts[section.style_id] || 0) + 1
      }
    })
    
    // Combine data
    const stylesWithStats = learningStyles?.map(style => ({
      ...style,
      userCount: styleUserCounts[style.id] || 0,
      sectionCount: styleSectionCounts[style.id] || 0
    }))
    
    return NextResponse.json({
      learningStyles: stylesWithStats,
      totalUsers: userCounts?.length || 0,
      totalSections: learnSections?.length || 0
    })
    
  } catch (error) {
    console.error('Error in learning styles endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
