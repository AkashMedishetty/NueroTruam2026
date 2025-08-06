// Frontend Integration Code
// Replace your current auth logic with this

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002'

// Auth service for frontend
export class AuthService {
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': this.getDeviceFingerprint()
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store user data in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  static async logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      localStorage.removeItem('user')
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Logout failed' }
    }
  }

  static async getSession() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.authenticated) {
        localStorage.setItem('user', JSON.stringify(data.user))
        return { authenticated: true, user: data.user, session: data.session }
      } else {
        localStorage.removeItem('user')
        return { authenticated: false }
      }
    } catch (error) {
      return { authenticated: false, error: 'Session check failed' }
    }
  }

  static async getActiveSessions() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/active-sessions`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('Failed to fetch sessions')
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error)
      return []
    }
  }

  static async terminateSession(deviceFingerprint) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/terminate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deviceFingerprint })
      })
      
      return response.ok
    } catch (error) {
      console.error('Error terminating session:', error)
      return false
    }
  }

  static getDeviceFingerprint() {
    // Create a unique device fingerprint
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // Create a simple hash
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash).toString(36)}_${Date.now()}`
  }

  static getCachedUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }
}

// React hook for using the auth service
export function useServerAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    setLoading(true)
    const session = await AuthService.getSession()
    
    if (session.authenticated) {
      setUser(session.user)
      setAuthenticated(true)
    } else {
      setUser(null)
      setAuthenticated(false)
    }
    
    setLoading(false)
  }

  const login = async (email, password) => {
    const result = await AuthService.login(email, password)
    
    if (result.success) {
      setUser(result.user)
      setAuthenticated(true)
    }
    
    return result
  }

  const logout = async () => {
    const result = await AuthService.logout()
    
    if (result.success) {
      setUser(null)
      setAuthenticated(false)
    }
    
    return result
  }

  return {
    user,
    authenticated,
    loading,
    login,
    logout,
    checkSession
  }
}

// Usage in your components:
/*
import { useServerAuth } from './auth-service'

function LoginForm() {
  const { login, loading } = useServerAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error)
    }
  }
  
  // ... rest of component
}
*/