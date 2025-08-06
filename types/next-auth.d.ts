import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    sessionId: string
    deviceId: string
    loginTime: number
    lastValidated: number
    deviceIsolated: boolean
    deviceFingerprint: string
    user: {
      id: string
      email: string
      name: string
      role: string
      registrationId: string
      registrationStatus: string
    }
  }

  interface JWT {
    id: string
    role: string
    registrationId: string
    registrationStatus: string
    sessionId: string
    deviceId: string
    loginTime: number
    deviceIsolated: boolean
    deviceFingerprint: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    registrationId: string
    registrationStatus: string
  }
}