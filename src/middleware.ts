import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './lib/auth';
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
      return NextResponse.json({ error: 'CORS: Origin not allowed' }, { status: 403 });
    }

    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await generalRateLimit.check(clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait before trying again.',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }
  }

  // Enhanced rate limiting for analysis endpoint
  if (pathname === '/api/analyze') {
    const analysisLimitResult = await analysisRateLimit.check(`${clientIP}:analyze`);
    if (!analysisLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Analysis rate limit exceeded. Please wait before analyzing another file.',
          resetTime: analysisLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // TEMPORARILY BYPASS AUTHENTICATION FOR TESTING PDF PROCESSING
    console.log('🧪 Authentication bypassed for PDF testing');
    
    /*
    // Verify authentication for analysis
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const authResult = await verifySession(token);
      if (!authResult.success || !authResult.session) {
        return NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        );
      }

      // Check usage limits for free users
      if (authResult.session.plan === 'free' && authResult.session.usageCount >= authResult.session.maxUsage) {
        return NextResponse.json(
          { error: 'Free tier limit reached. Please upgrade to continue.' },
          { status: 402 } // Payment Required
        );
      }

      // Add session info to request headers for API route
      response.headers.set('X-User-Session', JSON.stringify(authResult.session));
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 500 }
      );
    }
    */
  }

  // Protect app routes (except payment success)
  if (pathname.startsWith('/app')) {
    const searchParams = request.nextUrl.searchParams;
    const isPaymentSuccess = searchParams.get('payment') === 'success';
    
    // Allow payment success page to load without session
    if (isPaymentSuccess) {
      console.log('🎉 Payment success detected, allowing access to /app');
      return response;
    }
    
    const token = request.cookies.get('labwise_session')?.value;

    if (!token) {
      // Redirect to landing page
      console.log('❌ No session found, redirecting to landing page');
      return NextResponse.redirect(new URL('https://labwise.rialys.eu', request.url));
    }

    try {
      const authResult = await verifySession(token);
      if (!authResult.success) {
        // Clear invalid session and redirect
        const response = NextResponse.redirect(new URL('https://labwise.rialys.eu', request.url));
        response.cookies.delete('labwise_session');
        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('https://labwise.rialys.eu', request.url));
      response.cookies.delete('labwise_session');
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
