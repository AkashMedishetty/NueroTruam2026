import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
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

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.profile.firstName} ${user.profile.lastName}`,
                        role: user.role,
                        registrationId: user.registration.registrationId,
                        registrationStatus: user.registration.status
                    }
                } catch (error) {
                    console.error('Authentication error:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
        maxAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        maxAge: 24 * 60 * 60, // 24 hours
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined, // Prevent cross-subdomain sharing
            }
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
            }
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: undefined,
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
}