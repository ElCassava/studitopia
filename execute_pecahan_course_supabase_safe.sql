-- Script to create "Belajar Dasar Pecahan Matematika" course data
-- Optimized for Supabase execution with course_id: efcd3f8c-e743-4155-be7f-1bbd0f7d3e08
-- Auditory Learning Style ID: 9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85
-- IDEMPOTENT: Safe to run multiple times without creating duplicates

-- 2. Create course sections (learn, test, quiz) - only if they don't exist
-- Learn Section
INSERT INTO public.course_sections (course_id, section_type) 
SELECT 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08', 'learn'
WHERE NOT EXISTS (
    SELECT 1 FROM public.course_sections 
    WHERE course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' AND section_type = 'learn'
);

-- Test Section  
INSERT INTO public.course_sections (course_id, section_type) 
SELECT 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08', 'test'
WHERE NOT EXISTS (
    SELECT 1 FROM public.course_sections 
    WHERE course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' AND section_type = 'test'
);

-- Quiz Section
INSERT INTO public.course_sections (course_id, section_type) 
SELECT 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08', 'quiz'
WHERE NOT EXISTS (
    SELECT 1 FROM public.course_sections 
    WHERE course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' AND section_type = 'quiz'
);

-- 3. Create learn section with AUDITORY learning style - only if it doesn't exist
INSERT INTO public.learn_sections (course_section_id, style_id) 
SELECT cs.id, '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_sections ls
    WHERE ls.course_section_id = cs.id
);

-- 4. Create 3 learn contents (optimized for auditory learners) - only if they don't exist
-- Learn Content 1: Pengenalan Pecahan (Auditory-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Mari kita dengarkan penjelasan tentang pecahan! Bayangkan kamu mendengar suara pembagi pizza: "Crak! Crak! Crak!" - pizza dipotong menjadi 4 bagian sama besar. Sekarang dengarkan: "Satu... per... empat!" Itulah cara membaca pecahan 1/4. Pembilang adalah angka pertama (1) yang kamu ucapkan - menunjukkan berapa bagian yang diambil. Penyebut adalah angka kedua (4) yang kamu ucapkan setelah kata "per" - menunjukkan total bagian keseluruhan. Coba ucapkan: "Dua per tiga", "Lima per delapan"!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Mari kita dengarkan penjelasan tentang pecahan%'
);

-- Learn Content 2: Jenis-jenis Pecahan (Auditory-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id,
    'Dengarkan baik-baik jenis-jenis pecahan ini! Pertama, "Pecahan Biasa" - ucapkan: "satu per dua", "tiga per empat", "lima per delapan". Kedua, "Pecahan Campuran" - ucapkan dengan jeda: "satu... dan... satu per dua", "dua... dan... tiga per empat". Ketiga, "Pecahan Desimal" - ucapkan dengan titik: "nol koma lima", "nol koma tujuh puluh lima". Keempat, "Persen" - ucapkan dengan tegas: "lima puluh persen!", "tujuh puluh lima persen!". Ingat, semua bentuk ini memiliki nilai yang sama, hanya cara mengucapkannya yang berbeda.',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Dengarkan baik-baik jenis-jenis pecahan ini%'
);

-- Learn Content 3: Operasi Dasar Pecahan (Auditory-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id,
    'Mari dengarkan aturan operasi pecahan dengan baik! Untuk Penjumlahan dan Pengurangan, ingat mantra ini: "Penyebut sama dulu, baru pembilang dijumlah!" Ucapkan: "Satu per empat PLUS satu per empat SAMA DENGAN dua per empat". Untuk Perkalian, ucapkan: "Pembilang kali pembilang, penyebut kali penyebut!" Contoh: "Dua per tiga KALI tiga per empat". Untuk Pembagian, ingat: "Balik yang belakang, lalu kali!" Ucapkan: "Setengah BAGI seperempat SAMA DENGAN setengah KALI empat per satu". Selalu akhiri dengan: "Sederhanakan jika bisa!"',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Mari dengarkan aturan operasi pecahan%'
);

-- 5. Create test section with AUDITORY learning style - only if it doesn't exist
INSERT INTO public.test_sections (course_section_id, style_id) 
SELECT cs.id, '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'test'
AND NOT EXISTS (
    SELECT 1 FROM public.test_sections ts
    WHERE ts.course_section_id = cs.id
);

-- 6. Create test questions and choices (all 14 questions) - with comprehensive validation
WITH question_data AS (
  SELECT 
    ts.id AS test_section_id,
    questions.*
  FROM public.test_sections ts
  JOIN public.course_sections cs ON ts.course_section_id = cs.id
  CROSS JOIN (VALUES
    ('Suatu hari, Ibu membeli satu kue dan membaginya menjadi 4 potong yang sama besar. Budi memakan 2 potong dari kue itu. Berapa bagian kue yang dimakan Budi?', 'B', '%Budi memakan 2 potong%'),
    ('Rina punya 23 buku, dan Dika punya 43 buku. Kalau digabung, berapa jumlah buku mereka berdua?', 'C', '%Rina punya 23 buku%'),
    ('Dalam perlombaan matematika, Rafi mendapatkan nilai 35 dari 100. Kalau nilainya ditulis dalam bentuk persen, hasilnya berapa?', 'C', '%Rafi mendapatkan nilai 35%'),
    ('Lina memiliki pita sepanjang 1 2/8 meter. Pecahan mana yang nilainya sama dengan 1 2/8 meter?', 'B', '%Lina memiliki pita sepanjang 1 2/8%'),
    ('Ibu memiliki 200 gram kue. Ia ingin memberi topping sebanyak 75% dari berat kue itu. Berapa gram topping yang digunakan Ibu?', 'C', '%Ibu memiliki 200 gram kue%'),
    ('Nilai ujian empat anak adalah: Bayu = ½, Dita = 0,4, Sinta = 4/5, dan Lala = ¾. Urutkan nilai mereka dari yang paling kecil sampai yang paling besar.', 'B', '%Nilai ujian empat anak%'),
    ('Ubah pecahan ¾ menjadi bentuk desimal.', 'C', '%Ubah pecahan ¾%'),
    ('Di dapur, Ibu menakar gula sebanyak 13/5 gelas. Jika ditulis sebagai pecahan campuran, berapa hasilnya?', 'B', '%Ibu menakar gula sebanyak 13/5%'),
    ('Ibu punya 500 gram tepung. Sebanyak 1/5 bagian dipakai untuk membuat roti, dan 1/10 bagian tumpah. Berapa sisa tepung yang masih ada?', 'C', '%Ibu punya 500 gram tepung%'),
    ('Paman memiliki ½ liter jus jeruk. Ia meminumnya ¼ liter. Lalu paman membeli 0,6 liter jus apel dan 0,2 liter jus semangka. Berapa total jus yang paman miliki sekarang?', 'C', '%Paman memiliki ½ liter jus jeruk%'),
    ('Sebuah angka desimal adalah 1,75. Pecahan mana yang nilainya sama dengan angka tersebut?', 'C', '%angka desimal adalah 1,75%'),
    ('Lina membawa 1 batang cokelat ke sekolah. Sepertiga (⅓) diberikan ke guru, dan seperenam (⅙) diberikan ke sahabatnya. Berapa bagian cokelat yang masih dimiliki Lina?', 'B', '%Lina membawa 1 batang cokelat%'),
    ('Arif punya pita sepanjang 25 cm. Ia memberikan ⅖ kepada Bima untuk hiasan kado, dan ⅓ dari sisa pita dipakai untuk menghias buku. Berapa cm pita yang belum digunakan?', 'C', '%Arif punya pita sepanjang 25 cm%'),
    ('Kevin memiliki kue bolu yang dipotong menjadi 12 bagian sama besar. Ia memberi 3 potong ke ayah, 2 potong ke ibu, dan 4 potong ke adiknya. Berapa potong kue yang bisa dimakan Kevin sendiri?', 'B', '%Kevin memiliki kue bolu%')
  ) AS questions(question_text, correct_answer, search_pattern)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
  AND cs.section_type = 'test'
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

-- 7. Create test choices for all questions - with validation
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
    ('D. ⁴⁄₄', '%Budi memakan 2 potong%'),
    -- Question 2 choices
    ('A. 56', '%Rina punya 23 buku%'),
    ('B. 64', '%Rina punya 23 buku%'),
    ('C. 66', '%Rina punya 23 buku%'),
    ('D. 76', '%Rina punya 23 buku%'),
    -- Question 3 choices
    ('A. 0,35%', '%Rafi mendapatkan nilai 35%'),
    ('B. 3,5%', '%Rafi mendapatkan nilai 35%'),
    ('C. 35%', '%Rafi mendapatkan nilai 35%'),
    ('D. 350%', '%Rafi mendapatkan nilai 35%'),
    -- Question 4 choices
    ('A. 1 1/3', '%Lina memiliki pita sepanjang 1 2/8%'),
    ('B. 1 1/4', '%Lina memiliki pita sepanjang 1 2/8%'),
    ('C. 1 1/2', '%Lina memiliki pita sepanjang 1 2/8%'),
    ('D. 1 1/5', '%Lina memiliki pita sepanjang 1 2/8%'),
    -- Question 5 choices
    ('A. 100 gram', '%Ibu memiliki 200 gram kue%'),
    ('B. 125 gram', '%Ibu memiliki 200 gram kue%'),
    ('C. 150 gram', '%Ibu memiliki 200 gram kue%'),
    ('D. 175 gram', '%Ibu memiliki 200 gram kue%'),
    -- Question 6 choices
    ('A. ½, 0,4, ¾, 4/5', '%Nilai ujian empat anak%'),
    ('B. 0,4, ½, ¾, 4/5', '%Nilai ujian empat anak%'),
    ('C. 4/5, ¾, ½, 0,4', '%Nilai ujian empat anak%'),
    ('D. ¾, ½, 4/5, 0,4', '%Nilai ujian empat anak%'),
    -- Question 7 choices
    ('A. 0,25', '%Ubah pecahan ¾%'),
    ('B. 0,5', '%Ubah pecahan ¾%'),
    ('C. 0,75', '%Ubah pecahan ¾%'),
    ('D. 1,25', '%Ubah pecahan ¾%'),
    -- Question 8 choices
    ('A. 2 2/5', '%Ibu menakar gula sebanyak 13/5%'),
    ('B. 2 3/5', '%Ibu menakar gula sebanyak 13/5%'),
    ('C. 3 2/5', '%Ibu menakar gula sebanyak 13/5%'),
    ('D. 3 3/5', '%Ibu menakar gula sebanyak 13/5%'),
    -- Question 9 choices
    ('A. 250 gram', '%Ibu punya 500 gram tepung%'),
    ('B. 300 gram', '%Ibu punya 500 gram tepung%'),
    ('C. 350 gram', '%Ibu punya 500 gram tepung%'),
    ('D. 400 gram', '%Ibu punya 500 gram tepung%'),
    -- Question 10 choices
    ('A. 0,9 liter', '%Paman memiliki ½ liter jus jeruk%'),
    ('B. 1 liter', '%Paman memiliki ½ liter jus jeruk%'),
    ('C. 1,05 liter', '%Paman memiliki ½ liter jus jeruk%'),
    ('D. 1,1 liter', '%Paman memiliki ½ liter jus jeruk%'),
    -- Question 11 choices
    ('A. 1 ¼', '%angka desimal adalah 1,75%'),
    ('B. 1 ½', '%angka desimal adalah 1,75%'),
    ('C. 1 ¾', '%angka desimal adalah 1,75%'),
    ('D. 1 2/5', '%angka desimal adalah 1,75%'),
    -- Question 12 choices
    ('A. ¼ batang', '%Lina membawa 1 batang cokelat%'),
    ('B. ½ batang', '%Lina membawa 1 batang cokelat%'),
    ('C. ¾ batang', '%Lina membawa 1 batang cokelat%'),
    ('D. ⅔ batang', '%Lina membawa 1 batang cokelat%'),
    -- Question 13 choices
    ('A. 5 cm', '%Arif punya pita sepanjang 25 cm%'),
    ('B. 8 cm', '%Arif punya pita sepanjang 25 cm%'),
    ('C. 10 cm', '%Arif punya pita sepanjang 25 cm%'),
    ('D. 12 cm', '%Arif punya pita sepanjang 25 cm%'),
    -- Question 14 choices
    ('A. 2 potong', '%Kevin memiliki kue bolu%'),
    ('B. 3 potong', '%Kevin memiliki kue bolu%'),
    ('C. 4 potong', '%Kevin memiliki kue bolu%'),
    ('D. 5 potong', '%Kevin memiliki kue bolu%')
  ) AS choices(choice_text, question_pattern)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
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

-- 8. Create quiz section with AUDITORY learning style (empty as requested) - only if it doesn't exist
INSERT INTO public.quiz_sections (course_section_id, style_id) 
SELECT cs.id, '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'quiz'
AND NOT EXISTS (
    SELECT 1 FROM public.quiz_sections qs
    WHERE qs.course_section_id = cs.id
);

-- END OF SCRIPT
-- 
-- SUMMARY OF WHAT WILL BE CREATED (only if not already exists):
-- ✅ 3 Course sections (learn, test, quiz)
-- ✅ 1 Learn section with auditory learning style
-- ✅ 3 Learn contents (auditory-optimized)
-- ✅ 1 Test section with auditory learning style  
-- ✅ 14 Test questions with all their choices (56 choices total)
-- ✅ 1 Quiz section (empty as requested)
--
-- VALIDATION: This script is idempotent and safe to run multiple times!
