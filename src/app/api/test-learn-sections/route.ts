import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

export async function GET() {
  try {
    console.log('Testing learn sections fetch...');
    
    const testCourseId = '35b8a545-de10-4450-824a-38abb30b67b9';

    // Test the exact query from the learn page
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select(`
        id,
        course_id,
        section_type,
        learn_sections (
          id,
          style_id,
          learn_contents (
            id,
            description,
            image_url
          )
        )
      `)
      .eq('course_id', testCourseId)
      .eq('section_type', 'learn');

    if (sectionsError) {
      console.error('Error fetching learn sections:', sectionsError);
      return NextResponse.json({ 
        success: false, 
        error: sectionsError 
      }, { status: 500 });
    }

    console.log('Raw data from database:', JSON.stringify(courseSections, null, 2));

    // Transform the data like in the component
    const enhancedSections: any[] = []
    let sectionIndex = 0
    
    courseSections?.forEach((courseSection: any) => {
      const learnSections = courseSection.learn_sections || []
      
      if (learnSections.length === 0) {
        enhancedSections.push({
          id: courseSection.id,
          course_id: courseSection.course_id,
          section_type: courseSection.section_type,
          displayIndex: sectionIndex + 1,
          title: `Learning Section ${sectionIndex + 1}`,
          content: 'No content available for this section.',
          image_url: null,
          estimatedTime: "15 min",
          learn_section_id: null,
          style_id: null
        })
        sectionIndex++
      } else {
        learnSections.forEach((learnSection: any) => {
          const content = learnSection.learn_contents?.[0]
          
          enhancedSections.push({
            id: `${courseSection.id}-${learnSection.id}`,
            course_section_id: courseSection.id,
            course_id: courseSection.course_id,
            section_type: courseSection.section_type,
            displayIndex: sectionIndex + 1,
            title: `Section ${sectionIndex + 1}`,
            content: content?.description || 'No content available for this section.',
            image_url: content?.image_url || null,
            estimatedTime: "15 min",
            learn_section_id: learnSection.id,
            style_id: learnSection.style_id
          })
          sectionIndex++
        })
      }
    })

    return NextResponse.json({ 
      success: true, 
      rawData: courseSections,
      transformedData: enhancedSections,
      count: courseSections?.length || 0
    });

  } catch (error) {
    console.error('API Error testing learn sections:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
