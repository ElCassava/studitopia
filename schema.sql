-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.course_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  section_type text NOT NULL CHECK (section_type = ANY (ARRAY['learn'::text, 'test'::text, 'quiz'::text])),
  CONSTRAINT course_sections_pkey PRIMARY KEY (id),
  CONSTRAINT course_sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_name text NOT NULL,
  description text,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id uuid,
  enrolled_at timestamp with time zone DEFAULT now(),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.learn_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  learn_section_id uuid,
  description text,
  image_url text,
  CONSTRAINT learn_contents_pkey PRIMARY KEY (id),
  CONSTRAINT learn_contents_learn_section_id_fkey FOREIGN KEY (learn_section_id) REFERENCES public.learn_sections(id)
);
CREATE TABLE public.learn_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_section_id uuid,
  style_id uuid,
  CONSTRAINT learn_sections_pkey PRIMARY KEY (id),
  CONSTRAINT learn_sections_course_section_id_fkey FOREIGN KEY (course_section_id) REFERENCES public.course_sections(id),
  CONSTRAINT learn_sections_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.learning_styles(id)
);
CREATE TABLE public.learning_style_test (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  image_url text,
  CONSTRAINT learning_style_test_pkey PRIMARY KEY (id)
);
CREATE TABLE public.learning_style_test_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  choice_text text NOT NULL,
  style_id uuid NOT NULL,
  CONSTRAINT learning_style_test_choices_pkey PRIMARY KEY (id),
  CONSTRAINT learning_style_test_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.learning_style_test(id),
  CONSTRAINT learning_style_test_choices_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.learning_styles(id)
);
CREATE TABLE public.learning_style_test_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL,
  choice_id uuid NOT NULL,
  time_taken integer CHECK (time_taken >= 0),
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learning_style_test_responses_pkey PRIMARY KEY (id),
  CONSTRAINT learning_style_test_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT learning_style_test_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.learning_style_test(id),
  CONSTRAINT learning_style_test_responses_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.learning_style_test_choices(id)
);
CREATE TABLE public.learning_styles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT learning_styles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.quiz_attempt_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_attempt_id uuid,
  question_id uuid,
  selected_answer text,
  is_correct boolean,
  time_taken integer CHECK (time_taken >= 0),
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_attempt_details_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempt_details_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(id)
);
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  quiz_section_id uuid,
  attempt_date timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  score integer CHECK (score >= 0 AND score <= 100),
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT quiz_attempts_quiz_section_id_fkey FOREIGN KEY (quiz_section_id) REFERENCES public.quiz_sections(id)
);
CREATE TABLE public.quiz_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid,
  choice_text text NOT NULL,
  choice_order integer DEFAULT 1,
  CONSTRAINT quiz_choices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.quiz_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_section_id uuid,
  description text,
  image_url text,
  CONSTRAINT quiz_contents_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_contents_quiz_section_id_fkey FOREIGN KEY (quiz_section_id) REFERENCES public.quiz_sections(id)
);
CREATE TABLE public.quiz_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_section_id uuid,
  style_id uuid,
  CONSTRAINT quiz_sections_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_sections_course_section_id_fkey FOREIGN KEY (course_section_id) REFERENCES public.course_sections(id),
  CONSTRAINT quiz_sections_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.learning_styles(id)
);
CREATE TABLE public.test_attempt_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_attempt_id uuid,
  question_id uuid,
  time_taken integer CHECK (time_taken >= 0),
  selected_answer text,
  is_correct boolean,
  CONSTRAINT test_attempt_details_pkey PRIMARY KEY (id),
  CONSTRAINT test_attempt_details_test_attempt_id_fkey FOREIGN KEY (test_attempt_id) REFERENCES public.test_attempts(id),
  CONSTRAINT test_attempt_details_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.test_questions(id)
);
CREATE TABLE public.test_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  test_section_id uuid,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  score integer CHECK (score >= 0),
  CONSTRAINT test_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT test_attempts_test_section_id_fkey FOREIGN KEY (test_section_id) REFERENCES public.test_sections(id)
);
CREATE TABLE public.test_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid,
  choice_text text NOT NULL,
  CONSTRAINT test_choices_pkey PRIMARY KEY (id),
  CONSTRAINT test_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.test_questions(id)
);
CREATE TABLE public.test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_section_id uuid,
  question_text text NOT NULL,
  image_url text,
  correct_answer text NOT NULL,
  CONSTRAINT test_questions_pkey PRIMARY KEY (id),
  CONSTRAINT test_questions_test_section_id_fkey FOREIGN KEY (test_section_id) REFERENCES public.test_sections(id)
);
CREATE TABLE public.test_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_section_id uuid,
  style_id uuid,
  CONSTRAINT test_sections_pkey PRIMARY KEY (id),
  CONSTRAINT test_sections_course_section_id_fkey FOREIGN KEY (course_section_id) REFERENCES public.course_sections(id),
  CONSTRAINT test_sections_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.learning_styles(id)
);
CREATE TABLE public.user_section_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_section_id uuid NOT NULL,
  section_type text NOT NULL CHECK (section_type = ANY (ARRAY['learn'::text, 'test'::text, 'quiz'::text])),
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  score integer CHECK (score >= 0 AND score <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_section_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_section_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_section_progress_course_section_id_fkey FOREIGN KEY (course_section_id) REFERENCES public.course_sections(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  email text UNIQUE,
  role text NOT NULL DEFAULT 'student'::text,
  streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  learning_style_id uuid,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_learning_style_id_fkey FOREIGN KEY (learning_style_id) REFERENCES public.learning_styles(id)
);