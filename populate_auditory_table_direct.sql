-- Direct SQL to populate auditory_questions_with_audio table
-- Run this in your Supabase SQL Editor

-- First, clear any existing data (optional)
-- DELETE FROM public.auditory_questions_with_audio;

-- Insert data from the relationships
INSERT INTO public.auditory_questions_with_audio (
  question_id,
  question_text,
  correct_answer,
  audio_url,
  bucket_path,
  audio_title,
  duration,
  file_size,
  mime_type,
  learning_style,
  course_name,
  test_section_id,
  choices
)
SELECT 
  tq.id as question_id,
  tq.question_text,
  tq.correct_answer,
  qa.audio_url,
  qa.bucket_path,
  qa.audio_title,
  qa.duration,
  qa.file_size,
  qa.mime_type,
  'Auditory' as learning_style,
  c.course_name,
  ts.id as test_section_id,
  ARRAY_AGG(DISTINCT tc.choice_text ORDER BY tc.choice_text) as choices
FROM public.test_questions tq
JOIN public.test_sections ts ON tq.test_section_id = ts.id
JOIN public.course_sections cs ON ts.course_section_id = cs.id
JOIN public.courses c ON cs.course_id = c.id
JOIN public.learning_styles ls ON ts.style_id = ls.id
LEFT JOIN public.question_audio qa ON tq.id = qa.question_id
LEFT JOIN public.test_choices tc ON tq.id = tc.question_id
WHERE ls.name = 'Auditory'
  AND NOT EXISTS (
    SELECT 1 FROM public.auditory_questions_with_audio 
    WHERE question_id = tq.id
  )
GROUP BY tq.id, tq.question_text, tq.correct_answer, qa.audio_url, 
         qa.bucket_path, qa.audio_title, qa.duration, qa.file_size, 
         qa.mime_type, c.course_name, ts.id
ORDER BY tq.id;

-- Verify the insertion
SELECT 
  COUNT(*) as total_records,
  COUNT(audio_url) as records_with_audio,
  COUNT(*) - COUNT(audio_url) as records_without_audio
FROM public.auditory_questions_with_audio;

-- Show sample data
SELECT 
  question_id,
  LEFT(question_text, 60) || '...' as question_preview,
  course_name,
  CASE WHEN audio_url IS NOT NULL THEN 'YES' ELSE 'NO' END as has_audio,
  RIGHT(bucket_path, 10) as filename,
  array_length(choices, 1) as choice_count
FROM public.auditory_questions_with_audio
ORDER BY question_id
LIMIT 10;
