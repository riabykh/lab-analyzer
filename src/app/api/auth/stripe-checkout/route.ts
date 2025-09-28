import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { plan, success_url, cancel_url } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': success_url,
        'cancel_url': cancel_url,
        'line_items[0][price]': process.env.STRIPE_PRICE_ID || '',
        'line_items[0][quantity]': '1',
        'allow_promotion_codes': 'true',
        'billing_address_collection': 'required',
        'customer_creation': 'always',
        'metadata[plan]': plan,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const session = await response.json();
    return NextResponse.json({ id: session.id, url: session.url });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
