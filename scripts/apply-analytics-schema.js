#!/usr/bin/env node
/**
 * Script to apply analytics schema to the database
 * This script will run the analytics_schema.sql file against the Supabase database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyAnalyticsSchema() {
  try {
    console.log('📚 Reading analytics schema file...');
    
    const schemaPath = path.join(__dirname, '..', 'analytics_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Applying analytics schema to database...');
    
    // Split the SQL file by statements (rough parsing)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec', { sql: statement });
          
          if (error) {
            // Some errors are expected (like table already exists)
            if (error.message.includes('already exists')) {
              console.log(`   ⚠️  Statement ${i + 1}: ${error.message} (skipping)`);
            } else {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              console.error(`   Statement: ${statement.substring(0, 100)}...`);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`   ❌ Unexpected error in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ Analytics schema application completed');
    
    // Test if the new tables exist
    console.log('\n🔍 Verifying created tables...');
    
    const tables = ['quiz_questions', 'quiz_choices', 'quiz_attempt_details'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`   ✅ Table '${table}': exists and accessible`);
      }
    }
    
    // Test analytics views
    console.log('\n📊 Verifying analytics views...');
    
    const views = ['student_test_analytics', 'student_quiz_analytics'];
    for (const view of views) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ View '${view}': ${error.message}`);
        } else {
          console.log(`   ✅ View '${view}': exists and accessible`);
        }
      } catch (err) {
        console.log(`   ❌ View '${view}': ${err.message}`);
      }
    }
    
    console.log('\n🎉 Analytics schema setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to apply analytics schema:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyAnalyticsSchema();
