import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/common/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Username and password are required' 
      }, { status: 400 });
    }

    const result = await login(username, password);
    
    if (result.error) {
      return NextResponse.json({ 
        success: false, 
        message: result.error.message 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: result.user 
    });

  } catch (error) {
    console.error('API Error during login:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Login failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
