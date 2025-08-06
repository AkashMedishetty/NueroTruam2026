import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getAuthUrl } from '@/lib/auth-config'
import { logSessionLogin, logSessionError } from '@/lib/utils/session-monitor'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'credentials',
            type: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    await connectDB()

                    const user = await User.findOne({
                        email: credentials.email.toLowerCase(),
                        isActive: true
                    })

                    if (!user) {
                        console.log('Authentication failed: User not found or inactive', {
                            email: credentials.email.toLowerCase(),
                            timestamp: new Date().toISOString()
                        })
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        console.log('Authentication failed: Invalid password', {
                            email: credentials.email.toLowerCase(),
                            timestamp: new Date().toISOString()
                        })
                        return null
                    }

                    console.log('Authentication successful', {
                        email: user.email,
                        role: user.role,
                        registrationId: user.registration.registrationId,
                        timestamp: new Date().toISOString()
                    })

                    // Log successful authentication for monitoring
                    logSessionLogin(
                        user._id.toString(),
                        `temp_${Date.now()}`, // Temporary session ID, will be replaced in JWT callback
                        'unknown' // Device ID will be set in JWT callback
                    )

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.profile.firstName} ${user.profile.lastName}`,
                        role: user.role,
                        registrationId: user.registration.registrationId,
                        registrationStatus: user.registration.status
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                    console.error('Authentication error:', {
                        error: errorMessage,
                        stack: error instanceof Error ? error.stack : undefined,
                        email: credentials.email,
                        timestamp: new Date().toISOString()
                    })

                    // Log authentication error for monitoring
                    logSessionError(`Authentication failed: ${errorMessage}`, undefined, undefined)
                    
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days (match session maxAge)
        // Add error handling for JWT operations
        encode: async ({ secret, token, maxAge }) => {
            try {
                const { encode } = await import('next-auth/jwt')
                return await encode({ secret, token, maxAge })
            } catch (error) {
                console.error('🚨 JWT Encode Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    tokenKeys: token ? Object.keys(token) : [],
                    timestamp: new Date().toISOString()
                })
                throw error
            }
        },
        decode: async ({ secret, token }) => {
            try {
                const { decode } = await import('next-auth/jwt')
                return await decode({ secret, token })
            } catch (error) {
                console.error('🚨 JWT Decode Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    tokenLength: token?.length || 0,
                    tokenPreview: token?.substring(0, 50) + '...',
                    timestamp: new Date().toISOString()
                })
                // Return null instead of throwing to prevent cascading errors
                return null
            }
        }
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // Don't set domain for Vercel - let it default to the current domain
                domain: undefined
            }
        },
        callbackUrl: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined
            }
        },
        csrfToken: {
            name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined
            }
        }
    },
    callbacks: {
        async jwt({ token, user, account, trigger }) {
            try {
                if (user) {
                    token.role = user.role
                    token.registrationId = user.registrationId
                    token.registrationStatus = user.registrationStatus
                    
                    // Create a unique session identifier for this login
                    // Include timestamp and random component for uniqueness
                    const sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
                    token.sessionId = sessionId
                    token.deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36)
                    token.loginTime = Date.now()
                    
                    console.log('🔐 New JWT token created:', {
                        userId: user.id,
                        email: user.email,
                        sessionId,
                        deviceId: token.deviceId,
                        timestamp: new Date().toISOString()
                    })

                    // Update session monitor with actual session details
                    logSessionLogin(user.id, sessionId, token.deviceId)
                }
                
                // Add token validation - but don't return null as it breaks the type
                if (token.exp && typeof token.exp === 'number' && Date.now() / 1000 > token.exp) {
                    console.warn('⚠️ Token expired in JWT callback:', {
                        exp: token.exp,
                        now: Math.floor(Date.now() / 1000),
                        sessionId: token.sessionId
                    })
                    // Instead of returning null, create a minimal token that will be rejected elsewhere
                    return {
                        ...token,
                        expired: true,
                        exp: 0 // Set expiry to 0 to ensure it's treated as expired
                    }
                }
                
                return token
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('🚨 JWT Callback Error:', {
                    error: errorMessage,
                    trigger,
                    hasUser: !!user,
                    tokenKeys: token ? Object.keys(token) : [],
                    timestamp: new Date().toISOString()
                })

                // Log JWT callback error
                logSessionError(`JWT callback error: ${errorMessage}`, token?.sub, token?.sessionId as string)
                // Return the token as-is to prevent breaking the session
                return token
            }
        },
        async session({ session, token }) {
            try {
                if (token) {
                    session.user.id = token.sub!
                    session.user.role = token.role as string
                    session.user.registrationId = token.registrationId as string
                    session.user.registrationStatus = token.registrationStatus as string
                    
                    // Add session isolation identifiers
                    session.sessionId = token.sessionId as string
                    session.deviceId = token.deviceId as string
                    session.loginTime = token.loginTime as number
                    
                    // Add session validation timestamp
                    session.lastValidated = Date.now()
                }
                return session
            } catch (error) {
                console.error('🚨 Session Callback Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    hasToken: !!token,
                    tokenKeys: token ? Object.keys(token) : [],
                    timestamp: new Date().toISOString()
                })
                // Return session as-is to prevent breaking
                return session
            }
        },
        async signIn({ user, account, profile, email, credentials }) {
            // Allow multiple concurrent sessions for the same user on different devices
            return true
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Only enable debug in development
}