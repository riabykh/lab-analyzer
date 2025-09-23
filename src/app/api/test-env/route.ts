import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: {
      openai_api_key_configured: !!process.env.OPENAI_API_KEY,
      openai_api_key_length: process.env.OPENAI_API_KEY?.length || 0,
      openai_model: process.env.OPENAI_MODEL || 'gpt-4o',
      node_env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      railway: !!process.env.RAILWAY_ENVIRONMENT
    }
  });
}
