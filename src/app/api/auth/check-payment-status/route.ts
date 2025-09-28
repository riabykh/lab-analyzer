import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    console.log('🔍 Checking payment status for session:', sessionId);
    
    // Check if user now has a paid session
    const authResult = await getCurrentSession();
    
    if (authResult.success && authResult.session?.plan === 'plus') {
      console.log('✅ Paid session found for user');
      return NextResponse.json({ 
        sessionCreated: true,
        plan: authResult.session.plan,
        userId: authResult.session.userId
      });
    }
    
    console.log('⏳ No paid session found yet, webhook may still be processing');
    return NextResponse.json({ 
      sessionCreated: false,
      message: 'Webhook still processing'
    });
    
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
