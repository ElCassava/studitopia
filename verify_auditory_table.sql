-- Simple verification queries for auditory_questions_with_audio table
-- Run these in your Supabase SQL Editor to check the current state

-- 1. Check if table exists and count records
SELECT 
  COUNT(*) as total_records,
  COUNT(audio_url) as records_with_audio,
  COUNT(CASE WHEN audio_url IS NULL THEN 1 END) as records_without_audio
FROM public.auditory_questions_with_audio;

-- 2. Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'auditory_questions_with_audio' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show sample records with audio mapping
SELECT 
  question_id,
  LEFT(question_text, 50) || '...' as question_preview,
  course_name,
  CASE 
    WHEN bucket_path IS NOT NULL THEN RIGHT(bucket_path, 10)
    ELSE 'NO AUDIO'
  END as audio_file,
  array_length(choices, 1) as choice_count,
  learning_style
FROM public.auditory_questions_with_audio
ORDER BY bucket_path NULLS LAST, question_id
LIMIT 15;

-- 4. Course breakdown
SELECT 
  course_name,
  COUNT(*) as question_count,
  COUNT(audio_url) as with_audio,
  COUNT(*) - COUNT(audio_url) as without_audio
FROM public.auditory_questions_with_audio
GROUP BY course_name
ORDER BY course_name;

-- 5. Audio file mapping (Q1, Q2, Q3 pattern)
SELECT 
  RIGHT(bucket_path, 10) as filename,
  LEFT(question_text, 60) || '...' as question_preview,
  course_name
FROM public.auditory_questions_with_audio
WHERE bucket_path IS NOT NULL
ORDER BY bucket_path;
