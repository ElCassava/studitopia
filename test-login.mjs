// Test script to verify username/email login functionality
// Run this with: node test-login.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erozhukurioezrygpmtt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyb3podWt1cmlvZXpyeWdwbXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjY1NTQsImV4cCI6MjA3NDEwMjU1NH0.YxazZZleMGX-0J0PuhsExOiiervqtq8B14D3-pRtfIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin(usernameOrEmail, password) {
  console.log('🔍 Testing login for:', usernameOrEmail);
  
  // Test the new OR query logic
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .or(`username.ilike.${usernameOrEmail},email.ilike.${usernameOrEmail}`);

  console.log('📊 Query result:', { users, userError });
  
  if (!users || users.length === 0) {
    console.log('❌ No user found');
    return;
  }

  const user = users[0];
  console.log('✅ User found:', { 
    id: user.id, 
    username: user.username, 
    email: user.email 
  });
  
  // Test password verification
  if (user.password) {
    const isValidPassword = password === user.password;
    console.log('🔐 Password match:', isValidPassword);
  }
}

// Test with different login methods
console.log('=== Testing Username/Email Login ===');

// Test with username
await testLogin('student1', 'sun01');

// Test with email (if student1 has an email)
await testLogin('student1@example.com', 'sun01');

// Test with another user
await testLogin('student2', 'moon02');
await testLogin('student2@example.com', 'moon02');

console.log('\nDone!');
