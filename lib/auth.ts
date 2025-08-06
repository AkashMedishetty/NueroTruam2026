import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getAuthUrl } from '@/lib/auth-config'
import { logSessionLogin, logSessionError } from '@/lib/utils/session-monitor'

// MongoDB client for NextAuth adapter
const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
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
        strategy: 'database' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
        generateSessionToken: () => {
            // Generate unique session tokens to prevent conflicts
            return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
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
                // CRITICAL FIX: Don't set domain to prevent cross-device session sharing
                domain: undefined,
                // Add session isolation with unique identifiers
                maxAge: 30 * 24 * 60 * 60 // 30 days
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
        async session({ session, user }) {
            try {
                if (user && session.user) {
                    // Get user data from database for accurate information
                    await connectDB()
                    const dbUser = await User.findById(user.id)
                    
                    if (dbUser) {
                        session.user.id = user.id
                        session.user.role = dbUser.role
                        session.user.registrationId = dbUser.registration.registrationId
                        session.user.registrationStatus = dbUser.registration.status
                        
                        // Add unique session identifiers for isolation
                        session.sessionId = `db_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
                        session.deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36)
                        session.loginTime = Date.now()
                        session.lastValidated = Date.now()
                        
                        console.log('🔐 Database session created:', {
                            userId: user.id,
                            email: session.user.email,
                            role: dbUser.role,
                            sessionId: session.sessionId,
                            timestamp: new Date().toISOString()
                        })
                        
                        // Log session creation
                        logSessionLogin(user.id, session.sessionId, session.deviceId)
                    }
                }
                return session
            } catch (error) {
                console.error('🚨 Database Session Callback Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    userId: user?.id,
                    timestamp: new Date().toISOString()
                })
                return session
            }
        },
        async signIn({ user, account, profile, email, credentials }) {
            try {
                // For credentials provider, user is already validated
                if (account?.provider === 'credentials') {
                    console.log('✅ Database session sign-in successful:', {
                        userId: user.id,
                        email: user.email,
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