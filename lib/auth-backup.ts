import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { logSessionLogin, logSessionError } from '@/lib/utils/session-monitor'

export const authOptions: NextAuthOptions = {
    // Note: Cannot use adapter with CredentialsProvider - NextAuth v4 limitation
    // adapter: MongoDBAdapter(clientPromise),
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

    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // CRITICAL FIX: Don't set domain to prevent cross-device session sharing
                domain: undefined,
                // Enhanced session isolation with shorter max age to prevent conflicts
                maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 to prevent long-lived conflicts)
                // Add priority to ensure correct cookie is used
                priority: 'high'
            }
        },
        callbackUrl: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
                maxAge: 60 * 60 // 1 hour for callback URLs
            }
        },
        csrfToken: {
            name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
                maxAge: 60 * 60 // 1 hour for CSRF tokens
            }
        }
    },
    callbacks: {
        async jwt({ token, user, account }) {
            try {
                if (user) {
                    // Store user data in JWT token (required for CredentialsProvider)
                    token.id = user.id
                    token.role = user.role
                    token.registrationId = user.registrationId
                    token.registrationStatus = user.registrationStatus
                    
                    // Add unique session identifiers for device isolation (as per MULTI_USER_AUTH_SOLUTION.md)
                    const timestamp = Date.now()
                    const randomPart1 = Math.random().toString(36).substring(2, 15)
                    const randomPart2 = Math.random().toString(36).substring(2, 15)
                    const userPart = user.id.substring(0, 8)
                    
                    const sessionId = `jwt_${userPart}_${timestamp}_${randomPart1}_${randomPart2}`
                    token.sessionId = sessionId
                    token.deviceId = `dev_${timestamp}_${randomPart1}`
                    token.loginTime = timestamp
                    
                    console.log('🔐 JWT session created with device isolation:', {
                        userId: user.id,
                        email: user.email,
                        sessionId,
                        deviceId: token.deviceId,
                        timestamp: new Date().toISOString()
                    })
                    
                    // Log session creation
                    logSessionLogin(user.id, sessionId, token.deviceId)
                }
                return token
            } catch (error) {
                console.error('🚨 JWT Callback Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    hasUser: !!user,
                    timestamp: new Date().toISOString()
                })
                return token
            }
        },
        async session({ session, token }) {
            try {
                if (token) {
                    // Transfer data from JWT token to session (as per MULTI_USER_AUTH_SOLUTION.md)
                    session.user.id = token.id as string
                    session.user.role = token.role as string
                    session.user.registrationId = token.registrationId as string
                    session.user.registrationStatus = token.registrationStatus as string
                    
                    // Add device isolation identifiers
                    session.sessionId = token.sessionId as string
                    session.deviceId = token.deviceId as string
                    session.loginTime = token.loginTime as number
                    session.lastValidated = Date.now()
                    
                    // Reduce logging frequency in production to prevent spam
                    if (process.env.NODE_ENV === 'development' || Math.random() < 0.1) {
                        console.log('🔐 Session from JWT with device isolation:', {
                            userId: session.user.id,
                            email: session.user.email,
                            sessionId: session.sessionId,
                            deviceId: session.deviceId,
                            timestamp: new Date().toISOString()
                        })
                    }
                }
                return session
            } catch (error) {
                console.error('🚨 Session Callback Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    hasToken: !!token,
                    timestamp: new Date().toISOString()
                })
                return session
            }
        },
        async signIn({ user, account }) {
            try {
                // For credentials provider, user is already validated
                if (account?.provider === 'credentials') {
                    console.log('✅ JWT session sign-in successful (with device isolation):', {
                        userId: user.id,
                        email: user.email,
                        provider: account.provider,
                        timestamp: new Date().toISOString()
                    })
                    return true
                }
                return true
            } catch (error) {
                console.error('🚨 Sign-in callback error:', error)
                return false
            }
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Only enable debug in development
}