import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './src/lib/auth';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function isRateLimited(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIP = request.ip || 'unknown';

  // Security headers for all requests
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
    if (isRateLimited(clientIP, 20, 60000)) { // 20 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before trying again.' },
        { status: 429 }
      );
    }
  }

  // Enhanced rate limiting for analysis endpoint
  if (pathname === '/api/analyze') {
    if (isRateLimited(`${clientIP}:analyze`, 5, 60000)) { // 5 analysis per minute
      return NextResponse.json(
        { error: 'Analysis rate limit exceeded. Please wait before analyzing another file.' },
        { status: 429 }
      );
    }

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
  }

  // Protect app routes
  if (pathname.startsWith('/app')) {
    const token = request.cookies.get('labwise_session')?.value;

    if (!token) {
      // Redirect to landing page
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
