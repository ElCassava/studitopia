// API route to insert test choices for existing questions
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

const supabase = getSupabaseClient();

// Test choices data mapped by question text (partial match)
const testChoicesData = {
  "Suatu hari, Ibu membeli satu kue": [
    'A. ¼',
    'B. ²⁄₄', 
    'C. ¾',
    'D. ⁴⁄₄'
  ],
  "Rina punya 23 buku, dan Dika punya 43 buku": [
    'A. 56',
    'B. 64', 
    'C. 66',
    'D. 76'
  ],
  "Dalam perlombaan matematika, Rafi mendapatkan nilai 35": [
    'A. 0,35%',
    'B. 3,5%',
    'C. 35%', 
    'D. 350%'
  ],
  "Lina memiliki pita sepanjang 1 2/8 meter": [
    'A. 1 1/3',
    'B. 1 1/4',
    'C. 1 1/2',
    'D. 1 1/5'
  ],
  "Ibu memiliki 200 gram kue": [
    'A. 100 gram',
    'B. 125 gram',
    'C. 150 gram',
    'D. 175 gram'
  ],
  "Nilai ujian empat anak adalah": [
    'A. ½, 0,4, ¾, 4/5',
    'B. 0,4, ½, ¾, 4/5',
    'C. 4/5, ¾, ½, 0,4',
    'D. ¾, ½, 4/5, 0,4'
  ],
  "Ubah pecahan ¾ menjadi bentuk desimal": [
    'A. 0,25',
    'B. 0,5',
    'C. 0,75',
    'D. 1,25'
  ],
  "Di dapur, Ibu menakar gula sebanyak 13/5 gelas": [
    'A. 2 2/5',
    'B. 2 3/5',
    'C. 3 2/5',
    'D. 3 3/5'
  ],
  "Ibu punya 500 gram tepung": [
    'A. 250 gram',
    'B. 300 gram',
    'C. 350 gram',
    'D. 400 gram'
  ],
  "Paman memiliki ½ liter jus jeruk": [
    'A. 0,9 liter',
    'B. 1 liter',
    'C. 1,05 liter',
    'D. 1,1 liter'
  ],
  "Sebuah angka desimal adalah 1,75": [
    'A. 1 ¼',
    'B. 1 ½',
    'C. 1 ¾',
    'D. 1 2/5'
  ],
  "Lina membawa 1 batang cokelat ke sekolah": [
    'A. ¼ batang',
    'B. ½ batang',
    'C. ¾ batang',
    'D. ⅔ batang'
  ],
  "Arif punya pita sepanjang 25 cm": [
    'A. 5 cm',
    'B. 8 cm',
    'C. 10 cm',
    'D. 12 cm'
  ],
  "Kevin memiliki kue bolu yang dipotong menjadi 12 bagian": [
    'A. 2 potong',
    'B. 3 potong',
    'C. 4 potong',
    'D. 5 potong'
  ]
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting test choices insertion...');
    
    // Get all test questions for the pecahan course
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_text,
        test_sections (
          id,
          course_sections (
            courses (
              course_name
            )
          )
        )
      `);
    
    if (questionsError) {
      console.error('❌ Error fetching test questions:', questionsError);
      return NextResponse.json({ 
        success: false, 
        error: questionsError.message 
      }, { status: 500 });
    }
    
    if (!testQuestions || testQuestions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No test questions found in database' 
      });
    }
    
    console.log(`📋 Found ${testQuestions.length} test questions in database`);
    
    // Filter for pecahan course questions
    const pecahanQuestions = testQuestions.filter(q => 
      q.test_sections?.course_sections?.courses?.course_name?.includes('Pecahan')
    );
    
    console.log(`🧮 Found ${pecahanQuestions.length} questions for Pecahan course`);
    
    let totalChoicesInserted = 0;
    let questionsProcessed = 0;
    const processedQuestions = [];
    
    for (const question of pecahanQuestions) {
      // Check if choices already exist for this question
      const { data: existingChoices } = await supabase
        .from('test_choices')
        .select('id')
        .eq('question_id', question.id);
      
      if (existingChoices && existingChoices.length > 0) {
        console.log(`⏭️  Question already has ${existingChoices.length} choices, skipping`);
        processedQuestions.push({
          question: question.question_text.substring(0, 50) + '...',
          status: 'skipped',
          reason: `Already has ${existingChoices.length} choices`
        });
        continue;
      }
      
      // Find matching choices by partial text match
      let matchingChoices = null;
      let matchedKey = null;
      for (const [questionKey, choices] of Object.entries(testChoicesData)) {
        if (question.question_text.includes(questionKey)) {
          matchingChoices = choices;
          matchedKey = questionKey;
          break;
        }
      }
      
      if (!matchingChoices) {
        console.log(`⚠️  No matching choices found for: ${question.question_text.substring(0, 50)}...`);
        processedQuestions.push({
          question: question.question_text.substring(0, 50) + '...',
          status: 'no_match',
          reason: 'No matching choices found in data'
        });
        continue;
      }
      
      // Insert choices for this question
      const choicesData = matchingChoices.map(choice => ({
        question_id: question.id,
        choice_text: choice
      }));
      
      const { data: insertedChoices, error: choicesError } = await supabase
        .from('test_choices')
        .insert(choicesData)
        .select();
      
      if (choicesError) {
        console.error(`❌ Error inserting choices for question ${question.id}:`, choicesError);
        processedQuestions.push({
          question: question.question_text.substring(0, 50) + '...',
          status: 'error',
          reason: choicesError.message
        });
        continue;
      }
      
      console.log(`✅ Inserted ${insertedChoices.length} choices for: ${question.question_text.substring(0, 50)}...`);
      totalChoicesInserted += insertedChoices.length;
      questionsProcessed++;
      
      processedQuestions.push({
        question: question.question_text.substring(0, 50) + '...',
        status: 'success',
        choicesInserted: insertedChoices.length,
        matchedKey: matchedKey
      });
    }
    
    // Verify the insertion
    const { data: verifyChoices, error: verifyError } = await supabase
      .from('test_choices')
      .select(`
        id,
        choice_text,
        test_questions (
          question_text,
          test_sections (
            course_sections (
              courses (course_name)
            )
          )
        )
      `)
      .ilike('test_questions.test_sections.course_sections.courses.course_name', '%Pecahan%');
    
    return NextResponse.json({
      success: true,
      summary: {
        totalQuestionsFound: testQuestions.length,
        pecahanQuestions: pecahanQuestions.length,
        questionsProcessed: questionsProcessed,
        totalChoicesInserted: totalChoicesInserted,
        totalChoicesInDb: verifyChoices?.length || 0
      },
      details: processedQuestions,
      verificationError: verifyError?.message
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
