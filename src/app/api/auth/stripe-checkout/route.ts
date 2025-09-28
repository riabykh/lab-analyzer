import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Stripe checkout API called');
    
    const { plan, success_url, cancel_url } = await request.json();
    console.log('📋 Request data:', { plan, success_url, cancel_url });
    
    const finalSuccessUrl = `${success_url}&session_id={CHECKOUT_SESSION_ID}`;
    console.log('🎯 Final success URL being sent to Stripe:', finalSuccessUrl);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Stripe not configured - missing STRIPE_SECRET_KEY' },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      console.error('❌ Stripe price ID not configured');
      return NextResponse.json(
        { error: 'Stripe not configured - missing STRIPE_PRICE_ID' },
        { status: 500 }
      );
    }

    console.log('✅ Stripe configuration check passed');

    // Create Stripe checkout session
    console.log('📡 Creating Stripe checkout session...');
    
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': finalSuccessUrl,
        'cancel_url': cancel_url,
        'line_items[0][price]': process.env.STRIPE_PRICE_ID || '',
        'line_items[0][quantity]': '1',
        'allow_promotion_codes': 'true',
        'billing_address_collection': 'required',
        'metadata[plan]': plan,
      }),
    });

    console.log('📊 Stripe API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Stripe API error:', error);
      return NextResponse.json(
        { error: `Failed to create checkout session: ${error}` },
        { status: response.status }
      );
    }

    const session = await response.json();
    console.log('✅ Stripe session created:', session.id);
    
    return NextResponse.json({ id: session.id, url: session.url });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
