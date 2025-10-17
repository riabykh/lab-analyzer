import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const timestamp = new Date().toISOString();
    
    // Check if OpenAI API key is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    // Check if JWT secret is configured
    const jwtConfigured = !!process.env.JWT_SECRET;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp,
      version: '2.0.0-b2b',
      services: {
        openai: openaiConfigured ? 'configured' : 'missing',
        jwt: jwtConfigured ? 'configured' : 'missing',
      },
      environment: process.env.NODE_ENV || 'development',
      model: 'B2B White-Label Platform',
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
