import { NextRequest, NextResponse } from 'next/server';
import { populateTestData } from '@/utils/populateTestData';

export async function POST() {
  try {
    console.log('API: Starting to populate test data...');
    const success = await populateTestData();
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Test data populated successfully!' });
    } else {
      console.log('API: populateTestData returned false');
      return NextResponse.json({ success: false, message: 'Failed to populate test data - check server logs' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error populating test data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error populating test data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
