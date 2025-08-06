import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

/**
 * Clean, Scalable JWT Authentication Configuration
 * Optimized for multi-user scaling and serverless deployment
 */
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
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        return null
                    }

                    // Return minimal user data for JWT
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.profile.firstName} ${user.profile.lastName}`,
                        role: user.role,
                        registrationId: user.registration.registrationId,
                        registrationStatus: user.registration.status
                    }
                } catch (error) {
                    // Minimal error logging in production
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Authentication error:', error)
                    }
                    return null
                }
            }
        })
    ],

    // Pure JWT strategy for stateless authentication
    session: {
        strategy: 'jwt' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        updateAge: 6 * 60 * 60, // 6 hours
    },

    // Optimized cookie configuration for environment isolation
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' 
                ? '__Secure-next-auth.session-token' 
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined, // Critical: no domain to prevent cross-device sharing
                maxAge: 7 * 24 * 60 * 60, // 7 days
            }
        },
        callbackUrl: {
            name: process.env.NODE_ENV === 'production' 
                ? '__Secure-next-auth.callback-url' 
                : 'next-auth.callback-url',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
                maxAge: 10 * 60 // 10 minutes for callback URLs
            }
        },
        csrfToken: {
            name: process.env.NODE_ENV === 'production' 
                ? '__Host-next-auth.csrf-token' 
                : 'next-auth.csrf-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
                maxAge: 10 * 60 // 10 minutes for CSRF tokens
            }
        }
    },

    callbacks: {
        async jwt({ token, user }) {
            // On initial sign in, store user data and create device fingerprint
            if (user) {
                token.id = user.id
                token.role = user.role
                token.registrationId = user.registrationId
                token.registrationStatus = user.registrationStatus
                
                // Simple device fingerprinting for session isolation
                const timestamp = Date.now()
                const randomId = Math.random().toString(36).substring(2, 15)
                const userPart = user.id.substring(0, 8)
                
                token.sessionId = `${userPart}_${timestamp}_${randomId}`
                token.deviceId = `dev_${timestamp}_${randomId}`
                token.loginTime = timestamp
                
                // Minimal logging for debugging
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔐 JWT session created:', {
                        userId: user.id,
                        sessionId: token.sessionId,
                        deviceId: token.deviceId
                    })
                }
            }
            
            return token
        },

        async session({ session, token }) {
            // Transfer data from JWT token to session
            if (token) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.registrationId = token.registrationId as string
                session.user.registrationStatus = token.registrationStatus as string
                
                // Add device isolation identifiers
                session.sessionId = token.sessionId as string
                session.deviceId = token.deviceId as string
                session.loginTime = token.loginTime as number
                session.lastValidated = Date.now()
            }
            
            return session
        },

        async signIn({ user, account }) {
            // Simple validation for credentials provider
            if (account?.provider === 'credentials') {
                return !!user
            }
            return true
        }
    },

    pages: {
        signIn: '/auth/login',
    },

    secret: process.env.NEXTAUTH_SECRET,
    
    // Disable debug in production for performance
    debug: process.env.NODE_ENV === 'development',
}