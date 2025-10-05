const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySchemas() {
  console.log('Attempting to apply analytics schemas...')
  
  // Try to run basic SQL operations first
  try {
    console.log('1. Checking if we can create the quiz_questions table...')
    const createQuizQuestions = `
      CREATE TABLE IF NOT EXISTS public.quiz_questions (
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
    `
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: createQuizQuestions })
    
    if (error) {
      console.log('❌ Cannot execute DDL with publishable key:', error.message)
      console.log('\n🔑 You need to get your SUPABASE_SERVICE_ROLE_KEY to apply database schemas.')
      console.log('\nSteps to get your service role key:')
      console.log('1. Go to https://supabase.com/dashboard/project/erozhukurioezrygpmtt/settings/api')
      console.log('2. Under "Project API keys", copy the "service_role" key')
      console.log('3. Add it to your .env.local file:')
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
      console.log('4. Run this script again')
      return false
    }
    
    console.log('✅ Success! DDL operations are possible.')
    return true
    
  } catch (err) {
    console.log('❌ Error:', err.message)
    return false
  }
}

applySchemas()
