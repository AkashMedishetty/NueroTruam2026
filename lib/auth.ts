import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getAuthUrl } from '@/lib/auth-config'

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

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.profile.firstName} ${user.profile.lastName}`,
                        role: user.role,
                        registrationId: user.registration.registrationId,
                        registrationStatus: user.registration.status
                    }
                } catch (error) {
                    console.error('Authentication error:', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        email: credentials.email,
                        timestamp: new Date().toISOString()
                    })
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
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role
                token.registrationId = user.registrationId
                token.registrationStatus = user.registrationStatus
                
                // Add device/session identifier to prevent cross-device session sharing
                token.deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36)
                token.loginTime = Date.now()
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.user.role = token.role as string
                session.user.registrationId = token.registrationId as string
                session.user.registrationStatus = token.registrationStatus as string
                
                // Add device identifier to session for validation
                session.deviceId = token.deviceId as string
                session.loginTime = token.loginTime as number
            }
            return session
        },
        async signIn({ user, account, profile, email, credentials }) {
            // Always allow sign in, but each device gets a unique session
            return true
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Only enable debug in development
}