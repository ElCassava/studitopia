// API to populate learning style test questions
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    console.log('🧠 Populating learning style test questions...')
    
    // Get learning styles first
    const { data: learningStyles, error: stylesError } = await supabase
      .from('learning_styles')
      .select('*')
    
    if (stylesError || !learningStyles) {
      return NextResponse.json({ error: 'Learning styles not found' }, { status: 400 })
    }
    
    const visualStyle = learningStyles.find(s => s.name === 'Visual')
    const auditoryStyle = learningStyles.find(s => s.name === 'Auditory') 
    const kinestheticStyle = learningStyles.find(s => s.name === 'Kinesthetic')
    const readingStyle = learningStyles.find(s => s.name === 'Reading/Writing')
    
    if (!visualStyle || !auditoryStyle || !kinestheticStyle || !readingStyle) {
      return NextResponse.json({ error: 'All learning styles must exist first' }, { status: 400 })
    }
    
    // Sample learning style test questions
    const testQuestions = [
      {
        question_text: "When learning something new, I prefer to:",
        choices: [
          { text: "Watch a demonstration or see examples", style_id: visualStyle.id },
          { text: "Listen to someone explain it", style_id: auditoryStyle.id },
          { text: "Try it myself hands-on", style_id: kinestheticStyle.id },
          { text: "Read about it in detail", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "When I need to remember information, I:",
        choices: [
          { text: "Create mental pictures or diagrams", style_id: visualStyle.id },
          { text: "Repeat it out loud or discuss it", style_id: auditoryStyle.id },
          { text: "Write it down and practice using it", style_id: kinestheticStyle.id },
          { text: "Make detailed notes and lists", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "In a classroom, I learn best when:",
        choices: [
          { text: "The teacher uses visual aids like charts and slides", style_id: visualStyle.id },
          { text: "The teacher explains things verbally", style_id: auditoryStyle.id },
          { text: "I can participate in hands-on activities", style_id: kinestheticStyle.id },
          { text: "I have textbooks and written materials", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "When solving a problem, I tend to:",
        choices: [
          { text: "Draw diagrams or visualize the solution", style_id: visualStyle.id },
          { text: "Talk through it with someone", style_id: auditoryStyle.id },
          { text: "Try different approaches practically", style_id: kinestheticStyle.id },
          { text: "Write down the steps and analyze them", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "I best understand directions when they are:",
        choices: [
          { text: "Shown to me with maps or pictures", style_id: visualStyle.id },
          { text: "Explained to me verbally", style_id: auditoryStyle.id },
          { text: "I can follow along and do them myself", style_id: kinestheticStyle.id },
          { text: "Written down step by step", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "When studying, I prefer to:",
        choices: [
          { text: "Use highlighters, colors, and visual organizers", style_id: visualStyle.id },
          { text: "Study with music or read aloud", style_id: auditoryStyle.id },
          { text: "Take breaks and move around while studying", style_id: kinestheticStyle.id },
          { text: "Make detailed outlines and summaries", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "I remember people best by their:",
        choices: [
          { text: "Face and appearance", style_id: visualStyle.id },
          { text: "Voice and name", style_id: auditoryStyle.id },
          { text: "Actions and what they do", style_id: kinestheticStyle.id },
          { text: "What they've written or their credentials", style_id: readingStyle.id }
        ]
      },
      {
        question_text: "When I'm concentrating, I need:",
        choices: [
          { text: "A clean, organized visual space", style_id: visualStyle.id },
          { text: "Background music or quiet sounds", style_id: auditoryStyle.id },
          { text: "To be able to move or fidget", style_id: kinestheticStyle.id },
          { text: "Complete silence and written materials", style_id: readingStyle.id }
        ]
      }
    ]
    
    let questionsCreated = 0
    let choicesCreated = 0
    
    for (const questionData of testQuestions) {
      // Check if question already exists
      const { data: existingQuestion } = await supabase
        .from('learning_style_test')
        .select('id')
        .eq('question_text', questionData.question_text)
        .single()
      
      if (existingQuestion) {
        console.log(`⏭️  Question already exists: ${questionData.question_text.substring(0, 50)}...`)
        continue
      }
      
      // Create question
      const { data: question, error: questionError } = await supabase
        .from('learning_style_test')
        .insert([{
          question_text: questionData.question_text,
          image_url: null
        }])
        .select()
        .single()
      
      if (questionError) {
        console.error('Error creating question:', questionError)
        continue
      }
      
      console.log(`✅ Created question: ${questionData.question_text.substring(0, 50)}...`)
      questionsCreated++
      
      // Create choices for this question
      const choicesData = questionData.choices.map(choice => ({
        question_id: question.id,
        choice_text: choice.text,
        style_id: choice.style_id
      }))
      
      const { error: choicesError } = await supabase
        .from('learning_style_test_choices')
        .insert(choicesData)
      
      if (choicesError) {
        console.error('Error creating choices:', choicesError)
        continue
      }
      
      choicesCreated += choicesData.length
      console.log(`   ✅ Created ${choicesData.length} choices`)
    }
    
    return NextResponse.json({
      success: true,
      questionsCreated,
      choicesCreated,
      message: 'Learning style test populated successfully!'
    })
    
  } catch (error) {
    console.error('Error populating learning style test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
