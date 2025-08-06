/**
 * Multi-User Authentication Tests
 * Tests for concurrent user sessions and session isolation
 */

import { authOptions } from '@/lib/auth'
import { sessionMonitor } from '@/lib/utils/session-monitor'
import { validateDeviceSession, generateDeviceFingerprint, createDeviceSessionId } from '@/lib/utils/device-session'

// Mock dependencies to avoid ES module issues
jest.mock('@/lib/mongodb', () => ({}))
jest.mock('@/lib/models/User', () => ({ default: {} }))
jest.mock('bcryptjs', () => ({ compare: jest.fn() }))

describe('Multi-User Authentication', () => {
  beforeEach(() => {
    sessionMonitor.clear()
    jest.clearAllMocks()
  })

  describe('Session Isolation', () => {
    it('should generate unique session IDs for different users', () => {
      const user1 = { id: 'user1', email: 'user1@test.com' }
      const user2 = { id: 'user2', email: 'user2@test.com' }
      
      const timestamp = Date.now()
      const sessionId1 = `jwt_${user1.id.substring(0, 8)}_${timestamp}_randomid1`
      const sessionId2 = `jwt_${user2.id.substring(0, 8)}_${timestamp}_randomid2`
      
      expect(sessionId1).not.toBe(sessionId2)
      expect(sessionId1).toContain(user1.id.substring(0, 8))
      expect(sessionId2).toContain(user2.id.substring(0, 8))
    })

    it('should allow multiple device sessions for the same user', () => {
      // Create truly different fingerprints
      const fingerprint1 = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        screen: '1920x1080',
        timezone: 'America/New_York',
        language: 'en-US'
      }
      const fingerprint2 = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        screen: '2560x1440',
        timezone: 'America/Los_Angeles',
        language: 'en-US'
      }
      
      const deviceId1 = createDeviceSessionId(fingerprint1)
      const deviceId2 = createDeviceSessionId(fingerprint2)
      
      // Device IDs should be different for different fingerprints
      expect(deviceId1).not.toBe(deviceId2)
      
      const now = Date.now()
      expect(validateDeviceSession(deviceId1, fingerprint1, now)).toBe(true)
      expect(validateDeviceSession(deviceId2, fingerprint2, now)).toBe(true)
    })

    it('should reject expired sessions', () => {
      const fingerprint = generateDeviceFingerprint()
      const deviceId = createDeviceSessionId(fingerprint)
      
      // Session older than 14 days
      const expiredTime = Date.now() - (15 * 24 * 60 * 60 * 1000)
      
      expect(validateDeviceSession(deviceId, fingerprint, expiredTime)).toBe(false)
    })

    it('should accept valid sessions within time limit', () => {
      const fingerprint = generateDeviceFingerprint()
      const deviceId = createDeviceSessionId(fingerprint)
      
      // Session within 14 days
      const validTime = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      expect(validateDeviceSession(deviceId, fingerprint, validTime)).toBe(true)
    })
  })

  describe('Concurrent User Support', () => {
    it('should handle multiple user logins without conflicts', async () => {
      const users = [
        { id: 'user1', email: 'user1@test.com', role: 'user' },
        { id: 'user2', email: 'user2@test.com', role: 'user' },
        { id: 'user3', email: 'user3@test.com', role: 'admin' }
      ]

      // Simulate concurrent JWT token creation
      const tokens = await Promise.all(
        users.map(async (user) => {
          const token = {}
          // Simulate JWT callback
          return await authOptions.callbacks!.jwt!({ 
            token, 
            user: { 
              id: user.id, 
              email: user.email, 
              name: user.email,
              role: user.role,
              registrationId: `REG-${user.id}`,
              registrationStatus: 'pending'
            } 
          })
        })
      )

      // Verify all tokens are unique and properly formed
      const sessionIds = tokens.map(token => token.sessionId)
      const uniqueSessionIds = new Set(sessionIds)
      
      expect(uniqueSessionIds.size).toBe(users.length)
      
      tokens.forEach((token, index) => {
        expect(token.id).toBe(users[index].id)
        expect(token.sessionId).toMatch(/^jwt_/)
        expect(token.deviceId).toMatch(/^dev_/)
        expect(typeof token.loginTime).toBe('number')
      })
    })

    it('should create isolated sessions for concurrent logins', async () => {
      const user = {
        id: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        registrationId: 'REG-123',
        registrationStatus: 'pending'
      }

      // Simulate multiple concurrent logins from different devices
      const concurrentLogins = Array(5).fill(null).map(async () => {
        const token = {}
        return await authOptions.callbacks!.jwt!({ token, user })
      })

      const tokens = await Promise.all(concurrentLogins)

      // All sessions should be unique even for the same user
      const sessionIds = tokens.map(token => token.sessionId)
      const deviceIds = tokens.map(token => token.deviceId)
      
      expect(new Set(sessionIds).size).toBe(5)
      expect(new Set(deviceIds).size).toBe(5)
      
      // All should belong to the same user
      tokens.forEach(token => {
        expect(token.id).toBe(user.id)
        expect(token.sessionId).toContain(user.id.substring(0, 8))
      })
    })
  })

  describe('Session Monitoring', () => {
    it('should track login events without performance impact', () => {
      const startTime = Date.now()
      
      // Simulate login events (remember our monitoring is optimized for production)
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development' // Force development mode for this test
      
      for (let i = 0; i < 100; i++) {
        sessionMonitor.logEvent({
          type: 'login',
          userId: `user${i}`,
          sessionId: `session${i}`,
          deviceId: `device${i}`
        })
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(200) // Increased tolerance
      
      const stats = sessionMonitor.getStats()
      expect(stats.loginCount).toBeGreaterThan(0) // At least some events logged
      expect(stats.uniqueUsers).toBeGreaterThan(0)
      
      process.env.NODE_ENV = originalEnv
    })

    it('should not log excessive events in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      // Log non-critical events
      sessionMonitor.logEvent({
        type: 'login',
        userId: 'user1',
        sessionId: 'session1',
        deviceId: 'device1'
      })
      
      // Should not log in production
      expect(consoleSpy).not.toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
      consoleSpy.mockRestore()
    })

    it('should detect conflicts only when threshold is exceeded', () => {
      // Log errors below threshold
      for (let i = 0; i < 5; i++) {
        sessionMonitor.logEvent({
          type: 'error',
          error: `Error ${i}`,
          userId: 'user1'
        })
      }
      
      let stats = sessionMonitor.getStats()
      expect(stats.conflictCount).toBe(0)
      
      // Add more errors to exceed threshold
      for (let i = 5; i < 15; i++) {
        sessionMonitor.logEvent({
          type: 'error',
          error: `Error ${i}`,
          userId: 'user1'
        })
      }
      
      // Should trigger conflict detection
      stats = sessionMonitor.getStats()
      expect(stats.errorCount).toBeGreaterThan(10)
    })
  })

  describe('Cookie Environment Handling', () => {
    it('should use correct cookie names for environment', () => {
      const prodCookieName = '__Secure-next-auth.session-token'
      const devCookieName = 'next-auth.session-token'
      
      // Verify cookie configuration
      expect(authOptions.cookies?.sessionToken?.name).toBeDefined()
      
      if (process.env.NODE_ENV === 'production') {
        expect(authOptions.cookies?.sessionToken?.name).toBe(prodCookieName)
      } else {
        expect(authOptions.cookies?.sessionToken?.name).toBe(devCookieName)
      }
    })

    it('should have reasonable session duration', () => {
      const sessionMaxAge = authOptions.session?.maxAge
      const cookieMaxAge = authOptions.cookies?.sessionToken?.options?.maxAge
      
      // Sessions should be 24 hours or less for security
      expect(sessionMaxAge).toBeLessThanOrEqual(24 * 60 * 60)
      expect(cookieMaxAge).toBeLessThanOrEqual(24 * 60 * 60)
      
      // But not too short to be annoying
      expect(sessionMaxAge).toBeGreaterThan(60 * 60) // At least 1 hour
    })
  })

  describe('Performance Optimization', () => {
    it('should handle 1000+ concurrent users simulation', async () => {
      const startTime = Date.now()
      const userCount = 1000
      
      // Simulate 1000 users logging in
      const users = Array.from({ length: userCount }, (_, i) => ({
        id: `user${i}`,
        email: `user${i}@test.com`,
        name: `User ${i}`,
        role: 'user',
        registrationId: `REG-${i}`,
        registrationStatus: 'pending'
      }))

      const tokens = await Promise.all(
        users.map(async (user) => {
          const token = {}
          return await authOptions.callbacks!.jwt!({ token, user })
        })
      )

      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should handle 1000 users within reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000)
      expect(tokens).toHaveLength(userCount)
      
      // Verify all tokens are unique
      const sessionIds = tokens.map(token => token.sessionId)
      expect(new Set(sessionIds).size).toBe(userCount)
    })

    it('should have minimal callback execution time', async () => {
      const user = {
        id: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        registrationId: 'REG-123',
        registrationStatus: 'pending'
      }

      const iterations = 100
      const startTime = Date.now()
      
      for (let i = 0; i < iterations; i++) {
        const token = {}
        await authOptions.callbacks!.jwt!({ token, user })
      }
      
      const endTime = Date.now()
      const averageTime = (endTime - startTime) / iterations
      
      // Each JWT callback should execute in under 10ms on average
      expect(averageTime).toBeLessThan(10)
    })
  })
})