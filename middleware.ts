import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders, validateRequest, IPBlocker } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rateLimiter'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get IP address for security checks
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  
  // Check if IP is blocked
  if (IPBlocker.isBlocked(ip)) {
    return new NextResponse('Access denied', { status: 403 })
  }
  
  // Validate request for suspicious patterns
  const requestValidation = validateRequest(request)
  if (!requestValidation.isValid) {
    IPBlocker.reportSuspiciousActivity(ip)
    return new NextResponse('Invalid request', { status: 400 })
  }
  
  // Temporarily disabled security headers for debugging - RE-ENABLE AFTER TESTING
  // addSecurityHeaders(response)
  
  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Apply rate limiting to API routes
    const rateLimitResult = await apiRateLimit(request)
    
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          }
        }
      )
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime))
  }
  
  // Handle protected routes
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath) {
    // Prevent redirect loops - if coming from login, don't redirect back
    const referer = request.headers.get('referer')
    const isFromLogin = referer?.includes('/auth/login')
    
    // For database sessions, we'll let NextAuth handle session validation
    // The middleware will only handle basic route protection
    const sessionCookie = request.cookies.get(
      process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    )
    
    console.log(`🔍 Middleware session check for ${request.nextUrl.pathname}:`, {
      hasSessionCookie: !!sessionCookie,
      isFromLogin,
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
      cookies: request.cookies.getAll().map(c => c.name)
    })
    
    if (!sessionCookie && !isFromLogin) {
      // Redirect to login for protected routes (only if not coming from login)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      console.log(`🔄 Middleware redirecting to login: ${request.nextUrl.pathname}`)
      return NextResponse.redirect(loginUrl)
    } else if (!sessionCookie && isFromLogin) {
      // If no session cookie and coming from login, allow a brief grace period
      console.warn('🚫 No session cookie found but coming from login - allowing access')
      // Don't block immediately, let the page handle authentication
      return response
    }
    
    // For admin routes, we'll let the page components handle role checking
    // since we can't easily decode the session token in middleware with database sessions
  }
  
  // Handle auth routes when already logged in
  const authPaths = ['/auth/login']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isAuthPath) {
    // Prevent redirect loops - if coming from dashboard, don't redirect back
    const referer = request.headers.get('referer')
    const isFromDashboard = referer?.includes('/dashboard')
    
    // Check for session cookie
    const sessionCookie = request.cookies.get(
      process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    )
    
    if (sessionCookie && !isFromDashboard) {
      // Redirect to dashboard if already logged in (only if not coming from dashboard)
      console.log(`🔄 Middleware redirecting authenticated user to dashboard from login`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else if (sessionCookie && isFromDashboard) {
      // If authenticated and coming from dashboard, allow login page (user might want to switch accounts)
      console.log('ℹ️ Allowing authenticated user to access login (from dashboard)')
    }
  }
  
  return response
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
}