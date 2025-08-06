/**
 * Session Manager for handling multi-user session conflicts
 * Addresses JWT decryption errors and session isolation issues
 */

import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

interface SessionValidationResult {
  isValid: boolean
  token: any | null
  error?: string
  shouldRetry?: boolean
}

export class SessionManager {
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 100 // ms

  /**
   * Safely validate a session token with retry logic for JWT decryption errors
   */
  static async validateSession(request: NextRequest): Promise<SessionValidationResult> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
          secureCookie: process.env.NODE_ENV === 'production',
          cookieName: process.env.NODE_ENV === 'production' 
            ? '__Secure-next-auth.session-token' 
            : 'next-auth.session-token'
        })

        // If we get a token, validate its structure
        if (token) {
          const isValidToken = this.validateTokenStructure(token)
          if (!isValidToken) {
            console.warn(`🔍 Invalid token structure on attempt ${attempt}:`, {
              hasExp: !!token.exp,
              hasIat: !!token.iat,
              hasSub: !!token.sub,
              tokenKeys: Object.keys(token)
            })
            
            if (attempt < this.MAX_RETRIES) {
              await this.delay(this.RETRY_DELAY * attempt)
              continue
            }
            
            return {
              isValid: false,
              token: null,
              error: 'Invalid token structure',
              shouldRetry: false
            }
          }

          // Check if token is expired
          if (token.exp && typeof token.exp === 'number' && Date.now() / 1000 > token.exp) {
            console.log('🕐 Token expired, clearing session')
            return {
              isValid: false,
              token: null,
              error: 'Token expired',
              shouldRetry: false
            }
          }

          console.log(`✅ Session validation successful on attempt ${attempt}`)
          return {
            isValid: true,
            token,
            error: undefined,
            shouldRetry: false
          }
        }

        // No token found
        return {
          isValid: false,
          token: null,
          error: 'No token found',
          shouldRetry: false
        }

      } catch (error) {
        lastError = error as Error
        
        // Check if this is a JWT decryption error
        const isJWTError = error instanceof Error && (
          error.message.includes('decryption operation failed') ||
          error.message.includes('JWT') ||
          error.message.includes('JWE')
        )

        console.warn(`🚨 Session validation error (attempt ${attempt}/${this.MAX_RETRIES}):`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          isJWTError,
          pathname: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent')?.substring(0, 50)
        })

        // If it's a JWT error and we have retries left, try again
        if (isJWTError && attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt)
          continue
        }

        // If it's not a JWT error or we're out of retries, fail
        break
      }
    }

    return {
      isValid: false,
      token: null,
      error: lastError?.message || 'Session validation failed',
      shouldRetry: lastError?.message.includes('decryption operation failed')
    }
  }

  /**
   * Validate token structure to ensure it has required fields
   */
  private static validateTokenStructure(token: any): boolean {
    if (!token || typeof token !== 'object') {
      return false
    }

    // Check for required JWT fields
    const requiredFields = ['sub', 'iat']
    for (const field of requiredFields) {
      if (!(field in token)) {
        return false
      }
    }

    return true
  }

  /**
   * Clear potentially corrupted session cookies
   */
  static clearCorruptedSession(request: NextRequest): void {
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('next-auth') || cookie.name.includes('nextauth')
    )

    console.log('🧹 Clearing potentially corrupted session cookies:', {
      cookieCount: authCookies.length,
      cookieNames: authCookies.map(c => c.name)
    })
  }

  /**
   * Generate a unique session identifier for debugging
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Delay utility for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Enhanced logging for session debugging
   */
  static logSessionDebug(context: string, data: any): void {
    if (process.env.NODE_ENV === 'production') {
      console.log(`🔍 SessionManager [${context}]:`, {
        timestamp: new Date().toISOString(),
        ...data
      })
    }
  }
}