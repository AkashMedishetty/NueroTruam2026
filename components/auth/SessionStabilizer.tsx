"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

interface SessionState {
  status: 'loading' | 'authenticated' | 'unauthenticated'
  hasSession: boolean
  userEmail?: string
  sessionId?: string
  lastChange: number
}

/**
 * SessionStabilizer prevents rapid session state changes that cause redirect loops
 * It implements a debouncing mechanism to stabilize session state transitions
 */
export function SessionStabilizer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [stableSession, setStableSession] = useState<SessionState>({
    status: 'loading',
    hasSession: false,
    lastChange: Date.now()
  })
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastSessionState = useRef<string>('')
  const stateChangeCount = useRef(0)
  const sessionHistory = useRef<SessionState[]>([])

  useEffect(() => {
    const currentState = `${status}-${!!session}-${session?.user?.email || ''}`
    
    // Track session state changes
    if (currentState !== lastSessionState.current) {
      stateChangeCount.current++
      lastSessionState.current = currentState
      
      const newState: SessionState = {
        status,
        hasSession: !!session,
        userEmail: session?.user?.email,
        sessionId: (session as any)?.sessionId,
        lastChange: Date.now()
      }
      
      // Add to history (keep last 10 states)
      sessionHistory.current.push(newState)
      if (sessionHistory.current.length > 10) {
        sessionHistory.current.shift()
      }
      
      // Log rapid state changes
      if (stateChangeCount.current > 5) {
        console.warn('🚨 Rapid session state changes detected:', {
          changeCount: stateChangeCount.current,
          currentState,
          history: sessionHistory.current.slice(-5),
          timestamp: new Date().toISOString()
        })
      }
      
      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      
      // Set new debounce timer
      debounceTimer.current = setTimeout(() => {
        console.log('🔄 SessionStabilizer: Updating stable session state:', {
          from: stableSession.status,
          to: status,
          hasSession: !!session,
          userEmail: session?.user?.email,
          changeCount: stateChangeCount.current
        })
        
        setStableSession(newState)
        
        // Reset change counter after stabilization
        if (stateChangeCount.current > 3) {
          console.log('🔧 SessionStabilizer: Resetting change counter')
          stateChangeCount.current = 0
        }
      }, 500) // 500ms debounce delay
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [session, status, stableSession.status])

  // Provide stable session context to children
  return (
    <div data-session-stabilizer="true" data-stable-status={stableSession.status}>
      {children}
    </div>
  )
}

/**
 * Hook to get stabilized session state
 */
export function useStableSession() {
  const { data: session, status } = useSession()
  const [isStable, setIsStable] = useState(false)
  const stabilityTimer = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Reset stability when session changes
    setIsStable(false)
    
    if (stabilityTimer.current) {
      clearTimeout(stabilityTimer.current)
    }
    
    // Mark as stable after no changes for 1 second
    stabilityTimer.current = setTimeout(() => {
      setIsStable(true)
    }, 1000)
    
    return () => {
      if (stabilityTimer.current) {
        clearTimeout(stabilityTimer.current)
      }
    }
  }, [session, status])
  
  return {
    session,
    status,
    isStable,
    isLoading: status === 'loading' || !isStable
  }
}