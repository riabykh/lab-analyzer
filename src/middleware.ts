import { NextRequest, NextResponse } from 'next/server';
import { verifyPatientSession } from './lib/b2b-auth';
import { RateLimiter, getSecurityHeaders } from './lib/security';

// Initialize rate limiters
const generalRateLimit = new RateLimiter(60000, 20, 300000); // 20 req/min, 5min block
const analysisRateLimit = new RateLimiter(60000, 5, 300000); // 5 req/min, 5min block

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIP = (request as any).ip || 'unknown';

  // Apply security headers
  const securityHeaders = getSecurityHeaders();
  const response = NextResponse.next();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://labwise.rialys.eu',
      'https://app.labwise.rialys.eu',
      'http://localhost:3000', // Development
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(null, { status: 403 });
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Set CORS headers for actual requests
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Rate limiting
  if (pathname.startsWith('/api/')) {
    // General API rate limiting
    const generalCheck = await generalRateLimit.check(clientIP);
    if (!generalCheck.success) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Specific rate limiting for analysis endpoints
    if (pathname === '/api/analyze') {
      const analysisCheck = await analysisRateLimit.check(clientIP);
      if (!analysisCheck.success) {
        console.log(`🚫 Analysis rate limit exceeded for IP: ${clientIP}`);
        return NextResponse.json(
          { error: 'Too many analysis requests. Please wait before trying again.' },
          { status: 429 }
        );
      }
    }
  }

  // Protect dashboard routes for B2B model
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('patient_session')?.value;

    if (!token) {
      // Redirect to login page
      console.log('❌ No patient session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const authResult = await verifyPatientSession(token);
      if (!authResult.success) {
        // Clear invalid session and redirect
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('patient_session');
        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('patient_session');
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};