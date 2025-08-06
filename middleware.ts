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
    // Enhanced redirect loop prevention
    const referer = request.headers.get('referer')
    const isFromLogin = referer?.includes('/auth/login')
    const isFromDashboard = referer?.includes('/dashboard')
    
    // Check for both development and production session cookies to handle conflicts
    const devSessionCookie = request.cookies.get('next-auth.session-token')
    const prodSessionCookie = request.cookies.get('__Secure-next-auth.session-token')
    const hasAnySessionCookie = !!(devSessionCookie || prodSessionCookie)
    
    // Get the correct session cookie for current environment
    const sessionCookie = process.env.NODE_ENV === 'production' ? prodSessionCookie : devSessionCookie
    
    // Minimal logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Middleware: ${request.nextUrl.pathname} - Session: ${!!sessionCookie}`)
    }
    
    // Simple redirect loop prevention
    const refererPath = referer ? new URL(referer).pathname : ''
    if (refererPath === request.nextUrl.pathname) {
      // Prevent immediate redirect loops
      return response
    }
    
    if (!sessionCookie && !isFromLogin && !isFromDashboard) {
      // Only redirect to login if we have no session and aren't coming from auth pages
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      
      return NextResponse.redirect(loginUrl)
    } else if (!sessionCookie && (isFromLogin || isFromDashboard)) {
      // If no session cookie but coming from auth pages, allow brief grace period
      console.warn('🚫 No session cookie found but coming from auth page - allowing access with grace period')
      return response
    } else if (hasAnySessionCookie && !sessionCookie) {
      // Handle cookie conflicts - clear conflicting cookies
      console.warn('🔧 Cookie conflict detected, clearing conflicting session cookies')
      const cleanupResponse = NextResponse.next()
      
      // Clear the wrong environment's cookies
      if (process.env.NODE_ENV === 'production' && devSessionCookie) {
        cleanupResponse.cookies.delete('next-auth.session-token')
        cleanupResponse.cookies.delete('next-auth.callback-url')
        cleanupResponse.cookies.delete('next-auth.csrf-token')
      } else if (process.env.NODE_ENV !== 'production' && prodSessionCookie) {
        cleanupResponse.cookies.delete('__Secure-next-auth.session-token')
        cleanupResponse.cookies.delete('__Secure-next-auth.callback-url')
        cleanupResponse.cookies.delete('__Host-next-auth.csrf-token')
      }
      
      return cleanupResponse
    }
    
    // For admin routes, we'll let the page components handle role checking
    // since we can't easily decode the session token in middleware with JWT sessions
  }
  
  // Handle auth routes when already logged in
  const authPaths = ['/auth/login']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isAuthPath) {
    // Enhanced redirect loop prevention for auth pages
    const referer = request.headers.get('referer')
    const isFromDashboard = referer?.includes('/dashboard')
    const isFromLogin = referer?.includes('/auth/login')
    
    // Check for both development and production session cookies
    const devSessionCookie = request.cookies.get('next-auth.session-token')
    const prodSessionCookie = request.cookies.get('__Secure-next-auth.session-token')
    const sessionCookie = process.env.NODE_ENV === 'production' ? prodSessionCookie : devSessionCookie
    
    // Simple auth page redirect prevention
    if (isFromDashboard && sessionCookie) {
      // Allow access to login from dashboard (user might want to switch accounts)
      return response
    }
    
    if (sessionCookie && !isFromDashboard && !isFromLogin) {
      // Only redirect to dashboard if we have a session and aren't coming from dashboard/login
      console.log(`🔄 Middleware redirecting authenticated user to dashboard from login`)
      
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else if (sessionCookie && (isFromDashboard || isFromLogin)) {
      // If authenticated and coming from dashboard/login, allow login page access
      console.log('ℹ️ Allowing authenticated user to access login (from dashboard/login)')
    }
    
    // Handle cookie conflicts on login page too
    if ((devSessionCookie || prodSessionCookie) && !sessionCookie) {
      console.warn('🔧 Cookie conflict on login page, cleaning up')
      const cleanupResponse = NextResponse.next()
      
      if (process.env.NODE_ENV === 'production' && devSessionCookie) {
        cleanupResponse.cookies.delete('next-auth.session-token')
        cleanupResponse.cookies.delete('next-auth.callback-url')
        cleanupResponse.cookies.delete('next-auth.csrf-token')
      } else if (process.env.NODE_ENV !== 'production' && prodSessionCookie) {
        cleanupResponse.cookies.delete('__Secure-next-auth.session-token')
        cleanupResponse.cookies.delete('__Secure-next-auth.callback-url')
        cleanupResponse.cookies.delete('__Host-next-auth.csrf-token')
      }
      
      return cleanupResponse
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