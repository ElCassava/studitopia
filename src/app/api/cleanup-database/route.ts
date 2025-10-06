import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const { confirmCleanup } = await request.json()
    
    if (!confirmCleanup) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }
    
    console.log('🧹 Starting database cleanup...')
    const supabase = getSupabaseClient()
    
    // Clean up content tables (these likely contain sample data)
    const cleanupResults = []
    
    // Clean learn_contents
    const { data: learnContents, error: learnError } = await supabase
      .from('learn_contents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
    if (learnError) {
      console.error('Error cleaning learn_contents:', learnError)
    } else {
      cleanupResults.push(`Cleaned learn_contents`)
    }
    
    // Clean test_questions and test_choices
    const { data: testChoices, error: testChoicesError } = await supabase
      .from('test_choices')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (testChoicesError) {
      console.error('Error cleaning test_choices:', testChoicesError)
    } else {
      cleanupResults.push(`Cleaned test_choices`)
    }
    
    const { data: testQuestions, error: testQuestionsError } = await supabase
      .from('test_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (testQuestionsError) {
      console.error('Error cleaning test_questions:', testQuestionsError)
    } else {
      cleanupResults.push(`Cleaned test_questions`)
    }
    
    // Clean quiz_contents
    const { data: quizContents, error: quizError } = await supabase
      .from('quiz_contents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (quizError) {
      console.error('Error cleaning quiz_contents:', quizError)
    } else {
      cleanupResults.push(`Cleaned quiz_contents`)
    }
    
    // Clean section-level tables (learn_sections, test_sections, quiz_sections)
    const { data: learnSections, error: learnSectionsError } = await supabase
      .from('learn_sections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (learnSectionsError) {
      console.error('Error cleaning learn_sections:', learnSectionsError)
    } else {
      cleanupResults.push(`Cleaned learn_sections`)
    }
    
    const { data: testSections, error: testSectionsError } = await supabase
      .from('test_sections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (testSectionsError) {
      console.error('Error cleaning test_sections:', testSectionsError)
    } else {
      cleanupResults.push(`Cleaned test_sections`)
    }
    
    const { data: quizSections, error: quizSectionsError } = await supabase
      .from('quiz_sections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (quizSectionsError) {
      console.error('Error cleaning quiz_sections:', quizSectionsError)
    } else {
      cleanupResults.push(`Cleaned quiz_sections`)
    }
    
    // Clean course_sections completely (use proper condition)
    const { count: sectionCount } = await supabase
      .from('course_sections')
      .select('*', { count: 'exact', head: true })
    
    if (sectionCount && sectionCount > 0) {
      const { data: courseSections, error: courseSectionsError } = await supabase
        .from('course_sections')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000') // Delete all records
        
      if (courseSectionsError) {
        console.error('Error cleaning course_sections:', courseSectionsError)
      } else {
        cleanupResults.push(`Cleaned ${sectionCount} course_sections`)
      }
    }
    
    // Also clean user progress related to these sections
    const { data: userProgress, error: progressError } = await supabase
      .from('user_section_progress')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      
    if (progressError) {
      console.error('Error cleaning user_section_progress:', progressError)  
    } else {
      cleanupResults.push(`Cleaned user_section_progress`)
    }
    
    console.log('✅ Database cleanup completed')
    
    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      cleanupResults
    })
    
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Cleanup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
