// API endpoint to populate sample learning styles and related data
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    console.log('🚀 Starting learning styles population...')
    
    // Step 1: Create learning styles if they don't exist
    const learningStylesData = [
      {
        name: 'Visual',
        description: 'Learns best through images, diagrams, and visual representations'
      },
      {
        name: 'Auditory',
        description: 'Learns best through listening, discussions, and verbal instructions'
      },
      {
        name: 'Kinesthetic',
        description: 'Learns best through hands-on activities and physical movement'
      },
      {
        name: 'Reading/Writing',
        description: 'Learns best through reading texts and writing notes'
      }
    ]
    
    const insertedStyles = []
    
    for (const styleData of learningStylesData) {
      // Check if style already exists
      const { data: existingStyle, error: checkError } = await supabase
        .from('learning_styles')
        .select('*')
        .eq('name', styleData.name)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing style:', checkError)
        continue
      }
      
      if (existingStyle) {
        console.log(`✅ Learning style "${styleData.name}" already exists`)
        insertedStyles.push(existingStyle)
      } else {
        const { data: newStyle, error: insertError } = await supabase
          .from('learning_styles')
          .insert([styleData])
          .select()
          .single()
        
        if (insertError) {
          console.error(`Error inserting style "${styleData.name}":`, insertError)
          continue
        }
        
        console.log(`✅ Created learning style "${styleData.name}"`)
        insertedStyles.push(newStyle)
      }
    }
    
    // Step 2: Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
    
    if (coursesError) {
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }
    
    if (!courses || courses.length === 0) {
      return NextResponse.json({ 
        message: 'No courses found. Please create courses first.',
        learningStyles: insertedStyles
      })
    }
    
    console.log(`📚 Found ${courses.length} courses`)
    
    // Step 3: For each course, create course sections and learn sections
    let totalSectionsCreated = 0
    let totalLearnSectionsCreated = 0
    
    for (const course of courses) {
      console.log(`\n🎓 Processing course: ${course.course_name}`)
      
      // Create 3 learn course sections per course
      for (let sectionIndex = 1; sectionIndex <= 3; sectionIndex++) {
        // Check if course section already exists
        const { data: existingSection, error: sectionCheckError } = await supabase
          .from('course_sections')
          .select('*')
          .eq('course_id', course.id)
          .eq('section_type', 'learn')
          .limit(1)
        
        if (sectionCheckError) {
          console.error('Error checking existing sections:', sectionCheckError)
          continue
        }
        
        if (existingSection && existingSection.length >= sectionIndex) {
          console.log(`⏭️  Course section ${sectionIndex} already exists for ${course.course_name}`)
          continue
        }
        
        // Create course section
        const { data: courseSection, error: courseSectionError } = await supabase
          .from('course_sections')
          .insert([{
            course_id: course.id,
            section_type: 'learn'
          }])
          .select()
          .single()
        
        if (courseSectionError) {
          console.error('Error creating course section:', courseSectionError)
          continue
        }
        
        console.log(`📖 Created course section ${sectionIndex} for ${course.course_name}`)
        totalSectionsCreated++
        
        // Create learn sections for each learning style
        for (const style of insertedStyles) {
          const { data: learnSection, error: learnSectionError } = await supabase
            .from('learn_sections')
            .insert([{
              course_section_id: courseSection.id,
              style_id: style.id
            }])
            .select()
            .single()
          
          if (learnSectionError) {
            console.error('Error creating learn section:', learnSectionError)
            continue
          }
          
          // Create learn content for this section
          const contentDescription = `This is ${style.name.toLowerCase()} learning content for section ${sectionIndex} of ${course.course_name}. This content is specifically designed for ${style.description.toLowerCase()}.`
          
          const { error: contentError } = await supabase
            .from('learn_contents')
            .insert([{
              learn_section_id: learnSection.id,
              description: contentDescription,
              image_url: null
            }])
          
          if (contentError) {
            console.error('Error creating learn content:', contentError)
            continue
          }
          
          console.log(`   ✅ Created ${style.name} learn section with content`)
          totalLearnSectionsCreated++
        }
      }
    }
    
    // Step 4: Assign a random learning style to users who don't have one
    const { data: usersWithoutStyle, error: usersError } = await supabase
      .from('users')
      .select('*')
      .is('learning_style_id', null)
    
    if (usersError) {
      console.warn('Error fetching users without learning styles:', usersError)
    } else if (usersWithoutStyle && usersWithoutStyle.length > 0) {
      console.log(`\n👥 Assigning learning styles to ${usersWithoutStyle.length} users...`)
      
      for (const user of usersWithoutStyle) {
        // Assign a random learning style
        const randomStyle = insertedStyles[Math.floor(Math.random() * insertedStyles.length)]
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ learning_style_id: randomStyle.id })
          .eq('id', user.id)
        
        if (updateError) {
          console.error(`Error updating user ${user.username}:`, updateError)
        } else {
          console.log(`   ✅ Assigned ${randomStyle.name} style to ${user.username}`)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        learningStylesCreated: insertedStyles.length,
        coursesProcessed: courses.length,
        courseSectionsCreated: totalSectionsCreated,
        learnSectionsCreated: totalLearnSectionsCreated,
        usersUpdated: usersWithoutStyle?.length || 0
      },
      learningStyles: insertedStyles,
      message: 'Learning styles and content populated successfully!'
    })
    
  } catch (error) {
    console.error('Error populating learning styles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
