import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, IPBlocker } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rateLimiter'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Basic security checks (simplified)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  
  if (IPBlocker.isBlocked(ip)) {
    return new NextResponse('Access denied', { status: 403 })
  }
  
  const requestValidation = validateRequest(request)
  if (!requestValidation.isValid) {
    IPBlocker.reportSuspiciousActivity(ip)
    return new NextResponse('Invalid request', { status: 400 })
  }
  
  // Handle API routes with rate limiting
  if (request.nextUrl.pathname.startsWith('/api')) {
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
    
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime))
  }
  
  // Simplified authentication flow - remove complex fallbacks
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const authPaths = ['/auth/login', '/auth/register']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isProtectedPath || isAuthPath) {
    // Simplified cookie handling - use environment-appropriate cookie only
    const sessionCookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
    
    const sessionCookie = request.cookies.get(sessionCookieName)
    const hasValidSession = !!sessionCookie?.value
    
    // Simple redirect logic without complex fallbacks
    if (isProtectedPath && !hasValidSession) {
      // No session for protected route - redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (isAuthPath && hasValidSession && request.nextUrl.pathname === '/auth/login') {
      // Authenticated user accessing login - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Clean up conflicting environment cookies to prevent conflicts
    const conflictingCookieName = process.env.NODE_ENV === 'production' 
      ? 'next-auth.session-token' 
      : '__Secure-next-auth.session-token'
    
    const conflictingCookie = request.cookies.get(conflictingCookieName)
    if (conflictingCookie) {
      // Clear conflicting cookie silently
      response.cookies.delete(conflictingCookieName)
      
      // Also clear related cookies
      if (process.env.NODE_ENV === 'production') {
        response.cookies.delete('next-auth.callback-url')
        response.cookies.delete('next-auth.csrf-token')
      } else {
        response.cookies.delete('__Secure-next-auth.callback-url')
        response.cookies.delete('__Host-next-auth.csrf-token')
      }
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