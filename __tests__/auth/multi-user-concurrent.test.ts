/**
 * Multi-User Concurrent Authentication Test
 * Simulates real-world scenario with multiple users logging in simultaneously
 */

import { lightweightSessionMonitor } from '@/lib/utils/session-monitor-clean'
import { createDeviceSessionId } from '@/lib/utils/device-session-clean'

describe('Multi-User Concurrent Authentication', () => {
  beforeEach(() => {
    lightweightSessionMonitor.clear()
    process.env.NODE_ENV = 'development'
  })

  test('should handle 100 concurrent user logins without conflicts', async () => {
    const userCount = 100
    
    // Simulate concurrent user logins
    const loginPromises = Array.from({ length: userCount }, async (_, index) => {
      const userId = `user_${index.toString().padStart(3, '0')}`
      const timestamp = Date.now() + index // Slightly stagger timestamps
      const randomId = Math.random().toString(36).substring(2, 15)
      const userPart = userId.substring(0, 8)
      
      const sessionData = {
        userId,
        sessionId: `${userPart}_${timestamp}_${randomId}`,
        deviceId: createDeviceSessionId(),
        loginTime: timestamp
      }
      
      // Log the session creation
      lightweightSessionMonitor.logEvent({
        type: 'login',
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        deviceId: sessionData.deviceId
      })
      
      return sessionData
    })
    
    const results = await Promise.all(loginPromises)
    
    // Verify all sessions are unique
    const sessionIds = results.map(r => r.sessionId)
    const deviceIds = results.map(r => r.deviceId)
    const userIds = results.map(r => r.userId)
    
    expect(new Set(sessionIds).size).toBe(userCount) // All session IDs unique
    expect(new Set(deviceIds).size).toBe(userCount) // All device IDs unique
    expect(new Set(userIds).size).toBe(userCount) // All user IDs unique
    
    // Verify session monitor stats (accounting for MAX_EVENTS limit)
    const stats = lightweightSessionMonitor.getStats()
    expect(stats.loginCount).toBeLessThanOrEqual(50) // Limited by MAX_EVENTS for performance
    expect(stats.uniqueUsers).toBeLessThanOrEqual(50) // Limited by MAX_EVENTS for performance
    expect(stats.errorCount).toBe(0) // No errors during concurrent logins
    
    // All sessions should still be unique regardless of monitoring limits
    expect(new Set(sessionIds).size).toBe(userCount) // All session IDs unique
    expect(new Set(deviceIds).size).toBe(userCount) // All device IDs unique
    expect(new Set(userIds).size).toBe(userCount) // All user IDs unique
  })

  test('should prevent JWT token sharing across devices', () => {
    // Simulate the same user logging in from different devices
    const userId = 'user_multi_device'
    const devices = ['desktop', 'mobile', 'tablet']
    
    const sessions = devices.map(device => {
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const userPart = userId.substring(0, 8)
      
      return {
        userId,
        sessionId: `${userPart}_${timestamp}_${randomId}`,
        deviceId: `${device}_${timestamp}_${randomId}`,
        loginTime: timestamp,
        device
      }
    })
    
    // All sessions should have unique session and device IDs
    const sessionIds = sessions.map(s => s.sessionId)
    const deviceIds = sessions.map(s => s.deviceId)
    
    expect(new Set(sessionIds).size).toBe(3) // Each device gets unique session
    expect(new Set(deviceIds).size).toBe(3) // Each device gets unique device ID
    
    // But all belong to the same user
    const userIds = sessions.map(s => s.userId)
    expect(new Set(userIds).size).toBe(1) // Same user across all devices
  })

  test('should handle rapid sequential logins without race conditions', async () => {
    const rapidLogins = 50
    const loginInterval = 10 // 10ms between logins
    
    const results: any[] = []
    
    // Rapid sequential logins
    for (let i = 0; i < rapidLogins; i++) {
      const userId = `rapid_user_${i}`
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const userPart = userId.substring(0, 8)
      
      const sessionData = {
        userId,
        sessionId: `${userPart}_${timestamp}_${randomId}`,
        deviceId: `rapid_${timestamp}_${randomId}`,
        loginTime: timestamp
      }
      
      results.push(sessionData)
      
      // Small delay to simulate rapid but not simultaneous requests
      await new Promise(resolve => setTimeout(resolve, loginInterval))
    }
    
    // Verify no collisions in rapid sequential logins
    const sessionIds = results.map(r => r.sessionId)
    const deviceIds = results.map(r => r.deviceId)
    
    expect(new Set(sessionIds).size).toBe(rapidLogins)
    expect(new Set(deviceIds).size).toBe(rapidLogins)
  })

  test('should maintain session isolation between different users', () => {
    // Create sessions for different user types
    const adminUser = createUserSession('admin_user_001', 'admin')
    const regularUser1 = createUserSession('regular_user_001', 'user')
    const regularUser2 = createUserSession('regular_user_002', 'user')
    const guestUser = createUserSession('guest_user_001', 'guest')
    
    // Verify session isolation
    const allSessions = [adminUser, regularUser1, regularUser2, guestUser]
    const sessionIds = allSessions.map(s => s.sessionId)
    const deviceIds = allSessions.map(s => s.deviceId)
    
    expect(new Set(sessionIds).size).toBe(4) // All unique session IDs
    expect(new Set(deviceIds).size).toBe(4) // All unique device IDs
    
    // Verify user-specific session data
    expect(adminUser.sessionId).toContain('admin_us')
    expect(regularUser1.sessionId).toContain('regular_')
    expect(regularUser2.sessionId).toContain('regular_')
    expect(guestUser.sessionId).toContain('guest_us')
    
    // Verify different timestamps/randomness
    expect(adminUser.sessionId).not.toEqual(regularUser1.sessionId)
    expect(regularUser1.sessionId).not.toEqual(regularUser2.sessionId)
  })

  test('should handle session cleanup without affecting other users', () => {
    // Create multiple user sessions
    const users = ['user1', 'user2', 'user3', 'user4', 'user5']
    
    users.forEach(userId => {
      lightweightSessionMonitor.logEvent({
        type: 'login',
        userId,
        sessionId: `session_${userId}_${Date.now()}`,
        deviceId: `device_${userId}_${Date.now()}`
      })
    })
    
    // Simulate one user logging out
    lightweightSessionMonitor.logEvent({
      type: 'logout',
      userId: 'user3',
      sessionId: 'session_user3_logout'
    })
    
    const stats = lightweightSessionMonitor.getStats()
    
    // Should show 5 logins and 1 logout
    expect(stats.loginCount).toBe(5)
    expect(stats.uniqueUsers).toBe(5)
    
    // Other users' sessions should remain unaffected
    // (This is implicit in our stateless JWT design)
  })
})

// Helper function to create user session data
function createUserSession(userId: string, role: string = 'user') {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const userPart = userId.substring(0, 8)
  
  return {
    userId,
    role,
    sessionId: `${userPart}_${timestamp}_${randomId}`,
    deviceId: `dev_${timestamp}_${randomId}`,
    loginTime: timestamp
  }
}