/**
 * Simplified Device Session Management
 * Lightweight device fingerprinting for session isolation
 */

export interface DeviceFingerprint {
  userAgent: string
  screen: string
  timezone: string
  language: string
}

/**
 * Generate a lightweight client-side device fingerprint
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      screen: 'server',
      timezone: 'UTC',
      language: 'en'
    }
  }

  return {
    userAgent: navigator.userAgent.substring(0, 50), // Truncated for performance
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  }
}

/**
 * Create a unique device session identifier
 */
export function createDeviceSessionId(): string {
  const fingerprint = generateDeviceFingerprint()
  const timestamp = Date.now().toString(36)
  const randomId = Math.random().toString(36).substring(2, 10)
  
  // Simple hash for device ID
  const fpHash = btoa(JSON.stringify(fingerprint))
    .replace(/[+/=]/g, '')
    .substring(0, 8)
  
  return `${fpHash}_${timestamp}_${randomId}`
}

/**
 * Validate session age (simple time-based validation)
 */
export function isSessionValid(loginTime: number, maxAge: number = 7 * 24 * 60 * 60 * 1000): boolean {
  return Date.now() - loginTime < maxAge
}

/**
 * Clear authentication data on logout or session invalid
 */
export function clearAuthenticationData(): void {
  if (typeof window === 'undefined') return

  // Clear NextAuth cookies for both environments
  const cookies = [
    'next-auth.session-token',
    'next-auth.callback-url', 
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.callback-url',
    '__Host-next-auth.csrf-token'
  ]

  cookies.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    // Clear for parent domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
  })

  // Clear any local storage auth data
  try {
    localStorage.removeItem('nextauth.message')
    sessionStorage.clear()
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Get browser information for debugging
 */
export function getBrowserInfo(): string {
  if (typeof window === 'undefined') return 'Server'
  
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox' 
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}

/**
 * Session conflict detection (client-side)
 */
export function detectSessionConflicts(): {
  hasConflict: boolean
  conflictType?: string
  recommendation?: string
} {
  if (typeof window === 'undefined') {
    return { hasConflict: false }
  }

  // Check for multiple session cookies
  const devCookie = document.cookie.includes('next-auth.session-token=')
  const prodCookie = document.cookie.includes('__Secure-next-auth.session-token=')
  
  if (devCookie && prodCookie) {
    return {
      hasConflict: true,
      conflictType: 'multiple_environments',
      recommendation: 'Clear browser cookies and log in again'
    }
  }

  // Check for browser sync issues
  const browser = getBrowserInfo()
  if (['Chrome', 'Edge'].includes(browser)) {
    return {
      hasConflict: false,
      conflictType: 'potential_sync',
      recommendation: 'Use incognito mode for testing multiple accounts'
    }
  }

  return { hasConflict: false }
}