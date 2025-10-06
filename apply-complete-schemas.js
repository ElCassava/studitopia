const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.log('\nPlease follow these steps:')
  console.log('1. Go to https://supabase.com/dashboard/project/erozhukurioezrygpmtt/settings/api')
  console.log('2. Under "Project API keys", copy the "service_role" key')
  console.log('3. Add it to your .env.local file:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  console.log('4. Run this script again: node apply-complete-schemas.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function executeSQL(sql, description) {
  console.log(`\n📋 ${description}`)
  try {
    const { data, error } = await supabase.rpc('exec', { sql })
    if (error) {
      console.log(`❌ Error: ${error.message}`)
      return false
    }
    console.log(`✅ Success`)
    return true
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`)
    return false
  }
}

async function applyCompleteSchemas() {
  console.log('🚀 Applying Complete Analytics Schemas...')
  console.log('This will create all missing tables and indexes for quiz and learn analytics.')
  
  // Step 1: Create quiz_questions table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.quiz_questions (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      quiz_section_id uuid,
      question_text text NOT NULL,
      image_url text,
      correct_answer text NOT NULL,
      explanation text,
      question_order integer DEFAULT 1,
      created_at timestamp with time zone DEFAULT now(),
      CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
      CONSTRAINT quiz_questions_quiz_section_id_fkey FOREIGN KEY (quiz_section_id) REFERENCES public.quiz_sections(id)
    );
  `, 'Creating quiz_questions table')

  // Step 2: Update quiz_attempts table with missing columns
  await executeSQL(`
    DO $$ 
    BEGIN
      -- Add start_time column if not exists
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'start_time') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN start_time timestamp with time zone DEFAULT now();
      END IF;
      
      -- Add end_time column if not exists
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'end_time') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN end_time timestamp with time zone;
      END IF;
      
      -- Add score column if not exists
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'score') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN score integer CHECK (score >= 0 AND score <= 100);
      END IF;
    END $$;
  `, 'Updating quiz_attempts table with missing columns')

  // Step 3: Create learn_sessions table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.learn_sessions (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      learn_section_id uuid NOT NULL,
      start_time timestamp with time zone DEFAULT now(),
      end_time timestamp with time zone,
      total_time_spent integer DEFAULT 0 CHECK (total_time_spent >= 0),
      completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
      completed boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT now(),
      CONSTRAINT learn_sessions_pkey PRIMARY KEY (id),
      CONSTRAINT learn_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
      CONSTRAINT learn_sessions_learn_section_id_fkey FOREIGN KEY (learn_section_id) REFERENCES public.learn_sections(id) ON DELETE CASCADE
    );
  `, 'Creating learn_sessions table')

  // Step 4: Create learn_interaction_details table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.learn_interaction_details (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      learn_session_id uuid NOT NULL,
      content_id text,
      interaction_type text NOT NULL CHECK (interaction_type = ANY (ARRAY['view'::text, 'scroll'::text, 'click'::text, 'pause'::text, 'resume'::text, 'complete'::text])),
      time_spent integer DEFAULT 0 CHECK (time_spent >= 0),
      engagement_score integer DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
      interaction_data jsonb,
      timestamp timestamp with time zone DEFAULT now(),
      CONSTRAINT learn_interaction_details_pkey PRIMARY KEY (id),
      CONSTRAINT learn_interaction_details_learn_session_id_fkey FOREIGN KEY (learn_session_id) REFERENCES public.learn_sessions(id) ON DELETE CASCADE
    );
  `, 'Creating learn_interaction_details table')

  // Step 5: Create learn_content_items table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.learn_content_items (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      learn_section_id uuid NOT NULL,
      content_type text NOT NULL CHECK (content_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'audio'::text, 'interactive'::text])),
      content_identifier text NOT NULL,
      content_title text,
      content_description text,
      estimated_time_minutes integer DEFAULT 5,
      content_order integer DEFAULT 1,
      created_at timestamp with time zone DEFAULT now(),
      CONSTRAINT learn_content_items_pkey PRIMARY KEY (id),
      CONSTRAINT learn_content_items_learn_section_id_fkey FOREIGN KEY (learn_section_id) REFERENCES public.learn_sections(id) ON DELETE CASCADE
    );
  `, 'Creating learn_content_items table')

  // Step 6: Create indexes for performance
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course ON public.quiz_attempts(user_id, quiz_section_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_start_time ON public.quiz_attempts(start_time);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempt_details_correct ON public.quiz_attempt_details(is_correct);
    
    CREATE INDEX IF NOT EXISTS idx_learn_sessions_user_section ON public.learn_sessions(user_id, learn_section_id);
    CREATE INDEX IF NOT EXISTS idx_learn_sessions_start_time ON public.learn_sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_learn_sessions_completion ON public.learn_sessions(completion_percentage);
    
    CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_session ON public.learn_interaction_details(learn_session_id);
    CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_type ON public.learn_interaction_details(interaction_type);
    CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_timestamp ON public.learn_interaction_details(timestamp);
    
    CREATE INDEX IF NOT EXISTS idx_learn_content_items_section ON public.learn_content_items(learn_section_id);
    CREATE INDEX IF NOT EXISTS idx_learn_content_items_type ON public.learn_content_items(content_type);
  `, 'Creating performance indexes')

  // Step 7: Create analytics views
  await executeSQL(`
    CREATE OR REPLACE VIEW student_quiz_analytics AS
    SELECT 
      u.id as user_id,
      u.username,
      u.learning_style_id,
      ls.name as learning_style,
      cs.course_id,
      c.course_name,
      qa.quiz_section_id,
      qa.start_time,
      qa.end_time,
      qa.score,
      EXTRACT(EPOCH FROM (qa.end_time - qa.start_time))/60 as duration_minutes,
      COUNT(qad.id) as total_questions,
      SUM(CASE WHEN qad.is_correct THEN 1 ELSE 0 END) as correct_answers,
      CASE WHEN COUNT(qad.id) > 0 THEN ROUND(AVG(qad.time_taken)) ELSE 0 END as avg_time_per_question
    FROM users u
    JOIN quiz_attempts qa ON u.id = qa.user_id
    LEFT JOIN quiz_attempt_details qad ON qa.id = qad.quiz_attempt_id
    LEFT JOIN quiz_sections qs ON qa.quiz_section_id = qs.id
    LEFT JOIN course_sections cs ON qs.course_section_id = cs.id
    LEFT JOIN courses c ON cs.course_id = c.id
    LEFT JOIN learning_styles ls ON u.learning_style_id = ls.id
    WHERE qa.end_time IS NOT NULL
    GROUP BY u.id, u.username, u.learning_style_id, ls.name, cs.course_id, c.course_name, qa.quiz_section_id, qa.start_time, qa.end_time, qa.score;
  `, 'Creating student_quiz_analytics view')

  await executeSQL(`
    CREATE OR REPLACE VIEW student_learn_analytics AS
    SELECT 
      u.id as user_id,
      u.username,
      u.learning_style_id,
      ls.name as learning_style,
      cs.course_id,
      c.course_name,
      lsec.id as learn_section_id,
      lsess.start_time,
      lsess.end_time,
      lsess.total_time_spent,
      lsess.completion_percentage,
      lsess.completed,
      COUNT(lid.id) as total_interactions,
      CASE WHEN COUNT(lid.id) > 0 THEN AVG(lid.engagement_score) ELSE 0 END as avg_engagement_score,
      COUNT(CASE WHEN lid.interaction_type = 'view' THEN 1 END) as view_interactions,
      COUNT(CASE WHEN lid.interaction_type = 'scroll' THEN 1 END) as scroll_interactions,
      COUNT(CASE WHEN lid.interaction_type = 'click' THEN 1 END) as click_interactions
    FROM users u
    JOIN learn_sessions lsess ON u.id = lsess.user_id
    LEFT JOIN learn_interaction_details lid ON lsess.id = lid.learn_session_id
    LEFT JOIN learn_sections lsec ON lsess.learn_section_id = lsec.id
    LEFT JOIN course_sections cs ON lsec.course_section_id = cs.id
    LEFT JOIN courses c ON cs.course_id = c.id
    LEFT JOIN learning_styles ls ON u.learning_style_id = ls.id
    WHERE lsess.end_time IS NOT NULL
    GROUP BY u.id, u.username, u.learning_style_id, ls.name, cs.course_id, c.course_name, 
             lsec.id, lsess.start_time, lsess.end_time, lsess.total_time_spent, 
             lsess.completion_percentage, lsess.completed;
  `, 'Creating student_learn_analytics view')

  console.log('\n🎉 Schema application completed!')
  console.log('\nYou can now:')
  console.log('1. Test quiz analytics by taking a quiz')
  console.log('2. Test learn analytics by viewing learn content')
  console.log('3. Check the admin analytics dashboard for all three types of data')
  console.log('\nRun: node check-database.js to verify all tables are created')
}

applyCompleteSchemas().catch(console.error)
