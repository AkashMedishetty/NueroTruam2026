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
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Authentication failed: User not found or inactive', {
                                email: credentials.email.toLowerCase(),
                                timestamp: new Date().toISOString()
                            })
                        }
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Authentication failed: Invalid password', {
                                email: credentials.email.toLowerCase(),
                                timestamp: new Date().toISOString()
                            })
                        }
                        return null
                    }

                    // Minimal logging for successful authentication
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Authentication successful', {
                            email: user.email,
                            role: user.role,
                            registrationId: user.registration.registrationId,
                            timestamp: new Date().toISOString()
                        })
                    }

                    // Simplified session tracking
                    logSessionLogin(
                        user._id.toString(),
                        `temp_${Date.now()}`,
                        'unknown'
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
        maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for better security)
        updateAge: 4 * 60 * 60, // 4 hours (reduced for more frequent updates)
    },

    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined, // Prevent cross-domain sharing
                maxAge: 24 * 60 * 60, // 24 hours
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
                maxAge: 30 * 60 // 30 minutes for callback URLs
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
                maxAge: 30 * 60 // 30 minutes for CSRF tokens
            }
        }
    },
    callbacks: {
        async jwt({ token, user }) {
            try {
                if (user) {
                    // Store user data in JWT token (required for CredentialsProvider)
                    token.id = user.id
                    token.role = user.role
                    token.registrationId = user.registrationId
                    token.registrationStatus = user.registrationStatus
                    
                    // Simplified device/session identification for scaling
                    const timestamp = Date.now()
                    const randomId = Math.random().toString(36).substring(2, 15)
                    
                    token.sessionId = `jwt_${user.id.substring(0, 8)}_${timestamp}_${randomId}`
                    token.deviceId = `dev_${timestamp}_${randomId}`
                    token.loginTime = timestamp
                    
                    // Minimal logging for production performance
                    if (process.env.NODE_ENV === 'development') {
                        console.log('JWT session created:', {
                            userId: user.id,
                            sessionId: token.sessionId,
                            timestamp: new Date().toISOString()
                        })
                    }
                    
                    // Simplified session logging
                    logSessionLogin(user.id, token.sessionId, token.deviceId)
                }
                return token
            } catch (error) {
                console.error('JWT Callback Error:', error instanceof Error ? error.message : 'Unknown error')
                return token
            }
        },
        async session({ session, token }) {
            try {
                if (token) {
                    // Transfer data from JWT token to session
                    session.user.id = token.id as string
                    session.user.role = token.role as string
                    session.user.registrationId = token.registrationId as string
                    session.user.registrationStatus = token.registrationStatus as string
                    
                    // Add session identifiers
                    session.sessionId = token.sessionId as string
                    session.deviceId = token.deviceId as string
                    session.loginTime = token.loginTime as number
                    session.lastValidated = Date.now()
                }
                return session
            } catch (error) {
                console.error('Session Callback Error:', error instanceof Error ? error.message : 'Unknown error')
                return session
            }
        },
        async signIn({ user, account }) {
            try {
                // For credentials provider, user is already validated
                if (account?.provider === 'credentials') {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('JWT sign-in successful:', {
                            userId: user.id,
                            email: user.email,
                            timestamp: new Date().toISOString()
                        })
                    }
                    return true
                }
                return true
            } catch (error) {
                console.error('Sign-in callback error:', error)
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