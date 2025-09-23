import { NextRequest, NextResponse } from 'next/server';
import { createFreeSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing auth flow...');
    
    // Test session creation
    const sessionToken = await createFreeSession('test@example.com');
    console.log('✅ Session token created:', sessionToken ? 'Success' : 'Failed');
    
    return NextResponse.json({
      success: true,
      hasToken: !!sessionToken,
      tokenLength: sessionToken?.length || 0,
      jwtSecret: !!process.env.JWT_SECRET ? 'Configured' : 'Using fallback',
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
