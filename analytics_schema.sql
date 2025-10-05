-- Additional tables needed for comprehensive quiz tracking and analytics

-- Quiz Questions Table (similar to test_questions)
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_section_id uuid,
  question_text text NOT NULL,
  image_url text,
  correct_answer text NOT NULL,
  explanation text,
  question_order integer DEFAULT 1,
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_section_id_fkey FOREIGN KEY (quiz_section_id) REFERENCES public.quiz_sections(id)
);

-- Quiz Choices Table (similar to test_choices)
CREATE TABLE public.quiz_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid,
  choice_text text NOT NULL,
  choice_order integer DEFAULT 1,
  CONSTRAINT quiz_choices_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);

-- Quiz Attempt Details Table (similar to test_attempt_details)
CREATE TABLE public.quiz_attempt_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_attempt_id uuid,
  question_id uuid,
  selected_answer text,
  is_correct boolean,
  time_taken integer CHECK (time_taken >= 0),
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_attempt_details_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempt_details_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(id),
  CONSTRAINT quiz_attempt_details_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);

-- Update quiz_attempts table to include score and completion times
ALTER TABLE public.quiz_attempts 
ADD COLUMN start_time timestamp with time zone DEFAULT now(),
ADD COLUMN end_time timestamp with time zone,
ADD COLUMN score integer CHECK (score >= 0 AND score <= 100);

-- Create indexes for better performance on analytics queries
CREATE INDEX idx_test_attempts_user_course ON public.test_attempts(user_id, test_section_id);
CREATE INDEX idx_test_attempts_start_time ON public.test_attempts(start_time);
CREATE INDEX idx_test_attempt_details_correct ON public.test_attempt_details(is_correct);

CREATE INDEX idx_quiz_attempts_user_course ON public.quiz_attempts(user_id, quiz_section_id);
CREATE INDEX idx_quiz_attempts_start_time ON public.quiz_attempts(start_time);
CREATE INDEX idx_quiz_attempt_details_correct ON public.quiz_attempt_details(is_correct);

