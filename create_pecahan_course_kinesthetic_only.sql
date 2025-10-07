-- Script to create "Belajar Dasar Pecahan Matematika" course content for KINESTHETIC learners
-- This script creates kinesthetic-optimized content for the existing course
-- Kinesthetic Learning Style ID: f5379d13-d830-4e78-8353-981829a5fd7c
-- Course ID: efcd3f8c-e743-4155-be7f-1bbd0f7d3e08

-- IMPORTANT: This script assumes the course and course_sections already exist.
-- It will create kinesthetic-specific learn_sections, test_sections, and their content.

-- 1. Create learn section with KINESTHETIC learning style
INSERT INTO public.learn_sections (course_section_id, style_id) 
SELECT cs.id, 'f5379d13-d830-4e78-8353-981829a5fd7c'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_sections ls
    WHERE ls.course_section_id = cs.id 
    AND ls.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
);

-- 2. Create 3 learn contents (optimized for kinesthetic learners)
-- Learn Content 1: Pengenalan Pecahan (Kinesthetic-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Mari kita belajar pecahan dengan cara menyenangkan! Ambil kertas dan pensil, lalu ikuti kegiatan ini: 1) Gambar lingkaran besar di kertas, lalu bagi menjadi 4 bagian sama besar dengan menggaris. Warnai 2 bagian dengan pensil warna. Ini adalah pecahan 2/4 atau setengah! 2) Lipat kertas menjadi 8 bagian, buka lipatan, lalu hitung kotak-kotaknya. Gunting 3 kotak dan rasakan ukurannya. Ini adalah 3/8! 3) Siapkan 10 kelereng atau benda kecil lainnya. Pisahkan menjadi 2 kelompok sama banyak dengan tangan. Setiap kelompok adalah 5/10 atau setengah! Dengan menyentuh dan membuat sendiri, kamu akan lebih mudah memahami pecahan.',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Mari kita belajar pecahan dengan cara menyenangkan%'
);

-- Learn Content 2: Cara Menulis dan Membaca Pecahan (Kinesthetic-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Sekarang mari kita praktik menulis dan membaca pecahan dengan gerakan! 1) Tulis angka pembilang di udara dengan jari telunjuk, lalu tulis garis miring dari kiri atas ke kanan bawah, kemudian tulis penyebut. Contoh: untuk 3/4, tulis "3" (angkat tangan), garis "/" (gerakan diagonal), "4" (tulis di bawah). 2) Ketuk meja sesuai pembilang, lalu tepuk tangan sesuai penyebut. Untuk 2/5: ketuk-ketuk (2 kali), tepuk-tepuk-tepuk-tepuk-tepuk (5 kali). 3) Berdiri dan lakukan gerakan: angkat tangan untuk pembilang, jongkok untuk penyebut. Latih dengan pecahan 1/2, 3/4, 2/3, 5/8. Gerakan tubuh akan membantu otakmu mengingat struktur pecahan!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Sekarang mari kita praktik menulis dan membaca pecahan dengan gerakan%'
);

-- Learn Content 3: Operasi Pecahan (Kinesthetic-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Mari belajar operasi pecahan dengan permainan hands-on! PENJUMLAHAN: Siapkan 2 piring dan 8 kelereng. Taruh 2 kelereng di piring pertama (2/8), 3 kelereng di piring kedua (3/8). Gabungkan kedua piring - hitung totalnya: 5 kelereng (5/8)! PENGURANGAN: Mulai dengan 6 kelereng (6/10), ambil 2 kelereng dengan tangan (kurangi 2/10), sisa 4 kelereng (4/10). PERKALIAN: Untuk 1/2 × 1/3, ambil selembar kertas, lipat jadi 2 bagian (1/2), lalu lipat lagi jadi 3 bagian. Buka lipatan - ada 6 kotak, ambil 1 kotak. Ini adalah 1/6! PEMBAGIAN: Untuk 1/2 ÷ 1/4, potong kertas jadi 2 bagian ambil 1 bagian (1/2), lalu lihat berapa potong 1/4 yang muat di dalamnya dengan mengukur langsung. Dengan menyentuh dan memanipulasi benda nyata, operasi pecahan jadi mudah dipahami!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Mari belajar operasi pecahan dengan permainan hands-on%'
);

-- 3. Create test section with KINESTHETIC learning style
INSERT INTO public.test_sections (course_section_id, style_id) 
SELECT cs.id, 'f5379d13-d830-4e78-8353-981829a5fd7c'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'test'
AND NOT EXISTS (
    SELECT 1 FROM public.test_sections ts
    WHERE ts.course_section_id = cs.id
    AND ts.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
);

-- 4. Create test questions and choices (all 14 questions, same as auditory version but for kinesthetic learners)
-- We'll use the same questions since the content is the same, just targeted at kinesthetic learners

-- First, let's create a temporary table to store all question and choice data
WITH question_data AS (
  SELECT 
    ts.id as test_section_id,
    q.question_text,
    q.correct_answer,
    q.search_pattern
  FROM public.test_sections ts
  JOIN public.course_sections cs ON ts.course_section_id = cs.id
  CROSS JOIN (VALUES
    ('Suatu hari, Ibu membeli satu kue dan membaginya menjadi 4 potong yang sama besar. Budi memakan 2 potong dari kue itu. Berapa bagian kue yang dimakan Budi?', 'B', '%Budi memakan 2 potong%'),
    ('Ani memiliki coklat batang yang terbagi menjadi 8 kotak. Dia memberikan 3 kotak kepada adiknya. Berapa bagian coklat yang diberikan Ani?', 'B', '%Ani memiliki coklat batang%'),
    ('Dalam sebuah kelas, 12 dari 20 siswa adalah perempuan. Berapa pecahan yang menyatakan jumlah siswa laki-laki?', 'B', '%12 dari 20 siswa%'),
    ('Pak Rudi memiliki kebun yang dibagi menjadi 6 petak. 4 petak ditanami jagung dan sisanya ditanami kacang. Berapa pecahan kebun yang ditanami kacang?', 'A', '%kebun yang dibagi menjadi 6 petak%'),
    ('Ibu membeli 3 kg beras dan menggunakan 1,5 kg untuk memasak. Berapa pecahan beras yang tersisa?', 'A', '%3 kg beras dan menggunakan 1,5 kg%'),
    ('Nilai ujian empat anak adalah: Ana 0,8; Budi 1/2; Cici 75%; dan Dedi 4/5. Urutan nilai dari yang terkecil adalah...', 'B', '%Nilai ujian empat anak%'),
    ('Hasil dari 2/3 + 1/6 adalah...', 'C', '%2/3 + 1/6%'),
    ('Hasil dari 5/6 - 1/3 adalah...', 'A', '%5/6 - 1/3%'),
    ('Bu Sari memiliki 3/4 kg gula. Dia menggunakan 2/3 dari gula tersebut untuk membuat kue. Berapa kg gula yang digunakan Bu Sari?', 'A', '%3/4 kg gula%'),
    ('Hasil dari 2/5 × 3/4 adalah...', 'D', '%2/5 × 3/4%'),
    ('Hasil dari 3/4 ÷ 1/2 adalah...', 'D', '%3/4 ÷ 1/2%'),
    ('Sebuah tangki air berisi 2/3 bagian. Jika kapasitas tangki 90 liter, berapa liter air dalam tangki?', 'C', '%tangki air berisi 2/3 bagian%'),
    ('Dina menabung 1/4 dari uang sakunya setiap minggu. Jika uang saku Dina Rp 40.000 per minggu, berapa rupiah yang ditabung dalam sebulan (4 minggu)?', 'B', '%Dina menabung 1/4%'),
    ('Kevin memiliki kue bolu yang dipotong menjadi 12 bagian sama besar. Ia memberi 3 potong ke ayah, 2 potong ke ibu, dan 4 potong ke adiknya. Berapa potong kue yang bisa dimakan Kevin sendiri?', 'B', '%Kevin memiliki kue bolu%')
  ) AS q(question_text, correct_answer, search_pattern)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
  AND cs.section_type = 'test'
  AND ts.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
)
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer)
SELECT 
  qd.test_section_id,
  qd.question_text,
  null,
  qd.correct_answer
FROM question_data qd
WHERE NOT EXISTS (
  SELECT 1 FROM public.test_questions tq
  WHERE tq.test_section_id = qd.test_section_id 
  AND tq.question_text LIKE qd.search_pattern
);

-- 5. Create test choices for all questions
WITH choice_data AS (
  SELECT 
    tq.id AS question_id,
    choices.*
  FROM public.test_questions tq
  JOIN public.test_sections ts ON tq.test_section_id = ts.id
  JOIN public.course_sections cs ON ts.course_section_id = cs.id
  CROSS JOIN (VALUES
    -- Question 1 choices
    ('A. ¼', '%Budi memakan 2 potong%'),
    ('B. ²⁄₄', '%Budi memakan 2 potong%'),
    ('C. ¾', '%Budi memakan 2 potong%'),
    ('D. 1', '%Budi memakan 2 potong%'),
    
    -- Question 2 choices  
    ('A. ²⁄₈', '%Ani memiliki coklat batang%'),
    ('B. ³⁄₈', '%Ani memiliki coklat batang%'),
    ('C. ⁴⁄₈', '%Ani memiliki coklat batang%'),
    ('D. ⁵⁄₈', '%Ani memiliki coklat batang%'),
    
    -- Question 3 choices
    ('A. ³⁄₅', '%12 dari 20 siswa%'),
    ('B. ²⁄₅', '%12 dari 20 siswa%'),
    ('C. ¹²⁄₂₀', '%12 dari 20 siswa%'),
    ('D. ⁸⁄₂₀', '%12 dari 20 siswa%'),
    
    -- Question 4 choices
    ('A. ¹⁄₃', '%kebun yang dibagi menjadi 6 petak%'),
    ('B. ²⁄₆', '%kebun yang dibagi menjadi 6 petak%'),
    ('C. ⁴⁄₆', '%kebun yang dibagi menjadi 6 petak%'),
    ('D. ²⁄₃', '%kebun yang dibagi menjadi 6 petak%'),
    
    -- Question 5 choices
    ('A. ½', '%3 kg beras dan menggunakan 1,5 kg%'),
    ('B. ¹⁄₃', '%3 kg beras dan menggunakan 1,5 kg%'),
    ('C. ²⁄₃', '%3 kg beras dan menggunakan 1,5 kg%'),
    ('D. ¾', '%3 kg beras dan menggunakan 1,5 kg%'),
    
    -- Question 6 choices
    ('A. ½, 0,4, ¾, 4/5', '%Nilai ujian empat anak%'),
    ('B. 0,4, ½, ¾, 4/5', '%Nilai ujian empat anak%'),
    ('C. ¾, 4/5, ½, 0,4', '%Nilai ujian empat anak%'),
    ('D. 4/5, ¾, ½, 0,4', '%Nilai ujian empat anak%'),
    
    -- Question 7 choices
    ('A. ³⁄₉', '%2/3 + 1/6%'),
    ('B. ³⁄₆', '%2/3 + 1/6%'),
    ('C. ⁵⁄₆', '%2/3 + 1/6%'),
    ('D. ⁷⁄₉', '%2/3 + 1/6%'),
    
    -- Question 8 choices
    ('A. ³⁄₆', '%5/6 - 1/3%'),
    ('B. ⁴⁄₆', '%5/6 - 1/3%'),
    ('C. ²⁄₃', '%5/6 - 1/3%'),
    ('D. ½', '%5/6 - 1/3%'),
    
    -- Question 9 choices
    ('A. ½ kg', '%3/4 kg gula%'),
    ('B. ¼ kg', '%3/4 kg gula%'),
    ('C. ⅔ kg', '%3/4 kg gula%'),
    ('D. ¼ kg', '%3/4 kg gula%'),
    
    -- Question 10 choices
    ('A. ⁵⁄₉', '%2/5 × 3/4%'),
    ('B. ⁶⁄₂₀', '%2/5 × 3/4%'),
    ('C. ⁵⁄₂₀', '%2/5 × 3/4%'),
    ('D. ³⁄₁₀', '%2/5 × 3/4%'),
    
    -- Question 11 choices
    ('A. ³⁄₈', '%3/4 ÷ 1/2%'),
    ('B. ³⁄₆', '%3/4 ÷ 1/2%'),
    ('C. 1', '%3/4 ÷ 1/2%'),
    ('D. 1½', '%3/4 ÷ 1/2%'),
    
    -- Question 12 choices
    ('A. 30 liter', '%tangki air berisi 2/3 bagian%'),
    ('B. 45 liter', '%tangki air berisi 2/3 bagian%'),
    ('C. 60 liter', '%tangki air berisi 2/3 bagian%'),
    ('D. 90 liter', '%tangki air berisi 2/3 bagian%'),
    
    -- Question 13 choices
    ('A. Rp 10.000', '%Dina menabung 1/4%'),
    ('B. Rp 40.000', '%Dina menabung 1/4%'),
    ('C. Rp 30.000', '%Dina menabung 1/4%'),
    ('D. Rp 20.000', '%Dina menabung 1/4%'),
    
    -- Question 14 choices
    ('A. 2 potong', '%Kevin memiliki kue bolu%'),
    ('B. 3 potong', '%Kevin memiliki kue bolu%'),
    ('C. 4 potong', '%Kevin memiliki kue bolu%'),
    ('D. 5 potong', '%Kevin memiliki kue bolu%')
  ) AS choices(choice_text, question_pattern)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
  AND ts.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
  AND tq.question_text LIKE choices.question_pattern
)
INSERT INTO public.test_choices (question_id, choice_text)
SELECT 
  cd.question_id,
  cd.choice_text
FROM choice_data cd
WHERE NOT EXISTS (
  SELECT 1 FROM public.test_choices tc
  WHERE tc.question_id = cd.question_id 
  AND tc.choice_text = cd.choice_text
);

-- 6. Create quiz section with KINESTHETIC learning style (empty as requested)
INSERT INTO public.quiz_sections (course_section_id, style_id) 
SELECT cs.id, 'f5379d13-d830-4e78-8353-981829a5fd7c'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'quiz'
AND NOT EXISTS (
    SELECT 1 FROM public.quiz_sections qs
    WHERE qs.course_section_id = cs.id
    AND qs.style_id = 'f5379d13-d830-4e78-8353-981829a5fd7c'
);

-- END OF SCRIPT
-- 
-- SUMMARY OF WHAT WILL BE CREATED (only if not already exists):
-- ✅ 1 Learn section with kinesthetic learning style
-- ✅ 3 Learn contents (kinesthetic-optimized with hands-on activities)
-- ✅ 1 Test section with kinesthetic learning style  
-- ✅ 14 Test questions with all their choices (56 choices total)
-- ✅ 1 Quiz section (empty as requested)
--
-- LEARNING STYLE FOCUS: 
-- 🤲 Hands-on activities and physical manipulation
-- ✋ Movement-based learning and body gestures  
-- 🎯 Tactile experiences with real objects
-- 🏃 Active participation and practice
-- 📝 Writing, drawing, and creating with hands
--
-- VALIDATION: This script is idempotent and safe to run multiple times!
