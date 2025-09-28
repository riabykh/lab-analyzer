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
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
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
    console.log('✅ Checkout completed for session:', session.id);
    
    if (session.mode === 'subscription' && session.subscription) {
      // Create paid user session
      const email = session.customer_details?.email || session.customer_email;
      if (email) {
        console.log('🔄 Creating paid session for email:', email);
        const sessionToken = await createPaidSession(email, session.subscription);
        console.log('🎉 Created paid session token for:', email);
        
        // Store session info for later retrieval
        // Note: In a real app, you'd store this in a database
        // For now, we'll rely on the session token being available
      } else {
        console.error('❌ No email found in checkout session');
      }
    } else {
      console.error('❌ Not a subscription checkout or missing subscription ID');
    }
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Subscription created:', subscription.id);
    // Additional subscription creation logic here
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Subscription updated:', subscription.id);
    // Handle subscription updates (plan changes, etc.)
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Subscription deleted:', subscription.id);
    // Handle subscription cancellation
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    console.log('Payment succeeded for invoice:', invoice.id);
    // Handle successful payment
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    console.log('Payment failed for invoice:', invoice.id);
    // Handle failed payment
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
