import { NextRequest, NextResponse } from 'next/server';
import { createFreeSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    let email = null;
    
    // Try to get email from request, but don't require it
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      // No body or invalid JSON - that's fine for anonymous free sessions
    }

    // Create free user session (anonymous if no email)
    const sessionToken = await createFreeSession(email || 'anonymous@free.user');

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      plan: 'free',
      maxUsage: 3 
    });
    
    response.cookies.set('labwise_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
      // No domain restriction - works on any domain (Railway or custom)
    });

    return response;
  } catch (error) {
    console.error('Free session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create free session' },
      { status: 500 }
    );
  }
}
