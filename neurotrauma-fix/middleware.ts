import { withAuth } from "next-auth/middleware" 
import { NextResponse } from "next/server" 
import type { NextRequest } from "next/server" 

export default withAuth( 
  function middleware(req: NextRequest) { 
    const response = NextResponse.next() 
    
    // Prevent ALL caching for authenticated routes 
    if (req.nextUrl.pathname.startsWith('/dashboard') || 
        req.nextUrl.pathname.startsWith('/admin') || 
        req.nextUrl.pathname.startsWith('/profile')) { 
      
      response.headers.set( 
        'Cache-Control', 
        'private, no-cache, no-store, max-age=0, must-revalidate' 
      ) 
      response.headers.set('Pragma', 'no-cache') 
      response.headers.set('Expires', '0') 
      response.headers.set('Surrogate-Control', 'no-store') 
      
      // Ensure cookies are properly scoped 
      response.headers.set('Vary', 'Cookie') 
    } 
    
    return response 
  }, 
  { 
    callbacks: { 
      authorized: ({ token }) => !!token 
    }, 
  } 
) 

export const config = { 
  matcher: [ 
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/profile/:path*' 
  ] 
}