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
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  quiz_section_id uuid,
  attempt_date timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false,
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT quiz_attempts_quiz_section_id_fkey FOREIGN KEY (quiz_section_id) REFERENCES public.quiz_sections(id)
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

-- USERS
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (id = auth.uid() OR role = 'admin');

CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (id = auth.uid() OR role = 'admin');


-- COURSES
CREATE POLICY courses_select_policy ON courses
  FOR SELECT
  USING (true); -- public catalog


-- COURSE_SECTIONS
CREATE POLICY course_sections_select_policy ON course_sections
  FOR SELECT
  USING (true); -- public catalog


-- ENROLLMENTS
CREATE POLICY enrollments_select_policy ON enrollments
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY enrollments_insert_policy ON enrollments
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));


-- LEARN_SECTIONS
CREATE POLICY learn_sections_select_policy ON learn_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN course_sections cs ON e.course_id = cs.course_id
      WHERE cs.id = learn_sections.course_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- LEARN_CONTENTS
CREATE POLICY learn_contents_select_policy ON learn_contents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learn_sections ls
      JOIN course_sections cs ON ls.course_section_id = cs.id
      JOIN enrollments e ON cs.course_id = e.course_id
      WHERE ls.id = learn_contents.learn_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- TEST_SECTIONS
CREATE POLICY test_sections_select_policy ON test_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN course_sections cs ON e.course_id = cs.course_id
      WHERE cs.id = test_sections.course_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- TEST_QUESTIONS
CREATE POLICY test_questions_select_policy ON test_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_sections ts
      JOIN course_sections cs ON ts.course_section_id = cs.id
      JOIN enrollments e ON cs.course_id = e.course_id
      WHERE ts.id = test_questions.test_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- TEST_CHOICES
CREATE POLICY test_choices_select_policy ON test_choices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_questions tq
      JOIN test_sections ts ON tq.test_section_id = ts.id
      JOIN course_sections cs ON ts.course_section_id = cs.id
      JOIN enrollments e ON cs.course_id = e.course_id
      WHERE tq.id = test_choices.question_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- TEST_ATTEMPTS
CREATE POLICY test_attempts_select_policy ON test_attempts
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY test_attempts_insert_policy ON test_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));


-- TEST_ATTEMPT_DETAILS
CREATE POLICY test_attempt_details_select_policy ON test_attempt_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts ta
      WHERE ta.id = test_attempt_details.test_attempt_id
      AND (ta.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- QUIZ_SECTIONS
CREATE POLICY quiz_sections_select_policy ON quiz_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN course_sections cs ON e.course_id = cs.course_id
      WHERE cs.id = quiz_sections.course_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- QUIZ_CONTENTS
CREATE POLICY quiz_contents_select_policy ON quiz_contents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sections qs
      JOIN course_sections cs ON qs.course_section_id = cs.id
      JOIN enrollments e ON cs.course_id = e.course_id
      WHERE qs.id = quiz_contents.quiz_section_id
      AND (e.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );


-- QUIZ_ATTEMPTS
CREATE POLICY quiz_attempts_select_policy ON quiz_attempts
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY quiz_attempts_insert_policy ON quiz_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));


-- LEARNING_STYLE_TEST
CREATE POLICY learning_style_test_select_policy ON learning_style_test
  FOR SELECT
  USING (true);


-- LEARNING_STYLE_TEST_CHOICES
CREATE POLICY learning_style_test_choices_select_policy ON learning_style_test_choices
  FOR SELECT
  USING (true);


-- LEARNING_STYLE_TEST_RESPONSES
CREATE POLICY learning_style_test_responses_select_policy ON learning_style_test_responses
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY learning_style_test_responses_insert_policy ON learning_style_test_responses
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));


-- LEARNING_STYLES
CREATE POLICY learning_styles_select_policy ON learning_styles
  FOR SELECT
  USING (true);
