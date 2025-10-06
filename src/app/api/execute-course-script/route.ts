import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting course creation script execution...');

    // Step 1: Create the main course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        course_name: 'Belajar Dasar Pecahan Matematika',
        description: 'Kursus ini dirancang untuk membantu siswa memahami konsep dasar pecahan dalam matematika. Siswa akan belajar mengenai pengertian pecahan, cara membaca dan menulis pecahan, operasi dasar pecahan (penjumlahan, pengurangan, perkalian, pembagian), mengubah bentuk pecahan ke desimal dan persen, serta penerapan pecahan dalam kehidupan sehari-hari melalui soal-soal cerita yang menarik.'
      })
      .select()
      .single();

    if (courseError) {
      throw new Error(`Course creation failed: ${courseError.message}`);
    }

    const courseId = courseData.id;
    console.log('Course created with ID:', courseId);

    // Step 2: Create course sections
    const { data: learnSectionData, error: learnSectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        section_type: 'learn'
      })
      .select()
      .single();

    if (learnSectionError) {
      throw new Error(`Learn section creation failed: ${learnSectionError.message}`);
    }

    const { data: testSectionData, error: testSectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        section_type: 'test'
      })
      .select()
      .single();

    if (testSectionError) {
      throw new Error(`Test section creation failed: ${testSectionError.message}`);
    }

    const { data: quizSectionData, error: quizSectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        section_type: 'quiz'
      })
      .select()
      .single();

    if (quizSectionError) {
      throw new Error(`Quiz section creation failed: ${quizSectionError.message}`);
    }

    console.log('Course sections created:', {
      learn: learnSectionData.id,
      test: testSectionData.id,
      quiz: quizSectionData.id
    });

    // Step 3: Create learn section with auditory learning style
    const { data: learnSubSectionData, error: learnSubSectionError } = await supabase
      .from('learn_sections')
      .insert({
        course_section_id: learnSectionData.id,
        style_id: '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85' // Auditory learning style
      })
      .select()
      .single();

    if (learnSubSectionError) {
      throw new Error(`Learn subsection creation failed: ${learnSubSectionError.message}`);
    }

    console.log('Learn subsection created with ID:', learnSubSectionData.id);

    // Step 4: Create 3 learn contents
    const learnContents = [
      {
        learn_section_id: learnSubSectionData.id,
        description: 'Mari kita dengarkan penjelasan tentang pecahan! Bayangkan kamu mendengar suara pembagi pizza: "Crak! Crak! Crak!" - pizza dipotong menjadi 4 bagian sama besar. Sekarang dengarkan: "Satu... per... empat!" Itulah cara membaca pecahan 1/4. Pembilang adalah angka pertama (1) yang kamu ucapkan - menunjukkan berapa bagian yang diambil. Penyebut adalah angka kedua (4) yang kamu ucapkan setelah kata "per" - menunjukkan total bagian keseluruhan. Coba ucapkan: "Dua per tiga", "Lima per delapan"!',
        image_url: null
      },
      {
        learn_section_id: learnSubSectionData.id,
        description: 'Dengarkan baik-baik jenis-jenis pecahan ini! Pertama, "Pecahan Biasa" - ucapkan: "satu per dua", "tiga per empat", "lima per delapan". Kedua, "Pecahan Campuran" - ucapkan dengan jeda: "satu... dan... satu per dua", "dua... dan... tiga per empat". Ketiga, "Pecahan Desimal" - ucapkan dengan titik: "nol koma lima", "nol koma tujuh puluh lima". Keempat, "Persen" - ucapkan dengan tegas: "lima puluh persen!", "tujuh puluh lima persen!". Ingat, semua bentuk ini memiliki nilai yang sama, hanya cara mengucapkannya yang berbeda.',
        image_url: null
      },
      {
        learn_section_id: learnSubSectionData.id,
        description: 'Mari dengarkan aturan operasi pecahan dengan baik! Untuk Penjumlahan dan Pengurangan, ingat mantra ini: "Penyebut sama dulu, baru pembilang dijumlah!" Ucapkan: "Satu per empat PLUS satu per empat SAMA DENGAN dua per empat". Untuk Perkalian, ucapkan: "Pembilang kali pembilang, penyebut kali penyebut!" Contoh: "Dua per tiga KALI tiga per empat". Untuk Pembagian, ingat: "Balik yang belakang, lalu kali!" Ucapkan: "Setengah BAGI seperempat SAMA DENGAN setengah KALI empat per satu". Selalu akhiri dengan: "Sederhanakan jika bisa!"',
        image_url: null
      }
    ];

    const { data: learnContentData, error: learnContentError } = await supabase
      .from('learn_contents')
      .insert(learnContents)
      .select();

    if (learnContentError) {
      throw new Error(`Learn content creation failed: ${learnContentError.message}`);
    }

    console.log('Learn contents created:', learnContentData.length, 'items');

    // Step 5: Create test section with auditory learning style
    const { data: testSubSectionData, error: testSubSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: testSectionData.id,
        style_id: '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85' // Auditory learning style
      })
      .select()
      .single();

    if (testSubSectionError) {
      throw new Error(`Test subsection creation failed: ${testSubSectionError.message}`);
    }

    console.log('Test subsection created with ID:', testSubSectionData.id);

    // Step 6: Create test questions and choices
    const testQuestions = [
      {
        question_text: 'Suatu hari, Ibu membeli satu kue dan membaginya menjadi 4 potong yang sama besar. Budi memakan 2 potong dari kue itu. Berapa bagian kue yang dimakan Budi?',
        correct_answer: 'B',
        choices: ['A. ¼', 'B. ²⁄₄', 'C. ¾', 'D. ⁴⁄₄']
      },
      {
        question_text: 'Rina punya 23 buku, dan Dika punya 43 buku. Kalau digabung, berapa jumlah buku mereka berdua?',
        correct_answer: 'C',
        choices: ['A. 56', 'B. 64', 'C. 66', 'D. 76']
      },
      {
        question_text: 'Dalam perlombaan matematika, Rafi mendapatkan nilai 35 dari 100. Kalau nilainya ditulis dalam bentuk persen, hasilnya berapa?',
        correct_answer: 'C',
        choices: ['A. 0,35%', 'B. 3,5%', 'C. 35%', 'D. 350%']
      },
      {
        question_text: 'Lina memiliki pita sepanjang 1 2/8 meter. Pecahan mana yang nilainya sama dengan 1 2/8 meter?',
        correct_answer: 'B',
        choices: ['A. 1 1/3', 'B. 1 1/4', 'C. 1 1/2', 'D. 1 1/5']
      },
      {
        question_text: 'Ibu memiliki 200 gram kue. Ia ingin memberi topping sebanyak 75% dari berat kue itu. Berapa gram topping yang digunakan Ibu?',
        correct_answer: 'C',
        choices: ['A. 100 gram', 'B. 125 gram', 'C. 150 gram', 'D. 175 gram']
      },
      {
        question_text: 'Nilai ujian empat anak adalah: Bayu = ½, Dita = 0,4, Sinta = 4/5, dan Lala = ¾. Urutkan nilai mereka dari yang paling kecil sampai yang paling besar.',
        correct_answer: 'B',
        choices: ['A. ½, 0,4, ¾, 4/5', 'B. 0,4, ½, ¾, 4/5', 'C. 4/5, ¾, ½, 0,4', 'D. ¾, ½, 4/5, 0,4']
      },
      {
        question_text: 'Ubah pecahan ¾ menjadi bentuk desimal.',
        correct_answer: 'C',
        choices: ['A. 0,25', 'B. 0,5', 'C. 0,75', 'D. 1,25']
      },
      {
        question_text: 'Di dapur, Ibu menakar gula sebanyak 13/5 gelas. Jika ditulis sebagai pecahan campuran, berapa hasilnya?',
        correct_answer: 'B',
        choices: ['A. 2 2/5', 'B. 2 3/5', 'C. 3 2/5', 'D. 3 3/5']
      },
      {
        question_text: 'Ibu punya 500 gram tepung. Sebanyak 1/5 bagian dipakai untuk membuat roti, dan 1/10 bagian tumpah. Berapa sisa tepung yang masih ada?',
        correct_answer: 'C',
        choices: ['A. 250 gram', 'B. 300 gram', 'C. 350 gram', 'D. 400 gram']
      },
      {
        question_text: 'Paman memiliki ½ liter jus jeruk. Ia meminumnya ¼ liter. Lalu paman membeli 0,6 liter jus apel dan 0,2 liter jus semangka. Berapa total jus yang paman miliki sekarang?',
        correct_answer: 'C',
        choices: ['A. 0,9 liter', 'B. 1 liter', 'C. 1,05 liter', 'D. 1,1 liter']
      },
      {
        question_text: 'Sebuah angka desimal adalah 1,75. Pecahan mana yang nilainya sama dengan angka tersebut?',
        correct_answer: 'C',
        choices: ['A. 1 ¼', 'B. 1 ½', 'C. 1 ¾', 'D. 1 2/5']
      },
      {
        question_text: 'Lina membawa 1 batang cokelat ke sekolah. Sepertiga (⅓) diberikan ke guru, dan seperenam (⅙) diberikan ke sahabatnya. Berapa bagian cokelat yang masih dimiliki Lina?',
        correct_answer: 'B',
        choices: ['A. ¼ batang', 'B. ½ batang', 'C. ¾ batang', 'D. ⅔ batang']
      },
      {
        question_text: 'Arif punya pita sepanjang 25 cm. Ia memberikan ⅖ kepada Bima untuk hiasan kado, dan ⅓ dari sisa pita dipakai untuk menghias buku. Berapa cm pita yang belum digunakan?',
        correct_answer: 'C',
        choices: ['A. 5 cm', 'B. 8 cm', 'C. 10 cm', 'D. 12 cm']
      },
      {
        question_text: 'Kevin memiliki kue bolu yang dipotong menjadi 12 bagian sama besar. Ia memberi 3 potong ke ayah, 2 potong ke ibu, dan 4 potong ke adiknya. Berapa potong kue yang bisa dimakan Kevin sendiri?',
        correct_answer: 'B',
        choices: ['A. 2 potong', 'B. 3 potong', 'C. 4 potong', 'D. 5 potong']
      }
    ];

    let totalQuestionsCreated = 0;
    let totalChoicesCreated = 0;

    for (const questionData of testQuestions) {
      // Create question
      const { data: questionResult, error: questionError } = await supabase
        .from('test_questions')
        .insert({
          test_section_id: testSubSectionData.id,
          question_text: questionData.question_text,
          image_url: null,
          correct_answer: questionData.correct_answer
        })
        .select()
        .single();

      if (questionError) {
        throw new Error(`Question creation failed: ${questionError.message}`);
      }

      totalQuestionsCreated++;

      // Create choices for this question
      const choiceInserts = questionData.choices.map(choice => ({
        question_id: questionResult.id,
        choice_text: choice
      }));

      const { data: choicesResult, error: choicesError } = await supabase
        .from('test_choices')
        .insert(choiceInserts)
        .select();

      if (choicesError) {
        throw new Error(`Choices creation failed: ${choicesError.message}`);
      }

      totalChoicesCreated += choicesResult.length;
    }

    console.log(`Test questions created: ${totalQuestionsCreated}, choices created: ${totalChoicesCreated}`);

    // Step 7: Create quiz section (empty as requested)
    const { data: quizSubSectionData, error: quizSubSectionError } = await supabase
      .from('quiz_sections')
      .insert({
        course_section_id: quizSectionData.id,
        style_id: '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85' // Auditory learning style
      })
      .select()
      .single();

    if (quizSubSectionError) {
      throw new Error(`Quiz subsection creation failed: ${quizSubSectionError.message}`);
    }

    console.log('Quiz subsection created with ID:', quizSubSectionData.id);

    return NextResponse.json({
      success: true,
      message: 'Course created successfully with auditory learning style!',
      data: {
        courseId: courseId,
        courseName: 'Belajar Dasar Pecahan Matematika',
        sections: {
          learn: {
            sectionId: learnSectionData.id,
            subsectionId: learnSubSectionData.id,
            contentsCreated: learnContentData.length
          },
          test: {
            sectionId: testSectionData.id,
            subsectionId: testSubSectionData.id,
            questionsCreated: totalQuestionsCreated,
            choicesCreated: totalChoicesCreated
          },
          quiz: {
            sectionId: quizSectionData.id,
            subsectionId: quizSubSectionData.id,
            contentsCreated: 0 // Empty as requested
          }
        },
        learningStyle: {
          id: '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85',
          name: 'Auditory'
        }
      }
    });

  } catch (error) {
    console.error('Error executing course script:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      },
      { status: 500 }
    );
  }
}
