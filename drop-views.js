require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function dropViews() {
  try {
    console.log('🗑️  Dropping analytics views...');
    
    const viewsToRemove = [
      'student_test_analytics',
      'student_quiz_analytics'
    ];
    
    for (const viewName of viewsToRemove) {
      console.log(`Dropping view: ${viewName}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `DROP VIEW IF EXISTS ${viewName} CASCADE;`
      });
      
      if (error) {
        console.log(`❌ Error dropping ${viewName}:`, error.message);
      } else {
        console.log(`✅ Successfully dropped view: ${viewName}`);
      }
    }
    
    console.log('🎉 View cleanup complete!');
    console.log('📋 Note: All analytics APIs now use direct database queries instead of views.');
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

dropViews();
