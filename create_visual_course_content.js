require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createVisualContent() {
  try {
    console.log('🏗️  Creating visual content for Pecahan course...');
    
    const courseId = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08';
    const visualStyleId = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14';
    
    // Step 1: Create learn section with visual learning style
    console.log('📚 Creating visual learn section...');
    const { data: learnSection, error: learnSectionError } = await supabase
      .from('learn_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'learn'),
        style_id: visualStyleId
      })
      .select()
      .single();

    if (learnSectionError && !learnSectionError.message.includes('duplicate')) {
      console.error('Error creating learn section:', learnSectionError);
      return;
    }

    const learnSectionId = learnSection?.id || await getExistingLearnSectionId(courseId, visualStyleId);
    console.log('✅ Learn section ready:', learnSectionId);

    // Step 2: Create learn contents (visual-optimized)
    console.log('📝 Creating visual learn contents...');
    const learnContents = [
      {
        description: 'Mari pelajari pecahan dengan diagram visual yang jelas! Perhatikan gambar-gambar berikut: 1) Lingkaran yang dibagi menjadi bagian-bagian sama besar - setiap bagian yang diarsir menunjukkan pecahan. Contoh: lingkaran dibagi 4, 2 bagian diarsir = 2/4. 2) Persegi panjang yang dipotong-potong - perhatikan pola warna yang berbeda untuk memahami bagian dan keseluruhan. 3) Grafik batang berwarna yang menunjukkan perbandingan pecahan. 4) Tabel visual yang membandingkan pecahan, desimal, dan persen. 5) Diagram pie chart untuk memvisualisasikan bagian dari keseluruhan. Dengan melihat diagram dan grafik yang berwarna-warni, kamu akan lebih mudah memahami konsep pecahan secara visual!',
        image_url: null
      },
      {
        description: 'Belajar menulis dan membaca pecahan dengan bantuan visual yang menarik! 1) Perhatikan skema warna: pembilang ditulis dengan warna biru di atas, garis pembagi dengan warna hitam, dan penyebut dengan warna merah di bawah. 2) Gunakan kartu visual dengan angka besar dan jelas - kartu biru untuk pembilang, kartu merah untuk penyebut. 3) Lihat tabel konversi visual yang menunjukkan hubungan antara pecahan, desimal, dan persen dengan grafik berwarna. 4) Pelajari dengan flowchart langkah-demi-langkah membaca pecahan: lihat pembilang → baca garis → lihat penyebut. 5) Gunakan highlight dan marker warna untuk membedakan bagian-bagian pecahan dalam teks. Dengan panduan visual yang terstruktur, membaca dan menulis pecahan menjadi mudah!',
        image_url: null
      },
      {
        description: 'Pahami operasi pecahan dengan visualisasi yang mudah dimengerti! PENJUMLAHAN: Lihat diagram lingkaran dengan arsiran berbeda warna - gabungkan arsiran untuk melihat hasil. Contoh: 2/8 (arsiran biru) + 3/8 (arsiran kuning) = 5/8 (gabungan arsiran). PENGURANGAN: Gunakan diagram batang - hilangkan bagian yang dikurangi dengan visual crossing out. PERKALIAN: Perhatikan grid persegi yang dibagi-bagi - area yang diarsir ganda menunjukkan hasil perkalian. Contoh: 1/2 × 1/3 = area yang diarsir pada grid 2×3. PEMBAGIAN: Lihat diagram pembagian dengan panah dan kotak - berapa kotak kecil muat dalam kotak besar. Semua operasi dilengkapi dengan grafik step-by-step berwarna, tabel visual, dan diagram alur yang memudahkan pemahaman!',
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
        console.log(`✅ Created visual learn content ${i + 1}`);
      }
    }

    // Step 3: Create test section with visual learning style
    console.log('📊 Creating visual test section...');
    const { data: testSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'test'),
        style_id: visualStyleId
      })
      .select()
      .single();

    if (testSectionError && !testSectionError.message.includes('duplicate')) {
      console.error('Error creating test section:', testSectionError);
      return;
    }

    const testSectionId = testSection?.id || await getExistingTestSectionId(courseId, visualStyleId);
    console.log('✅ Test section ready:', testSectionId);

    // Step 4: Create test questions with images (randomized answers)
    console.log('❓ Creating visual test questions with images...');
    const questions = [
      {
        question_text: 'Berapa pecahan yang menunjukkan pizza tersebut?',
        image_url: 'https://i.imgur.com/NwcwlqX.png',
        correct_answer: 'D',
        choices: ['A. 5/8', 'B. 3/4', 'C. 1/2', 'D. 3/8']
      },
      {
        question_text: 'Berapa jumlah kedua air dalam botol tersebut?',
        image_url: 'https://i.imgur.com/ucTy9p3.png',
        correct_answer: 'B',
        choices: ['A. 7/6', 'B. 12/10', 'C. 3/4', 'D. 6/7']
      },
      {
        question_text: 'Anton membeli 5 buah jeruk, 2 buah pisang dan 3 buah apel. Berat 1 buah jeruk 1/8 kg, berat 1 buah apel 1/5 kg, dan berat 1 buah pisang 0,1kg. Berapa kg total berat buah yang anton beli?',
        image_url: 'https://i.imgur.com/zXAWcjA.png',
        correct_answer: 'C',
        choices: ['A. 1,425 kg', 'B. 0,8 kg', 'C. 1 kg', 'D. 1,5 kg']
      },
      {
        question_text: 'Berapa nilai yang menunjukkan gambar tersebut?',
        image_url: 'https://i.imgur.com/5ID1UYA.png',
        correct_answer: 'A',
        choices: ['A. 2 1/4', 'B. 6/4', 'C. 5/2', 'D. 1/4']
      },
      {
        question_text: 'Budi punya 2 batang cokelat, satu berisi 15 potong dan satu lagi 12 potong, masing-masing batang cokelat luasnya 24 cm². Ia memakan beberapa potong cokelat (seperti pada gambar), hitunglah luas cokelat yang dimakan Budi.',
        image_url: 'https://i.imgur.com/qdXSi69.png',
        correct_answer: 'D',
        choices: ['A. 14 cm²', 'B. 6 cm²', 'C. 24 cm²', 'D. 8 cm²']
      },
      {
        question_text: 'Urutkan botol dari yang isinya paling sedikit ke paling banyak',
        image_url: 'https://i.imgur.com/Fg0C8ia.png',
        correct_answer: 'A',
        choices: ['A. 4,3,1,2,5', 'B. 5,3,1,2,4', 'C. 4,3,1,5,2', 'D. 4,3,5,2,1']
      },
      {
        question_text: 'Berat 1 buah semangka 3,5 kg, 1 buah nanas 1 1/4 kg, 1 buah strawberry 25 gram. Berapa berat buah di dalam keranjang tersebut?',
        image_url: 'https://i.imgur.com/uVO5cdA.png',
        correct_answer: 'C',
        choices: ['A. 13,2 kg', 'B. 12 kg', 'C. 10 kg', 'D. 13 kg']
      },
      {
        question_text: 'Toni membawa keranjang berisi 4 buah alpukat, 7 buah tomat, dan 5 buah mangga. 1 buah alpukat seberat 1/4 kg, 1 buah tomat seberat 1/10 kg, 1 buah mangga seberat 0,3kg. Berapa beban yang dibawah toni jika keranjang seberat 1/2 kg?',
        image_url: 'https://i.imgur.com/9LSsjj0.png',
        correct_answer: 'A',
        choices: ['A. 3,7 kg', 'B. 4 kg', 'C. 3,2 kg', 'D. 3,5 kg']
      },
      {
        question_text: 'Papa memiliki 2 liter susu. Kemudian papa menuangkan susu tersebut ke gelas yang dapat di isi 1/4 liter. Berapa gelas yang dapat di isi penuh oleh papa?',
        image_url: 'https://i.imgur.com/8zrNPlo.png',
        correct_answer: 'A',
        choices: ['A. 8 gelas', 'B. 10 gelas', 'C. 6 gelas', 'D. 12 gelas']
      },
      {
        question_text: 'Ubahlah kedua lingkaran tersebut ke bentuk persen',
        image_url: 'https://i.imgur.com/PeDVTzO.png',
        correct_answer: 'A',
        choices: ['A. 75%', 'B. 50%', 'C. 25%', 'D. 15%']
      }
    ];

    let questionCount = 0;
    for (const questionData of questions) {
      const { data: question, error: questionError } = await supabase
        .from('test_questions')
        .insert({
          test_section_id: testSectionId,
          question_text: questionData.question_text,
          image_url: questionData.image_url,
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
        console.log(`✅ Created visual question ${questionCount}: ${questionData.question_text.substring(0, 50)}...`);
      }
    }

    // Step 5: Create quiz section (empty)
    console.log('🎯 Creating empty quiz section...');
    const { error: quizSectionError } = await supabase
      .from('quiz_sections')
      .insert({
        course_section_id: await getCourseSectionId(courseId, 'quiz'),
        style_id: visualStyleId
      });

    if (quizSectionError && !quizSectionError.message.includes('duplicate')) {
      console.error('Error creating quiz section:', quizSectionError);
    } else {
      console.log('✅ Created empty quiz section');
    }

    console.log('\n🎉 Visual course content created successfully!');
    console.log('=====================================');
    console.log(`Course: "Belajar Dasar Pecahan Matematika"`);
    console.log(`- Learn section with visual-optimized content (diagrams & graphics)`);
    console.log(`- Test section with ${questionCount} visual questions (with images)`);
    console.log(`- Quiz section (empty as requested)`);
    console.log(`- All using Visual learning style: ${visualStyleId}`);
    console.log('\n📊 Answer key randomized:');
    console.log('Q1: D, Q2: B, Q3: C, Q4: A, Q5: D, Q6: A, Q7: C, Q8: A, Q9: A, Q10: A');
    
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
createVisualContent().catch(console.error);
