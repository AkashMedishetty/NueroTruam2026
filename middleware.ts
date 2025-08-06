import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
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
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token && !isFromLogin) {
      // Redirect to login for protected routes (only if not coming from login)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      console.log(`🔄 Middleware redirecting to login: ${request.nextUrl.pathname}`)
      return NextResponse.redirect(loginUrl)
    } else if (!token && isFromLogin) {
      // If no token and coming from login, show error page instead of redirect
      console.warn('🚫 Potential login loop detected - blocking redirect')
      return new NextResponse('Authentication required', { 
        status: 401,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Check admin routes
    if (token && request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
      return new NextResponse('Access denied', { status: 403 })
    }
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
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (token && !isFromDashboard) {
      // Redirect to dashboard if already logged in (only if not coming from dashboard)
      console.log(`🔄 Middleware redirecting authenticated user to dashboard from login`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else if (token && isFromDashboard) {
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