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

    console.log('🎉 One-time payment verified for session:', sessionId);

    // For one-time payment model, we don't create user accounts
    // Just verify payment and allow file upload
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified - ready for file analysis',
      sessionId: sessionId,
      paymentStatus: 'paid'
    });

  } catch (error) {
    console.error('❌ Premium activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate premium account' },
      { status: 500 }
    );
  }
}
