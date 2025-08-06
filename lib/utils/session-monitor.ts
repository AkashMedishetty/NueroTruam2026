/**
 * Session Monitor - Tracks and logs session-related issues
 * Helps debug multi-user authentication conflicts
 */

interface SessionEvent {
  type: 'login' | 'logout' | 'error' | 'conflict' | 'recovery'
  userId?: string
  sessionId?: string
  deviceId?: string
  error?: string
  timestamp: number
  userAgent?: string
  ip?: string
}

class SessionMonitor {
  private events: SessionEvent[] = []
  private readonly MAX_EVENTS = 50 // Reduced from 100 for better performance
  private conflictThreshold = 10 // Increased threshold to reduce false positives

  /**
   * Log a session event with reduced overhead
   */
  logEvent(event: Omit<SessionEvent, 'timestamp'>) {
    // Skip logging in production for performance unless it's critical
    if (process.env.NODE_ENV === 'production' && event.type !== 'error' && event.type !== 'conflict') {
      return
    }

    const fullEvent: SessionEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.events.push(fullEvent)

    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift()
    }

    // Only check for conflicts periodically to reduce CPU usage
    if (this.events.length % 5 === 0) {
      this.detectConflicts()
    }

    // Minimal logging for development only
    if (process.env.NODE_ENV === 'development' && event.type === 'error') {
      console.log('SessionMonitor:', fullEvent)
    }
  }

  /**
   * Simplified conflict detection with reduced overhead
   */
  private detectConflicts() {
    const recentEvents = this.events.filter(
      event => Date.now() - event.timestamp < 30000 // Last 30 seconds (increased window)
    )

    // Only check for critical error patterns
    const errorEvents = recentEvents.filter(event => event.type === 'error')
    if (errorEvents.length >= this.conflictThreshold) {
      this.logEvent({
        type: 'conflict',
        error: `${errorEvents.length} errors in 30 seconds`
      })
    }
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(minutes: number = 5): SessionEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.events.filter(event => event.timestamp > cutoff)
  }

  /**
   * Get session statistics
   */
  getStats() {
    const recentEvents = this.getRecentEvents(30) // Last 30 minutes
    
    const stats = {
      totalEvents: recentEvents.length,
      loginCount: recentEvents.filter(e => e.type === 'login').length,
      errorCount: recentEvents.filter(e => e.type === 'error').length,
      conflictCount: recentEvents.filter(e => e.type === 'conflict').length,
      uniqueUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
      uniqueDevices: new Set(recentEvents.map(e => e.deviceId).filter(Boolean)).size,
      errorRate: 0
    }

    stats.errorRate = stats.totalEvents > 0 ? (stats.errorCount / stats.totalEvents) * 100 : 0

    return stats
  }

  /**
   * Clear all events (for testing)
   */
  clear() {
    this.events = []
  }

  /**
   * Export events for analysis
   */
  exportEvents(): SessionEvent[] {
    return [...this.events]
  }
}

// Global instance
export const sessionMonitor = new SessionMonitor()

// Helper functions for common logging scenarios
export const logSessionLogin = (userId: string, sessionId: string, deviceId: string, userAgent?: string) => {
  sessionMonitor.logEvent({
    type: 'login',
    userId,
    sessionId,
    deviceId,
    userAgent
  })
}

export const logSessionError = (error: string, userId?: string, sessionId?: string) => {
  sessionMonitor.logEvent({
    type: 'error',
    error,
    userId,
    sessionId
  })
}

export const logSessionLogout = (userId?: string, sessionId?: string) => {
  sessionMonitor.logEvent({
    type: 'logout',
    userId,
    sessionId
  })
}

export const logSessionRecovery = (userId?: string, sessionId?: string, error?: string) => {
  sessionMonitor.logEvent({
    type: 'recovery',
    userId,
    sessionId,
    error
  })
}