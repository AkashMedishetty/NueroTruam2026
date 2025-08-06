/**
 * Lightweight Session Monitor
 * Minimal logging for debugging without performance overhead
 */

interface SessionEvent {
  type: 'login' | 'logout' | 'error'
  userId?: string
  sessionId?: string
  deviceId?: string
  error?: string
  timestamp: number
}

class LightweightSessionMonitor {
  private events: SessionEvent[] = []
  private readonly MAX_EVENTS = 50 // Reduced for performance

  /**
   * Log a session event (minimal overhead)
   */
  logEvent(event: Omit<SessionEvent, 'timestamp'>) {
    // Only log in development or for critical errors
    if (process.env.NODE_ENV !== 'development' && event.type !== 'error') {
      return
    }

    const fullEvent: SessionEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.events.push(fullEvent)

    // Keep only recent events to prevent memory leaks
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift()
    }

    // Minimal console logging in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Session[${event.type}]:`, {
        userId: event.userId?.substring(0, 8),
        sessionId: event.sessionId?.substring(0, 12),
        deviceId: event.deviceId?.substring(0, 12),
        error: event.error
      })
    }
  }

  /**
   * Get recent events for debugging (development only)
   */
  getRecentEvents(minutes: number = 5): SessionEvent[] {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }
    
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.events.filter(event => event.timestamp > cutoff)
  }

  /**
   * Get session statistics (development only)
   */
  getStats() {
    if (process.env.NODE_ENV !== 'development') {
      return { disabled: true }
    }

    const recentEvents = this.getRecentEvents(30)
    
    return {
      totalEvents: recentEvents.length,
      loginCount: recentEvents.filter(e => e.type === 'login').length,
      errorCount: recentEvents.filter(e => e.type === 'error').length,
      uniqueUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
    }
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = []
  }
}

// Global instance
export const lightweightSessionMonitor = new LightweightSessionMonitor()

// Helper functions for common logging scenarios
export const logSessionLogin = (userId: string, sessionId: string, deviceId: string) => {
  lightweightSessionMonitor.logEvent({
    type: 'login',
    userId,
    sessionId,
    deviceId
  })
}

export const logSessionError = (error: string, userId?: string, sessionId?: string) => {
  lightweightSessionMonitor.logEvent({
    type: 'error',
    error,
    userId,
    sessionId
  })
}

export const logSessionLogout = (userId?: string, sessionId?: string) => {
  lightweightSessionMonitor.logEvent({
    type: 'logout',
    userId,
    sessionId
  })
}