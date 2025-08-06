import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // Get session using getServerSession
    const session = await getServerSession(authOptions)
    
    // Get token using getToken
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    })

    // Get all cookies
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('next-auth') || cookie.name.includes('nextauth')
    )

    // Environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
      hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasVERCEL_URL: !!process.env.VERCEL_URL,
      VERCEL_URL: process.env.VERCEL_URL
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: session ? {
        user: session.user,
        expires: session.expires,
        deviceId: (session as any).deviceId,
        loginTime: (session as any).loginTime
      } : null,
      token: token ? {
        sub: token.sub,
        role: token.role,
        deviceId: token.deviceId,
        loginTime: token.loginTime,
        exp: token.exp,
        iat: token.iat
      } : null,
      cookies: {
        total: cookies.length,
        authCookies: authCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      },
      environment: envInfo
    })
  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}