import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500, // 500 requests per window (increased for production)
};

// API routes that should be rate limited
const apiRoutes = ['/api'];

// Routes that should have stricter rate limiting
const strictRateLimitRoutes = ['/api/users/login', '/api/users/register'];

// Disable rate limiting in development for /api/auth/session
const isDevelopment = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    // Skip rate limiting for /api/auth/session in development
    if (isDevelopment && pathname === '/api/auth/session') {
      return NextResponse.next();
    }

    const ip = getClientIP(request.headers);
    const identifier = `${ip}:${pathname}`;

    // Stricter rate limiting for auth routes (except session in dev)
    const isStrictRoute = strictRateLimitRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const limit = isStrictRoute
      ? rateLimit(identifier, {
          ...rateLimitConfig,
          maxRequests: 100, // 100 requests per 15 minutes for auth (increased from 20)
        })
      : rateLimit(identifier, rateLimitConfig);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': String(limit.remaining),
            'X-RateLimit-Reset': String(limit.resetTime),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(limit.remaining));
    response.headers.set('X-RateLimit-Reset', String(limit.resetTime));

    return response;
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

