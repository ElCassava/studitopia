-- Create auditory test section for Pecahan course
-- Course ID: efcd3f8c-e743-4155-be7f-1bbd0f7d3e08
-- Course Section ID: 32b25dc6-3b39-40b4-b55c-2c4211cf9452
-- Auditory Style ID: 9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85

-- Step 1: Create test section for auditory learners
INSERT INTO test_sections (course_section_id, style_id)
VALUES ('32b25dc6-3b39-40b4-b55c-2c4211cf9452', '9bdc1a7d-9ce1-49a6-afc6-96448f0c7f85');

-- Let's get the ID of the newly created test section
-- We'll need to run this separately to get the ID

-- Step 2: Copy first 14 questions from visual test section to auditory test section
-- First, let's see what we have:
SELECT 
    tq.id, 
    tq.question_text, 
    tq.image_url, 
    tq.correct_answer,
    ROW_NUMBER() OVER (ORDER BY tq.id) as row_num
FROM test_questions tq 
WHERE tq.test_section_id = '3e8019bf-dd1f-42c1-9d31-35a2fbc49aee'
ORDER BY tq.id
LIMIT 14;
