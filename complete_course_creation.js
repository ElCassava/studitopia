require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function continueCourseCreation() {
  try {
    console.log('🏗️  Continuing with course creation from step 3...');
    
    // Known IDs from your manual creation
    const courseId = '23f66688-72a8-49dd-9db8-8515f0c8b6e8';
    const learnSectionId = '137dcde6-1b15-4f97-af2b-abba357e0044';
    
    // Learning style IDs (using Visual as default)
    const visualStyleId = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14';
    
    // First, let's get the course sections created in step 2
    console.log('📋 Getting course sections...');
    const { data: courseSections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('section_type');
    
    if (sectionsError) {
      console.error('Error getting course sections:', sectionsError);
      return;
    }
    
    console.log('Found course sections:', courseSections.map(s => `${s.section_type}: ${s.id}`));
    
    const learnCourseSection = courseSections.find(s => s.section_type === 'learn');
    const testCourseSection = courseSections.find(s => s.section_type === 'test');
    const quizCourseSection = courseSections.find(s => s.section_type === 'quiz');
    
    if (!learnCourseSection || !testCourseSection || !quizCourseSection) {
      console.error('Missing course sections. Please complete step 2 first.');
      return;
    }
    
    // Step 3: Create learn section with learning style
    console.log('📚 Creating learn section...');
    const { data: learnSection, error: learnSectionError } = await supabase
      .from('learn_sections')
      .insert([{
        course_section_id: learnCourseSection.id,
        style_id: visualStyleId
      }])
      .select()
      .single();
    
    if (learnSectionError) {
      console.error('Error creating learn section:', learnSectionError);
      return;
    }
    
    console.log('✅ Created learn section:', learnSection.id);
    
    // Step 4: Create 3 learn contents
    console.log('📝 Creating learn contents...');
    
    const learnContents = [
      {
        learn_section_id: learnSection.id,
        description: 'Pecahan adalah bilangan yang menunjukkan bagian dari keseluruhan. Pecahan terdiri dari pembilang (angka di atas) dan penyebut (angka di bawah). Contohnya, jika sebuah pizza dipotong menjadi 4 bagian sama besar dan kamu makan 1 potong, maka kamu telah memakan 1/4 (satu per empat) dari pizza tersebut. Pembilang (1) menunjukkan berapa bagian yang diambil, sedangkan penyebut (4) menunjukkan total bagian keseluruhan.',
        image_url: null
      },
      {
        learn_section_id: learnSection.id,
        description: 'Ada beberapa jenis pecahan yang perlu kamu ketahui: 1) Pecahan Biasa: seperti 1/2, 3/4, 5/8. 2) Pecahan Campuran: seperti 1 1/2, 2 3/4 (terdiri dari bilangan bulat dan pecahan biasa). 3) Pecahan Desimal: seperti 0,5; 0,75; 1,25. 4) Persen: seperti 50%, 75%, 125%. Semua bentuk ini dapat diubah dari satu bentuk ke bentuk lainnya dan memiliki nilai yang sama.',
        image_url: null
      },
      {
        learn_section_id: learnSection.id,
        description: 'Dalam operasi pecahan, ada beberapa aturan penting: 1) Penjumlahan dan Pengurangan: penyebut harus sama terlebih dahulu, baru pembilang dijumlahkan atau dikurangkan. 2) Perkalian: pembilang dikali pembilang, penyebut dikali penyebut. 3) Pembagian: kalikan dengan kebalikan pecahan pembagi. 4) Penyederhanaan: selalu sederhanakan hasil dengan membagi pembilang dan penyebut dengan FPB (Faktor Persekutuan Terbesar) mereka.',
        image_url: null
      }
    ];
    
    const { error: contentsError } = await supabase
      .from('learn_contents')
      .insert(learnContents);
    
    if (contentsError) {
      console.error('Error creating learn contents:', contentsError);
      return;
    }
    
    console.log('✅ Created 3 learn contents');
    
    // Step 5: Create test section
    console.log('📊 Creating test section...');
    const { data: testSection, error: testSectionError } = await supabase
      .from('test_sections')
      .insert([{
        course_section_id: testCourseSection.id,
        style_id: visualStyleId
      }])
      .select()
      .single();
    
    if (testSectionError) {
      console.error('Error creating test section:', testSectionError);
      return;
    }
    
    console.log('✅ Created test section:', testSection.id);
    
    // Step 6: Create test questions and choices
    console.log('❓ Creating test questions...');
    
    const questions = [
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
    
    let questionCount = 0;
    for (const questionData of questions) {
      // Create question
      const { data: question, error: questionError } = await supabase
        .from('test_questions')
        .insert([{
          test_section_id: testSection.id,
          question_text: questionData.question_text,
          image_url: null,
          correct_answer: questionData.correct_answer
        }])
        .select()
        .single();
      
      if (questionError) {
        console.error(`Error creating question ${questionCount + 1}:`, questionError);
        continue;
      }
      
      // Create choices for this question
      const choicesData = questionData.choices.map(choice => ({
        question_id: question.id,
        choice_text: choice
      }));
      
      const { error: choicesError } = await supabase
        .from('test_choices')
        .insert(choicesData);
      
      if (choicesError) {
        console.error(`Error creating choices for question ${questionCount + 1}:`, choicesError);
        continue;
      }
      
      questionCount++;
      console.log(`✅ Created question ${questionCount} with ${questionData.choices.length} choices`);
    }
    
    // Step 7: Create quiz section (empty as requested)
    console.log('🎯 Creating empty quiz section...');
    const { data: quizSection, error: quizSectionError } = await supabase
      .from('quiz_sections')
      .insert([{
        course_section_id: quizCourseSection.id,
        style_id: visualStyleId
      }])
      .select()
      .single();
    
    if (quizSectionError) {
      console.error('Error creating quiz section:', quizSectionError);
      return;
    }
    
    console.log('✅ Created empty quiz section:', quizSection.id);
    
    console.log('\n🎉 Course creation completed successfully!');
    console.log('=====================================');
    console.log(`Course: "Belajar Dasar Pecahan Matematika"`);
    console.log(`- Learn section with 3 content items`);
    console.log(`- Test section with ${questionCount} questions`);
    console.log(`- Quiz section (empty as requested)`);
    console.log(`- All using Visual learning style: ${visualStyleId}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

continueCourseCreation();
