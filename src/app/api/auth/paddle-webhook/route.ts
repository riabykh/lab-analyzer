import { NextRequest, NextResponse } from 'next/server';
import { createPaidSession } from '@/lib/auth';

// Verify Paddle webhook signature
function verifyPaddleSignature(body: string, signature: string): boolean {
  // In production, implement proper Paddle signature verification
  // For now, basic check if signature exists
  return !!signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');

    // Verify webhook signature
    if (!signature || !verifyPaddleSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = new URLSearchParams(body);
    const alertName = data.get('alert_name');

    if (alertName === 'subscription_payment_succeeded' || alertName === 'subscription_created') {
      const email = data.get('email');
      const subscriptionId = data.get('subscription_id');

      if (!email || !subscriptionId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Create paid user session
      const sessionToken = await createPaidSession(email, subscriptionId);

      // Store session for redirect
      const response = NextResponse.json({ success: true });
      response.cookies.set('labwise_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        domain: '.labwise.rialys.eu'
      });

      return response;
    }

    if (alertName === 'subscription_cancelled') {
      // Handle subscription cancellation
      const subscriptionId = data.get('subscription_id');
      
      // In production, mark subscription as cancelled in database
      console.log(`Subscription cancelled: ${subscriptionId}`);
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Paddle sends GET requests to verify webhook endpoints
export async function GET() {
  return NextResponse.json({ status: 'webhook_endpoint_active' });
}
