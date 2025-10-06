import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/common/network';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('Adding missing columns to test_attempt_details table...');
    
    // Check current table structure first
    const { data: currentColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'test_attempt_details')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (checkError) {
      console.error('Error checking current table structure:', checkError);
    } else {
      console.log('Current test_attempt_details columns:', currentColumns);
    }
    
    // Note: Direct DDL operations are not possible through Supabase client
    // The answered_at column needs to be added via SQL directly in the database
    
    console.log('⚠️ Column addition requires direct database access');
    console.log('Please run this SQL in your database:');
    console.log('ALTER TABLE public.test_attempt_details ADD COLUMN IF NOT EXISTS answered_at timestamp with time zone DEFAULT now();');
    
    return NextResponse.json({
      success: true,
      message: 'Schema fix required - see logs for SQL to run',
      currentColumns: currentColumns || [],
      sqlToRun: 'ALTER TABLE public.test_attempt_details ADD COLUMN IF NOT EXISTS answered_at timestamp with time zone DEFAULT now();'
    });
    
  } catch (error) {
    console.error('Error updating table structure:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
