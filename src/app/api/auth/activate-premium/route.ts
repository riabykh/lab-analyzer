import { NextRequest, NextResponse } from 'next/server';
import { createPaidSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email } = await request.json();
    
    console.log('🔄 Activating premium for session:', sessionId, 'email:', email);
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Verify the Stripe session was successful
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get session details from Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    if (!stripeResponse.ok) {
      console.error('❌ Failed to verify Stripe session');
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 400 }
      );
    }

    const stripeSession = await stripeResponse.json();
    console.log('✅ Stripe session verified:', stripeSession.payment_status);

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Create premium session
    const userEmail = email || stripeSession.customer_details?.email || 'premium@user.com';
    const sessionToken = await createPaidSession(userEmail, stripeSession.subscription || sessionId);
    
    console.log('🎉 Created premium session for:', userEmail);

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('labwise_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Premium account activated',
      email: userEmail
    });

  } catch (error) {
    console.error('❌ Premium activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate premium account' },
      { status: 500 }
    );
  }
}
