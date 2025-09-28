import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/security';
import { createPaidSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyStripeWebhook(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    console.log('✅ One-time payment completed for session:', session.id);
    
    if (session.mode === 'payment' && session.payment_status === 'paid') {
      console.log('🎉 One-time payment successful for session:', session.id);
      // Payment is complete - user can now upload file and get analysis
      // No need to create user accounts or sessions
    } else {
      console.error('❌ Not a payment checkout or payment not completed');
    }
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    console.log('✅ One-time payment succeeded:', paymentIntent.id);
    // Payment successful - user can proceed with file analysis
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    console.log('❌ One-time payment failed:', paymentIntent.id);
    // Handle failed payment
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}
