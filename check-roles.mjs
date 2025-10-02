// Check user roles
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://erozhukurioezrygpmtt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyb3podWt1cmlvZXpyeWdwbXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjY1NTQsImV4cCI6MjA3NDEwMjU1NH0.YxazZZleMGX-0J0PuhsExOiiervqtq8B14D3-pRtfIU'
);

const { data } = await supabase.from('users').select('username, role').limit(10);
console.log('Sample users and roles:', data);

// Check distinct roles
const { data: roles } = await supabase.from('users').select('role').limit(100);
const uniqueRoles = [...new Set(roles?.map(r => r.role))];
console.log('Available roles:', uniqueRoles);
