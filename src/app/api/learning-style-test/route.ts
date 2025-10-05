// Learning Style Test API
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all learning style test questions with their choices
    const { data: questions, error: questionsError } = await supabase
      .from('learning_style_test')
      .select(`
        id,
        question_text,
        image_url,
        learning_style_test_choices (
          id,
          choice_text,
          style_id
        )
      `)
      .order('id')
    
    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }
    
    // Get learning styles for reference
    const { data: learningStyles, error: stylesError } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    if (stylesError) {
      return NextResponse.json({ error: stylesError.message }, { status: 500 })
    }
    
    return NextResponse.json({
      questions: questions || [],
      learningStyles: learningStyles || []
    })
    
  } catch (error) {
    console.error('Error fetching learning style test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, responses } = await request.json()
    
    if (!userId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'userId and responses array are required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    // Store user responses
    const responseRecords = responses.map(response => ({
      user_id: userId,
      question_id: response.questionId,
      choice_id: response.choiceId,
      time_taken: response.timeTaken || 0,
      answered_at: new Date().toISOString()
    }))
    
    const { error: responsesError } = await supabase
      .from('learning_style_test_responses')
      .insert(responseRecords)
    
    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 })
    }
    
    // Calculate learning style based on responses
    const styleVotes: Record<string, number> = {}
    
    // Get the choices to determine which learning style each response points to
    const choiceIds = responses.map(r => r.choiceId)
    const { data: choices, error: choicesError } = await supabase
      .from('learning_style_test_choices')
      .select('id, style_id')
      .in('id', choiceIds)
    
    if (choicesError) {
      return NextResponse.json({ error: choicesError.message }, { status: 500 })
    }
    
    // Count votes for each learning style
    choices?.forEach(choice => {
      styleVotes[choice.style_id] = (styleVotes[choice.style_id] || 0) + 1
    })
    
    // Find the learning style with the most votes
    let dominantStyleId = ''
    let maxVotes = 0
    
    Object.entries(styleVotes).forEach(([styleId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes
        dominantStyleId = styleId
      }
    })
    
    if (!dominantStyleId) {
      return NextResponse.json({ error: 'Could not determine learning style' }, { status: 400 })
    }
    
    // Update user's learning style
    const { error: updateError } = await supabase
      .from('users')
      .update({ learning_style_id: dominantStyleId })
      .eq('id', userId)
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Get the learning style details
    const { data: learningStyle, error: styleError } = await supabase
      .from('learning_styles')
      .select('*')
      .eq('id', dominantStyleId)
      .single()
    
    if (styleError) {
      return NextResponse.json({ error: styleError.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      learningStyle,
      styleVotes,
      totalResponses: responses.length
    })
    
  } catch (error) {
    console.error('Error processing learning style test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
