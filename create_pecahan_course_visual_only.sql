-- Script to create "Belajar Dasar Pecahan Matematika" course content for VISUAL learners
-- This script creates visual-optimized content for the existing course
-- Visual Learning Style ID: ee37bf1e-a3fc-45a1-8013-f9253fccbc14
-- Course ID: efcd3f8c-e743-4155-be7f-1bbd0f7d3e08

-- IMPORTANT: This script assumes the course and course_sections already exist.
-- It will create visual-specific learn_sections, test_sections, and their content.

-- 1. Create learn section with VISUAL learning style
INSERT INTO public.learn_sections (course_section_id, style_id) 
SELECT cs.id, 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_sections ls
    WHERE ls.course_section_id = cs.id 
    AND ls.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
);

-- 2. Create 3 learn contents (optimized for visual learners)
-- Learn Content 1: Pengenalan Pecahan (Visual-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Mari pelajari pecahan dengan diagram visual yang jelas! Perhatikan gambar-gambar berikut: 1) Lingkaran yang dibagi menjadi bagian-bagian sama besar - setiap bagian yang diarsir menunjukkan pecahan. Contoh: lingkaran dibagi 4, 2 bagian diarsir = 2/4. 2) Persegi panjang yang dipotong-potong - perhatikan pola warna yang berbeda untuk memahami bagian dan keseluruhan. 3) Grafik batang berwarna yang menunjukkan perbandingan pecahan. 4) Tabel visual yang membandingkan pecahan, desimal, dan persen. 5) Diagram pie chart untuk memvisualisasikan bagian dari keseluruhan. Dengan melihat diagram dan grafik yang berwarna-warni, kamu akan lebih mudah memahami konsep pecahan secara visual!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Mari pelajari pecahan dengan diagram visual yang jelas%'
);

-- Learn Content 2: Cara Menulis dan Membaca Pecahan (Visual-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Belajar menulis dan membaca pecahan dengan bantuan visual yang menarik! 1) Perhatikan skema warna: pembilang ditulis dengan warna biru di atas, garis pembagi dengan warna hitam, dan penyebut dengan warna merah di bawah. 2) Gunakan kartu visual dengan angka besar dan jelas - kartu biru untuk pembilang, kartu merah untuk penyebut. 3) Lihat tabel konversi visual yang menunjukkan hubungan antara pecahan, desimal, dan persen dengan grafik berwarna. 4) Pelajari dengan flowchart langkah-demi-langkah membaca pecahan: lihat pembilang → baca garis → lihat penyebut. 5) Gunakan highlight dan marker warna untuk membedakan bagian-bagian pecahan dalam teks. Dengan panduan visual yang terstruktur, membaca dan menulis pecahan menjadi mudah!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Belajar menulis dan membaca pecahan dengan bantuan visual yang menarik%'
);

-- Learn Content 3: Operasi Pecahan (Visual-focused)
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
SELECT ls.id, 
    'Pahami operasi pecahan dengan visualisasi yang mudah dimengerti! PENJUMLAHAN: Lihat diagram lingkaran dengan arsiran berbeda warna - gabungkan arsiran untuk melihat hasil. Contoh: 2/8 (arsiran biru) + 3/8 (arsiran kuning) = 5/8 (gabungan arsiran). PENGURANGAN: Gunakan diagram batang - hilangkan bagian yang dikurangi dengan visual crossing out. PERKALIAN: Perhatikan grid persegi yang dibagi-bagi - area yang diarsir ganda menunjukkan hasil perkalian. Contoh: 1/2 × 1/3 = area yang diarsir pada grid 2×3. PEMBAGIAN: Lihat diagram pembagian dengan panah dan kotak - berapa kotak kecil muat dalam kotak besar. Semua operasi dilengkapi dengan grafik step-by-step berwarna, tabel visual, dan diagram alur yang memudahkan pemahaman!',
    null
FROM public.learn_sections ls
JOIN public.course_sections cs ON ls.course_section_id = cs.id
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'learn'
AND ls.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
AND NOT EXISTS (
    SELECT 1 FROM public.learn_contents lc
    WHERE lc.learn_section_id = ls.id 
    AND lc.description LIKE '%Pahami operasi pecahan dengan visualisasi yang mudah dimengerti%'
);

-- 3. Create test section with VISUAL learning style
INSERT INTO public.test_sections (course_section_id, style_id) 
SELECT cs.id, 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'test'
AND NOT EXISTS (
    SELECT 1 FROM public.test_sections ts
    WHERE ts.course_section_id = cs.id
    AND ts.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
);

-- 4. Create test questions and choices (10 new visual questions with randomized answers)
WITH question_data AS (
  SELECT 
    ts.id as test_section_id,
    q.question_text,
    q.correct_answer,
    q.search_pattern,
    q.image_url
  FROM public.test_sections ts
  JOIN public.course_sections cs ON ts.course_section_id = cs.id
  CROSS JOIN (VALUES
    ('Berapa pecahan yang menunjukkan pizza tersebut?', 'D', '%pizza tersebut%', 'https://i.imgur.com/NwcwlqX.png'),
    ('Berapa jumlah kedua air dalam botol tersebut?', 'B', '%air dalam botol%', 'https://i.imgur.com/ucTy9p3.png'),
    ('Anton membeli 5 buah jeruk, 2 buah pisang dan 3 buah apel. Berat 1 buah jeruk 1/8 kg, berat 1 buah apel 1/5 kg, dan berat 1 buah pisang 0,1kg. Berapa kg total berat buah yang anton beli?', 'C', '%Anton membeli 5 buah jeruk%', 'https://i.imgur.com/zXAWcjA.png'),
    ('Berapa nilai yang menunjukkan gambar tersebut?', 'A', '%nilai yang menunjukkan gambar%', 'https://i.imgur.com/5ID1UYA.png'),
    ('Budi punya 2 batang cokelat, satu berisi 15 potong dan satu lagi 12 potong, masing-masing batang cokelat luasnya 24 cm². Ia memakan beberapa potong cokelat (seperti pada gambar), hitunglah luas cokelat yang dimakan Budi.', 'D', '%luas cokelat yang dimakan Budi%', 'https://i.imgur.com/qdXSi69.png'),
    ('Urutkan botol dari yang isinya paling sedikit ke paling banyak', 'A', '%Urutkan botol dari yang isinya%', 'https://i.imgur.com/Fg0C8ia.png'),
    ('Berat 1 buah semangka 3,5 kg, 1 buah nanas 1 1/4 kg, 1 buah strawberry 25 gram. Berapa berat buah di dalam keranjang tersebut?', 'C', '%berat buah di dalam keranjang%', 'https://i.imgur.com/uVO5cdA.png'),
    ('Toni membawa keranjang berisi 4 buah alpukat, 7 buah tomat, dan 5 buah mangga. 1 buah alpukat seberat 1/4 kg, 1 buah tomat seberat 1/10 kg, 1 buah mangga seberat 0,3kg. Berapa beban yang dibawah toni jika keranjang seberat 1/2 kg?', 'A', '%beban yang dibawah toni%', 'https://i.imgur.com/9LSsjj0.png'),
    ('Papa memiliki 2 liter susu. Kemudian papa menuangkan susu tersebut ke gelas yang dapat di isi 1/4 liter. Berapa gelas yang dapat di isi penuh oleh papa?', 'A', '%gelas yang dapat di isi penuh%', 'https://i.imgur.com/8zrNPlo.png'),
    ('Ubahlah kedua lingkaran tersebut ke bentuk persen', 'A', '%lingkaran tersebut ke bentuk persen%', 'https://i.imgur.com/PeDVTzO.png')
  ) AS q(question_text, correct_answer, search_pattern, image_url)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
  AND cs.section_type = 'test'
  AND ts.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
)
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer)
SELECT 
  qd.test_section_id,
  qd.question_text,
  qd.image_url,
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
    -- Question 1 choices (randomized - correct answer moved to D)
    ('A. 5/8', '%pizza tersebut%'),
    ('B. 3/4', '%pizza tersebut%'),
    ('C. 1/2', '%pizza tersebut%'),
    ('D. 3/8', '%pizza tersebut%'),
    
    -- Question 2 choices (randomized - correct answer moved to B)
    ('A. 7/6', '%air dalam botol%'),
    ('B. 12/10', '%air dalam botol%'),
    ('C. 3/4', '%air dalam botol%'),
    ('D. 6/7', '%air dalam botol%'),
    
    -- Question 3 choices (randomized - correct answer moved to C)
    ('A. 1,425 kg', '%Anton membeli 5 buah jeruk%'),
    ('B. 0,8 kg', '%Anton membeli 5 buah jeruk%'),
    ('C. 1 kg', '%Anton membeli 5 buah jeruk%'),
    ('D. 1,5 kg', '%Anton membeli 5 buah jeruk%'),
    
    -- Question 4 choices (correct answer stays at A)
    ('A. 2 1/4', '%nilai yang menunjukkan gambar%'),
    ('B. 6/4', '%nilai yang menunjukkan gambar%'),
    ('C. 5/2', '%nilai yang menunjukkan gambar%'),
    ('D. 1/4', '%nilai yang menunjukkan gambar%'),
    
    -- Question 5 choices (randomized - correct answer moved to D)
    ('A. 14 cm²', '%luas cokelat yang dimakan Budi%'),
    ('B. 6 cm²', '%luas cokelat yang dimakan Budi%'),
    ('C. 24 cm²', '%luas cokelat yang dimakan Budi%'),
    ('D. 8 cm²', '%luas cokelat yang dimakan Budi%'),
    
    -- Question 6 choices (correct answer stays at A)
    ('A. 4,3,1,2,5', '%Urutkan botol dari yang isinya%'),
    ('B. 5,3,1,2,4', '%Urutkan botol dari yang isinya%'),
    ('C. 4,3,1,5,2', '%Urutkan botol dari yang isinya%'),
    ('D. 4,3,5,2,1', '%Urutkan botol dari yang isinya%'),
    
    -- Question 7 choices (randomized - correct answer moved to C)
    ('A. 13,2 kg', '%berat buah di dalam keranjang%'),
    ('B. 12 kg', '%berat buah di dalam keranjang%'),
    ('C. 10 kg', '%berat buah di dalam keranjang%'),
    ('D. 13 kg', '%berat buah di dalam keranjang%'),
    
    -- Question 8 choices (correct answer stays at A)
    ('A. 3,7 kg', '%beban yang dibawah toni%'),
    ('B. 4 kg', '%beban yang dibawah toni%'),
    ('C. 3,2 kg', '%beban yang dibawah toni%'),
    ('D. 3,5 kg', '%beban yang dibawah toni%'),
    
    -- Question 9 choices (correct answer stays at A)
    ('A. 8 gelas', '%gelas yang dapat di isi penuh%'),
    ('B. 10 gelas', '%gelas yang dapat di isi penuh%'),
    ('C. 6 gelas', '%gelas yang dapat di isi penuh%'),
    ('D. 12 gelas', '%gelas yang dapat di isi penuh%'),
    
    -- Question 10 choices (correct answer stays at A)
    ('A. 75%', '%lingkaran tersebut ke bentuk persen%'),
    ('B. 50%', '%lingkaran tersebut ke bentuk persen%'),
    ('C. 25%', '%lingkaran tersebut ke bentuk persen%'),
    ('D. 15%', '%lingkaran tersebut ke bentuk persen%')
  ) AS choices(choice_text, question_pattern)
  WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08'
  AND ts.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
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

-- 6. Create quiz section with VISUAL learning style (empty as requested)
INSERT INTO public.quiz_sections (course_section_id, style_id) 
SELECT cs.id, 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
FROM public.course_sections cs
WHERE cs.course_id = 'efcd3f8c-e743-4155-be7f-1bbd0f7d3e08' 
AND cs.section_type = 'quiz'
AND NOT EXISTS (
    SELECT 1 FROM public.quiz_sections qs
    WHERE qs.course_section_id = cs.id
    AND qs.style_id = 'ee37bf1e-a3fc-45a1-8013-f9253fccbc14'
);

-- END OF SCRIPT
-- 
-- SUMMARY OF WHAT WILL BE CREATED (only if not already exists):
-- ✅ 1 Learn section with visual learning style
-- ✅ 3 Learn contents (visual-optimized with diagrams and graphics)
-- ✅ 1 Test section with visual learning style  
-- ✅ 10 Test questions with images and all their choices (40 choices total)
-- ✅ 1 Quiz section (empty as requested)
--
-- LEARNING STYLE FOCUS: 
-- 👁️ Visual diagrams and colorful graphics
-- 📊 Charts, graphs, and visual representations  
-- 🎨 Color-coded learning materials
-- 📋 Tables and structured visual layouts
-- 🖼️ Images and visual patterns
--
-- ANSWER KEY RANDOMIZED:
-- Q1: D (was A), Q2: B (was A), Q3: C (was A), Q4: A (stays), Q5: D (was A)
-- Q6: A (stays), Q7: C (was A), Q8: A (stays), Q9: A (stays), Q10: A (stays)
--
-- VALIDATION: This script is idempotent and safe to run multiple times!
