-- Script to create "Belajar Dasar Pecahan Matematika" course
-- This script should be run in sequence

-- First, let's assume we have learning styles already set up
-- If not, you'll need to create them first

-- 1. Create the main course
INSERT INTO public.courses (course_name, description) 
VALUES (
    'Belajar Dasar Pecahan Matematika',
    'Kursus ini dirancang untuk membantu siswa memahami konsep dasar pecahan dalam matematika. Siswa akan belajar mengenai pengertian pecahan, cara membaca dan menulis pecahan, operasi dasar pecahan (penjumlahan, pengurangan, perkalian, pembagian), mengubah bentuk pecahan ke desimal dan persen, serta penerapan pecahan dalam kehidupan sehari-hari melalui soal-soal cerita yang menarik.'
) RETURNING id;

-- Note: Replace '23f66688-72a8-49dd-9db8-8515f0c8b6e8' with the actual UUID returned from above
-- Replace 'LEARNING_STYLE_ID_HERE' with actual learning style IDs from your system

-- 2. Create course sections (learn, test, quiz)
-- Learn Section
INSERT INTO public.course_sections (course_id, section_type) 
VALUES ('23f66688-72a8-49dd-9db8-8515f0c8b6e8', 'learn') RETURNING id;

-- Test Section  
INSERT INTO public.course_sections (course_id, section_type) 
VALUES ('23f66688-72a8-49dd-9db8-8515f0c8b6e8', 'test') RETURNING id;

-- Quiz Section (empty for now as requested)
INSERT INTO public.course_sections (course_id, section_type) 
VALUES ('23f66688-72a8-49dd-9db8-8515f0c8b6e8', 'quiz') RETURNING id;

-- 3. Create learn section with learning style
-- Replace LEARN_COURSE_SECTION_ID with the learn section ID from step 2
INSERT INTO public.learn_sections (course_section_id, style_id) 
VALUES ('137dcde6-1b15-4f97-af2b-abba357e0044', 'LEARNING_STYLE_ID_HERE') RETURNING id;

-- 4. Create 3 learn contents (as requested)
-- Replace LEARN_SECTION_ID with the learn section ID from step 3

-- Learn Content 1: Pengenalan Pecahan
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
VALUES (
    'LEARN_SECTION_ID',
    'Pecahan adalah bilangan yang menunjukkan bagian dari keseluruhan. Pecahan terdiri dari pembilang (angka di atas) dan penyebut (angka di bawah). Contohnya, jika sebuah pizza dipotong menjadi 4 bagian sama besar dan kamu makan 1 potong, maka kamu telah memakan 1/4 (satu per empat) dari pizza tersebut. Pembilang (1) menunjukkan berapa bagian yang diambil, sedangkan penyebut (4) menunjukkan total bagian keseluruhan.',
    null
);

-- Learn Content 2: Jenis-jenis Pecahan
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
VALUES (
    'LEARN_SECTION_ID',
    'Ada beberapa jenis pecahan yang perlu kamu ketahui: 1) Pecahan Biasa: seperti 1/2, 3/4, 5/8. 2) Pecahan Campuran: seperti 1 1/2, 2 3/4 (terdiri dari bilangan bulat dan pecahan biasa). 3) Pecahan Desimal: seperti 0,5; 0,75; 1,25. 4) Persen: seperti 50%, 75%, 125%. Semua bentuk ini dapat diubah dari satu bentuk ke bentuk lainnya dan memiliki nilai yang sama.',
    null
);

-- Learn Content 3: Operasi Dasar Pecahan
INSERT INTO public.learn_contents (learn_section_id, description, image_url) 
VALUES (
    'LEARN_SECTION_ID',
    'Dalam operasi pecahan, ada beberapa aturan penting: 1) Penjumlahan dan Pengurangan: penyebut harus sama terlebih dahulu, baru pembilang dijumlahkan atau dikurangkan. 2) Perkalian: pembilang dikali pembilang, penyebut dikali penyebut. 3) Pembagian: kalikan dengan kebalikan pecahan pembagi. 4) Penyederhanaan: selalu sederhanakan hasil dengan membagi pembilang dan penyebut dengan FPB (Faktor Persekutuan Terbesar) mereka.',
    null
);

-- 5. Create test section with learning style
-- Replace TEST_COURSE_SECTION_ID with the test section ID from step 2
INSERT INTO public.test_sections (course_section_id, style_id) 
VALUES ('TEST_COURSE_SECTION_ID', 'LEARNING_STYLE_ID_HERE') RETURNING id;

-- 6. Create test questions and choices
-- Replace TEST_SECTION_ID with the test section ID from step 5

-- Question 1
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Suatu hari, Ibu membeli satu kue dan membaginya menjadi 4 potong yang sama besar. Budi memakan 2 potong dari kue itu. Berapa bagian kue yang dimakan Budi?',
    null,
    'B'
) RETURNING id;

-- Choices for Question 1 (replace QUESTION_1_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_1_ID', 'A. ¼'),
('QUESTION_1_ID', 'B. ²⁄₄'),
('QUESTION_1_ID', 'C. ¾'),
('QUESTION_1_ID', 'D. ⁴⁄₄');

-- Question 2
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Rina punya 23 buku, dan Dika punya 43 buku. Kalau digabung, berapa jumlah buku mereka berdua?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 2 (replace QUESTION_2_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_2_ID', 'A. 56'),
('QUESTION_2_ID', 'B. 64'),
('QUESTION_2_ID', 'C. 66'),
('QUESTION_2_ID', 'D. 76');

-- Question 3
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Dalam perlombaan matematika, Rafi mendapatkan nilai 35 dari 100. Kalau nilainya ditulis dalam bentuk persen, hasilnya berapa?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 3 (replace QUESTION_3_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_3_ID', 'A. 0,35%'),
('QUESTION_3_ID', 'B. 3,5%'),
('QUESTION_3_ID', 'C. 35%'),
('QUESTION_3_ID', 'D. 350%');

-- Question 4
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Lina memiliki pita sepanjang 1 2/8 meter. Pecahan mana yang nilainya sama dengan 1 2/8 meter?',
    null,
    'B'
) RETURNING id;

-- Choices for Question 4 (replace QUESTION_4_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_4_ID', 'A. 1 1/3'),
('QUESTION_4_ID', 'B. 1 1/4'),
('QUESTION_4_ID', 'C. 1 1/2'),
('QUESTION_4_ID', 'D. 1 1/5');

-- Question 5
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Ibu memiliki 200 gram kue. Ia ingin memberi topping sebanyak 75% dari berat kue itu. Berapa gram topping yang digunakan Ibu?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 5 (replace QUESTION_5_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_5_ID', 'A. 100 gram'),
('QUESTION_5_ID', 'B. 125 gram'),
('QUESTION_5_ID', 'C. 150 gram'),
('QUESTION_5_ID', 'D. 175 gram');

-- Question 6
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Nilai ujian empat anak adalah: Bayu = ½, Dita = 0,4, Sinta = 4/5, dan Lala = ¾. Urutkan nilai mereka dari yang paling kecil sampai yang paling besar.',
    null,
    'B'
) RETURNING id;

-- Choices for Question 6 (replace QUESTION_6_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_6_ID', 'A. ½, 0,4, ¾, 4/5'),
('QUESTION_6_ID', 'B. 0,4, ½, ¾, 4/5'),
('QUESTION_6_ID', 'C. 4/5, ¾, ½, 0,4'),
('QUESTION_6_ID', 'D. ¾, ½, 4/5, 0,4');

-- Question 7
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Ubah pecahan ¾ menjadi bentuk desimal.',
    null,
    'C'
) RETURNING id;

-- Choices for Question 7 (replace QUESTION_7_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_7_ID', 'A. 0,25'),
('QUESTION_7_ID', 'B. 0,5'),
('QUESTION_7_ID', 'C. 0,75'),
('QUESTION_7_ID', 'D. 1,25');

-- Question 8
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Di dapur, Ibu menakar gula sebanyak 13/5 gelas. Jika ditulis sebagai pecahan campuran, berapa hasilnya?',
    null,
    'B'
) RETURNING id;

-- Choices for Question 8 (replace QUESTION_8_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_8_ID', 'A. 2 2/5'),
('QUESTION_8_ID', 'B. 2 3/5'),
('QUESTION_8_ID', 'C. 3 2/5'),
('QUESTION_8_ID', 'D. 3 3/5');

-- Question 9
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Ibu punya 500 gram tepung. Sebanyak 1/5 bagian dipakai untuk membuat roti, dan 1/10 bagian tumpah. Berapa sisa tepung yang masih ada?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 9 (replace QUESTION_9_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_9_ID', 'A. 250 gram'),
('QUESTION_9_ID', 'B. 300 gram'),
('QUESTION_9_ID', 'C. 350 gram'),
('QUESTION_9_ID', 'D. 400 gram');

-- Question 10
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Paman memiliki ½ liter jus jeruk. Ia meminumnya ¼ liter. Lalu paman membeli 0,6 liter jus apel dan 0,2 liter jus semangka. Berapa total jus yang paman miliki sekarang?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 10 (replace QUESTION_10_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_10_ID', 'A. 0,9 liter'),
('QUESTION_10_ID', 'B. 1 liter'),
('QUESTION_10_ID', 'C. 1,05 liter'),
('QUESTION_10_ID', 'D. 1,1 liter');

-- Question 11
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Sebuah angka desimal adalah 1,75. Pecahan mana yang nilainya sama dengan angka tersebut?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 11 (replace QUESTION_11_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_11_ID', 'A. 1 ¼'),
('QUESTION_11_ID', 'B. 1 ½'),
('QUESTION_11_ID', 'C. 1 ¾'),
('QUESTION_11_ID', 'D. 1 2/5');

-- Question 12
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Lina membawa 1 batang cokelat ke sekolah. Sepertiga (⅓) diberikan ke guru, dan seperenam (⅙) diberikan ke sahabatnya. Berapa bagian cokelat yang masih dimiliki Lina?',
    null,
    'B'
) RETURNING id;

-- Choices for Question 12 (replace QUESTION_12_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_12_ID', 'A. ¼ batang'),
('QUESTION_12_ID', 'B. ½ batang'),
('QUESTION_12_ID', 'C. ¾ batang'),
('QUESTION_12_ID', 'D. ⅔ batang');

-- Question 13
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Arif punya pita sepanjang 25 cm. Ia memberikan ⅖ kepada Bima untuk hiasan kado, dan ⅓ dari sisa pita dipakai untuk menghias buku. Berapa cm pita yang belum digunakan?',
    null,
    'C'
) RETURNING id;

-- Choices for Question 13 (replace QUESTION_13_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_13_ID', 'A. 5 cm'),
('QUESTION_13_ID', 'B. 8 cm'),
('QUESTION_13_ID', 'C. 10 cm'),
('QUESTION_13_ID', 'D. 12 cm');

-- Question 14
INSERT INTO public.test_questions (test_section_id, question_text, image_url, correct_answer) 
VALUES (
    'TEST_SECTION_ID',
    'Kevin memiliki kue bolu yang dipotong menjadi 12 bagian sama besar. Ia memberi 3 potong ke ayah, 2 potong ke ibu, dan 4 potong ke adiknya. Berapa potong kue yang bisa dimakan Kevin sendiri?',
    null,
    'B'
) RETURNING id;

-- Choices for Question 14 (replace QUESTION_14_ID)
INSERT INTO public.test_choices (question_id, choice_text) VALUES 
('QUESTION_14_ID', 'A. 2 potong'),
('QUESTION_14_ID', 'B. 3 potong'),
('QUESTION_14_ID', 'C. 4 potong'),
('QUESTION_14_ID', 'D. 5 potong');

-- 7. Create quiz section (empty as requested)
-- Replace QUIZ_COURSE_SECTION_ID with the quiz section ID from step 2
INSERT INTO public.quiz_sections (course_section_id, style_id) 
VALUES ('QUIZ_COURSE_SECTION_ID', 'LEARNING_STYLE_ID_HERE') RETURNING id;

-- Quiz contents intentionally left empty as requested

-- END OF SCRIPT
-- 
-- IMPORTANT NOTES:
-- 1. You need to replace all placeholder IDs (23f66688-72a8-49dd-9db8-8515f0c8b6e8, LEARNING_STYLE_ID_HERE, etc.) with actual UUIDs
-- 2. Make sure you have learning styles set up in your database first
-- 3. Run this script step by step, replacing the IDs as you go
-- 4. The quiz section is created but left empty as requested
