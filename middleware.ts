import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logAuthError } from './lib/utils/auth-debug'

// Protected routes that require authentication
export const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/user'
]

// Auth routes that should not be accessed when logged in
export const authRoutes = [
  '/auth/login',
  '/auth/register'
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Enhanced cache control for auth-related routes
  const response = NextResponse.next()
  
  // More aggressive cache control for auth and API routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth') || pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('Vary', 'Cookie, Authorization')
  } else {
    // Less aggressive caching for static content
    response.headers.set('Cache-Control', 'no-cache, must-revalidate')
  }

  // Prevent redirect loops with more comprehensive checks
  const redirectCount = parseInt(searchParams.get('redirectCount') || '0')
  if (redirectCount > 3) {
    logAuthError(new Error('Redirect loop detected'), 'MIDDLEWARE', { pathname })
    return NextResponse.redirect(new URL('/auth/error?error=RedirectLoop', request.url))
  }

  // Handle auth routes
  if (authRoutes.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', encodeURI(request.url))
      loginUrl.searchParams.set('redirectCount', (redirectCount + 1).toString())
      return NextResponse.redirect(loginUrl)
    }
  }

  // Clear conflicting cookies if present
  const cookies = request.cookies
  if (cookies.has('legacy-session') || cookies.has('conflicting-cookie')) {
    response.cookies.delete('legacy-session')
    response.cookies.delete('conflicting-cookie')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}