import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY?.substring(0, 8) || 'not set',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_PRICE_ID: !!process.env.STRIPE_PRICE_ID,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      message: 'Stripe environment check',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug check failed' },
      { status: 500 }
    );
  }
}
