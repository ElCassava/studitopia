import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not defined");
}
if (!supabaseKey) {
  throw new Error("SUPABASE_ANON_KEY environment variable is not defined");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export function getSupabaseClient() {
  return supabase;
}
