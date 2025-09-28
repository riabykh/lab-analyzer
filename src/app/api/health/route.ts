import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const timestamp = new Date().toISOString();
    
    // Check if OpenAI API key is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    // Check if Stripe is configured
    const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp,
      version: '1.0.0',
      services: {
        openai: openaiConfigured ? 'configured' : 'missing',
        stripe: stripeConfigured ? 'configured' : 'missing',
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
