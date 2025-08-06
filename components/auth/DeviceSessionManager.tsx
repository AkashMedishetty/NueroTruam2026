'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { 
  generateDeviceFingerprint, 
  createDeviceSessionId, 
  isSessionValid,
  detectSessionConflicts,
  getBrowserInfo
} from '@/lib/utils/device-session-clean'

interface DeviceSessionManagerProps {
  children?: React.ReactNode
}

/**
 * Simplified Device Session Manager
 * Lightweight session monitoring without blocking functionality
 */
export function DeviceSessionManager({ children }: DeviceSessionManagerProps) {
  const { data: session, status } = useSession()
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Generate session info for debugging/monitoring only
      const deviceId = createDeviceSessionId()
      const conflicts = detectSessionConflicts()
      
      const info = {
        deviceId,
        browser: getBrowserInfo(),
        sessionValid: session.loginTime ? isSessionValid(session.loginTime) : true,
        conflicts,
        lastCheck: Date.now()
      }
      
      setSessionInfo(info)
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Device Session Info:', info)
        
        if (conflicts.hasConflict) {
          console.warn('⚠️ Session conflict detected:', conflicts)
        }
      }
    }
  }, [session, status])

  // Always render children - no blocking behavior
  return <>{children}</>
}

/**
 * Hook to get device session information for debugging
 */
export function useDeviceSession() {
  const { data: session } = useSession()
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fingerprint = generateDeviceFingerprint()
      const conflicts = detectSessionConflicts()
      
      setDeviceInfo({
        fingerprint,
        browser: getBrowserInfo(),
        conflicts,
        sessionId: session?.sessionId,
        deviceId: session?.deviceId,
        loginTime: session?.loginTime
      })
    }
  }, [session])

  return deviceInfo
}