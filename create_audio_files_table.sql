-- Create a flexible audio_files table that can link to any content type
CREATE TABLE public.audio_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  duration numeric,
  file_size bigint,
  -- Can be linked to any type of entity (e.g., question, content, etc.)
  related_table text NOT NULL CHECK (related_table IN (
    'learn_contents', 
    'test_questions', 
    'quiz_contents', 
    'learning_style_test'
  )),
  related_id uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audio_files_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX idx_audio_files_related ON audio_files(related_table, related_id);
CREATE INDEX idx_audio_files_uploaded_at ON audio_files(uploaded_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to audio files
CREATE POLICY "Audio files are publicly readable" ON audio_files
FOR SELECT USING (true);

-- Allow authenticated users to insert audio files
CREATE POLICY "Authenticated users can insert audio files" ON audio_files
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own audio files
CREATE POLICY "Users can update audio files" ON audio_files
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete audio files
CREATE POLICY "Users can delete audio files" ON audio_files
FOR DELETE USING (auth.role() = 'authenticated');
