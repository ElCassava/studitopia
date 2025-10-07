require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createKinestheticContent() {
  try {
    console.log('🏗️  Creating kinesthetic content for Pecahan course...');
    
    const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08';
    const kinestheticStyleId = 'f5379d13-d830-4e78-8353-981829a5fd7c';
    
    // Step 1: Create learn section with kinesthetic learning style
    console.log('📚 Creating kinesthetic learn section...');
    const { data: learnSection, error: learnSectionError } = await supabase
      .from('learn_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'learn'),
        style_id: kinestheticStyleId
      })
      .select()
      .single();

    if (learnSectionError && !learnSectionError.message.includes('duplicate')) {
      console.error('Error creating learn section:', learnSectionError);
      return;
    }

    const learnSectionId = learnSection?.id || await getExistingLearnSectionId(courseId, kinestheticStyleId);
    console.log('✅ Learn section ready:', learnSectionId);

    // Step 2: Create learn contents
    console.log('📝 Creating kinesthetic learn contents...');
    const learnContents = [
      {
        description: 'Mari kita belajar pecahan dengan cara menyenangkan! Ambil kertas dan pensil, lalu ikuti kegiatan ini: 1) Gambar lingkaran besar di kertas, lalu bagi menjadi 4 bagian sama besar dengan menggaris. Warnai 2 bagian dengan pensil warna. Ini adalah pecahan 2/4 atau setengah! 2) Lipat kertas menjadi 8 bagian, buka lipatan, lalu hitung kotak-kotaknya. Gunting 3 kotak dan rasakan ukurannya. Ini adalah 3/8! 3) Siapkan 10 kelereng atau benda kecil lainnya. Pisahkan menjadi 2 kelompok sama banyak dengan tangan. Setiap kelompok adalah 5/10 atau setengah! Dengan menyentuh dan membuat sendiri, kamu akan lebih mudah memahami pecahan.',
        image_url: null
      },
      {
        description: 'Sekarang mari kita praktik menulis dan membaca pecahan dengan gerakan! 1) Tulis angka pembilang di udara dengan jari telunjuk, lalu tulis garis miring dari kiri atas ke kanan bawah, kemudian tulis penyebut. Contoh: untuk 3/4, tulis "3" (angkat tangan), garis "/" (gerakan diagonal), "4" (tulis di bawah). 2) Ketuk meja sesuai pembilang, lalu tepuk tangan sesuai penyebut. Untuk 2/5: ketuk-ketuk (2 kali), tepuk-tepuk-tepuk-tepuk-tepuk (5 kali). 3) Berdiri dan lakukan gerakan: angkat tangan untuk pembilang, jongkok untuk penyebut. Latih dengan pecahan 1/2, 3/4, 2/3, 5/8. Gerakan tubuh akan membantu otakmu mengingat struktur pecahan!',
        image_url: null
      },
      {
        description: 'Mari belajar operasi pecahan dengan permainan hands-on! PENJUMLAHAN: Siapkan 2 piring dan 8 kelereng. Taruh 2 kelereng di piring pertama (2/8), 3 kelereng di piring kedua (3/8). Gabungkan kedua piring - hitung totalnya: 5 kelereng (5/8)! PENGURANGAN: Mulai dengan 6 kelereng (6/10), ambil 2 kelereng dengan tangan (kurangi 2/10), sisa 4 kelereng (4/10). PERKALIAN: Untuk 1/2 × 1/3, ambil selembar kertas, lipat jadi 2 bagian (1/2), lalu lipat lagi jadi 3 bagian. Buka lipatan - ada 6 kotak, ambil 1 kotak. Ini adalah 1/6! PEMBAGIAN: Untuk 1/2 ÷ 1/4, potong kertas jadi 2 bagian ambil 1 bagian (1/2), lalu lihat berapa potong 1/4 yang muat di dalamnya dengan mengukur langsung. Dengan menyentuh dan memanipulasi benda nyata, operasi pecahan jadi mudah dipahami!',
        image_url: null
      }
    ];

    for (let i = 0; i < learnContents.length; i++) {
      const { error: contentError } = await supabase
        .from('learn_contents')
        .insert({
          learn_section_id: learnSectionId,
          ...learnContents[i]
        });

      if (contentError && !contentError.message.includes('duplicate')) {
        console.error(`Error creating learn content ${i + 1}:`, contentError);
      } else {
        console.log(`✅ Created learn content ${i + 1}`);
      }
    }

    // Step 3: Create test section with kinesthetic learning style
    console.log('📊 Creating kinesthetic test section...');
    const { data: testSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'test'),
        style_id: kinestheticStyleId
      })
      .select()
      .single();

    if (testSectionError && !testSectionError.message.includes('duplicate')) {
      console.error('Error creating test section:', testSectionError);
      return;
    }

    const testSectionId = testSection?.id || await getExistingTestSectionId(courseId, kinestheticStyleId);
    console.log('✅ Test section ready:', testSectionId);

    // Step 4: Create test questions
    console.log('❓ Creating test questions...');
    const questions = [
      {
        question_text: 'Suatu hari, Ibu membeli satu kue dan membaginya menjadi 4 potong yang sama besar. Budi memakan 2 potong dari kue itu. Berapa bagian kue yang dimakan Budi?',
        correct_answer: 'B',
        choices: ['A. ¼', 'B. ²⁄₄', 'C. ¾', 'D. 1']
      },
      {
        question_text: 'Ani memiliki coklat batang yang terbagi menjadi 8 kotak. Dia memberikan 3 kotak kepada adiknya. Berapa bagian coklat yang diberikan Ani?',
        correct_answer: 'B',
        choices: ['A. ²⁄₈', 'B. ³⁄₈', 'C. ⁴⁄₈', 'D. ⁵⁄₈']
      },
      {
        question_text: 'Dalam sebuah kelas, 12 dari 20 siswa adalah perempuan. Berapa pecahan yang menyatakan jumlah siswa laki-laki?',
        correct_answer: 'B',
        choices: ['A. ³⁄₅', 'B. ²⁄₅', 'C. ¹²⁄₂₀', 'D. ⁸⁄₂₀']
      },
      {
        question_text: 'Pak Rudi memiliki kebun yang dibagi menjadi 6 petak. 4 petak ditanami jagung dan sisanya ditanami kacang. Berapa pecahan kebun yang ditanami kacang?',
        correct_answer: 'A',
        choices: ['A. ¹⁄₃', 'B. ²⁄₆', 'C. ⁴⁄₆', 'D. ²⁄₃']
      },
      {
        question_text: 'Ibu membeli 3 kg beras dan menggunakan 1,5 kg untuk memasak. Berapa pecahan beras yang tersisa?',
        correct_answer: 'A',
        choices: ['A. ½', 'B. ¹⁄₃', 'C. ²⁄₃', 'D. ¾']
      },
      {
        question_text: 'Nilai ujian empat anak adalah: Ana 0,8; Budi 1/2; Cici 75%; dan Deni 4/5. Urutan nilai dari yang terkecil adalah...',
        correct_answer: 'B',
        choices: ['A. ½, 0,4, ¾, 4/5', 'B. 0,4, ½, ¾, 4/5', 'C. ¾, 4/5, ½, 0,4', 'D. 4/5, ¾, ½, 0,4']
      },
      {
        question_text: 'Hasil dari 2/3 + 1/6 adalah...',
        correct_answer: 'C',
        choices: ['A. ³⁄₉', 'B. ³⁄₆', 'C. ⁵⁄₆', 'D. ⁷⁄₉']
      },
      {
        question_text: 'Hasil dari 5/6 - 1/3 adalah...',
        correct_answer: 'A',
        choices: ['A. ³⁄₆', 'B. ⁴⁄₆', 'C. ²⁄₃', 'D. ½']
      },
      {
        question_text: 'Bu Sari memiliki 3/4 kg gula. Dia menggunakan 2/3 dari gula tersebut untuk membuat kue. Berapa kg gula yang digunakan Bu Sari?',
        correct_answer: 'A',
        choices: ['A. ½ kg', 'B. ¼ kg', 'C. ⅔ kg', 'D. ¼ kg']
      },
      {
        question_text: 'Hasil dari 2/5 × 3/4 adalah...',
        correct_answer: 'D',
        choices: ['A. ⁵⁄₉', 'B. ⁶⁄₂₀', 'C. ⁵⁄₂₀', 'D. ³⁄₁₀']
      },
      {
        question_text: 'Hasil dari 3/4 ÷ 1/2 adalah...',
        correct_answer: 'D',
        choices: ['A. ³⁄₈', 'B. ³⁄₆', 'C. 1', 'D. 1½']
      },
      {
        question_text: 'Sebuah tangki air berisi 2/3 bagian. Jika kapasitas tangki 90 liter, berapa liter air dalam tangki?',
        correct_answer: 'C',
        choices: ['A. 30 liter', 'B. 45 liter', 'C. 60 liter', 'D. 90 liter']
      },
      {
        question_text: 'Dina menabung 1/4 dari uang sakunya setiap minggu. Jika uang saku Dina Rp 40.000 per minggu, berapa rupiah yang ditabung dalam sebulan (4 minggu)?',
        correct_answer: 'B',
        choices: ['A. Rp 10.000', 'B. Rp 40.000', 'C. Rp 30.000', 'D. Rp 20.000']
      },
      {
        question_text: 'Kevin memiliki kue bolu yang dipotong menjadi 12 bagian sama besar. Ia memberi 3 potong ke ayah, 2 potong ke ibu, dan 4 potong ke adiknya. Berapa potong kue yang bisa dimakan Kevin sendiri?',
        correct_answer: 'B',
        choices: ['A. 2 potong', 'B. 3 potong', 'C. 4 potong', 'D. 5 potong']
      }
    ];

    let questionCount = 0;
    for (const questionData of questions) {
      const { data: question, error: questionError } = await supabase
        .from('test_questions')
        .insert({
          test_section_id: testSectionId,
          question_text: questionData.question_text,
          image_url: null,
          correct_answer: questionData.correct_answer
        })
        .select()
        .single();

      if (questionError && !questionError.message.includes('duplicate')) {
        console.error('Error creating question:', questionError);
        continue;
      }

      const questionId = question?.id || await getExistingQuestionId(testSectionId, questionData.question_text);
      
      if (questionId) {
        // Create choices for this question
        for (const choiceText of questionData.choices) {
          const { error: choiceError } = await supabase
            .from('test_choices')
            .insert({
              question_id: questionId,
              choice_text: choiceText
            });

          if (choiceError && !choiceError.message.includes('duplicate')) {
            console.error('Error creating choice:', choiceError);
          }
        }
        questionCount++;
        console.log(`✅ Created question ${questionCount}: ${questionData.question_text.substring(0, 50)}...`);
      }
    }

    // Step 5: Create quiz section (empty)
    console.log('🎯 Creating empty quiz section...');
    const { error: quizSectionError } = await supabase
      .from('quiz_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'quiz'),
        style_id: kinestheticStyleId
      });

    if (quizSectionError && !quizSectionError.message.includes('duplicate')) {
      console.error('Error creating quiz section:', quizSectionError);
    } else {
      console.log('✅ Created empty quiz section');
    }

    console.log('\n🎉 Kinesthetic course content created successfully!');
    console.log('=====================================');
    console.log(`Course: "Belajar Dasar Pecahan Matematika"`);
    console.log(`- Learn section with kinesthetic-optimized content (hands-on activities)`);
    console.log(`- Test section with ${questionCount} questions`);
    console.log(`- Quiz section (empty as requested)`);
    console.log(`- All using Kinesthetic learning style: ${kinestheticStyleId}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Helper functions
async function getCourseSectionId(courseId, sectionType) {
  const { data, error } = await supabase
    .from('course_sections')
    .select('id')
    .eq('course_id', courseId)
    .eq('section_type', sectionType)
    .single();
  
  if (error) {
    console.error(`Error getting ${sectionType} course section:`, error);
    return null;
  }
  
  return data.id;
}

async function getExistingLearnSectionId(courseId, styleId) {
  const { data, error } = await supabase
    .from('learn_sections')
    .select('id')
    .eq('style_id', styleId)
    .single();
  
  return data?.id || null;
}

async function getExistingTestSectionId(courseId, styleId) {
  const { data, error } = await supabase
    .from('test_sections')
    .select('id')
    .eq('style_id', styleId)
    .single();
  
  return data?.id || null;
}

async function getExistingQuestionId(testSectionId, questionText) {
  const { data, error } = await supabase
    .from('test_questions')
    .select('id')
    .eq('test_section_id', testSectionId)
    .ilike('question_text', `%${questionText.substring(0, 20)}%`)
    .single();
  
  return data?.id || null;
}

// Run the function
createKinestheticContent().catch(console.error);
