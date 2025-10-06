import { NextResponse } from 'next/server';
import { testFetching } from '@/utils/testFetching';

export async function GET() {
  try {
    const result = await testFetching();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in test fetching:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
