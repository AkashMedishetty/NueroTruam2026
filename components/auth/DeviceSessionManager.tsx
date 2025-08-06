'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { 
  generateDeviceFingerprint, 
  createDeviceSessionId, 
  validateDeviceSession,
  clearAuthenticationData,
  detectPotentialBrowserSync,
  getBrowserInfo
} from '@/lib/utils/device-session'
import { redirectGuard, withAuthTimeout } from '@/lib/utils/redirect-guard'

interface DeviceSessionManagerProps {
  children?: React.ReactNode
}

export function DeviceSessionManager({ children }: DeviceSessionManagerProps) {
  const { data: session, status } = useSession()
  const [hasValidated, setHasValidated] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState<any>(null)
  const validationInProgress = useRef(false)
  const lastValidationTime = useRef(0)

  useEffect(() => {
    // Only validate once per session and prevent multiple validations
    if (status === 'loading' || hasValidated || validationInProgress.current) return
    
    // Don't validate if we recently validated (within 30 seconds)
    const now = Date.now()
    if (now - lastValidationTime.current < 30000) {
      setHasValidated(true)
      return
    }

    const validateSession = async () => {
      validationInProgress.current = true
      lastValidationTime.current = now

      try {
        // Only validate if we have session data AND it's a new session
        if (session?.deviceId && session?.loginTime) {
          const fingerprint = generateDeviceFingerprint()
          setDeviceFingerprint(fingerprint)
          
          // Make validation less aggressive - only check age for now
          const sessionAge = Date.now() - session.loginTime
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours
          
          // Only invalidate if session is genuinely too old
          if (sessionAge > maxAge) {
            console.warn('Session expired due to age')
            
            // Use redirect guard to prevent loops
            if (redirectGuard.canRedirect('/auth/login', 'DeviceSessionManager-expired')) {
              toast.error('Session Expired', {
                description: 'Your session has expired. Please sign in again.',
                duration: 5000
              })

              // Use timeout wrapper to prevent stuck states
              await withAuthTimeout(
                signOut({ callbackUrl: '/auth/login', redirect: true }),
                10000,
                'Session expiry signOut'
              )
            }
            return
          }

          // Log successful validation (less verbose)
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Device session valid (${getBrowserInfo()})`)
          }
        }

        setHasValidated(true)
      } catch (error) {
        console.error('Device validation error:', error)
        // Don't block on validation errors - just log and continue
        setHasValidated(true)
      } finally {
        validationInProgress.current = false
      }
    }

    // Add small delay to prevent race conditions
    const timer = setTimeout(validateSession, 100)
    return () => clearTimeout(timer)
  }, [session, status, hasValidated])

  // Show browser sync warning if detected
  useEffect(() => {
    if (hasValidated && session) {
      const syncInfo = detectPotentialBrowserSync()
      
      if (syncInfo.hasBrowserSync && !localStorage.getItem('browserSyncWarningShown')) {
        toast.info('Multi-Device Authentication Info', {
          description: `You're using ${syncInfo.browser} which may sync sessions. For security, each device requires separate login.`,
          duration: 10000
        })
        
        localStorage.setItem('browserSyncWarningShown', 'true')
      }
    }
  }, [hasValidated, session])

  return <>{children}</>
}

/**
 * Hook to get device session information
 */
export function useDeviceSession() {
  const { data: session } = useSession()
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fingerprint = generateDeviceFingerprint()
      const syncInfo = detectPotentialBrowserSync()
      
      setDeviceInfo({
        fingerprint,
        browser: getBrowserInfo(),
        syncInfo,
        sessionDeviceId: session?.deviceId,
        sessionLoginTime: session?.loginTime
      })
    }
  }, [session])

  return deviceInfo
}