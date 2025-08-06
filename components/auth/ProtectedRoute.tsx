"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useRef, ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { redirectGuard } from "@/lib/utils/redirect-guard"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "user" | "admin" | "reviewer"
  fallbackUrl?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = "user",
  fallbackUrl = "/auth/login"
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const redirectAttempted = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Don't process if loading or already redirecting
    if (status === "loading" || isRedirecting) return

    // Reset redirect flag when session status changes
    if (status === "authenticated") {
      redirectAttempted.current = false
      setIsRedirecting(false)
      redirectGuard.clearAll() // Clear redirect history on successful auth
      console.log('✅ ProtectedRoute: Session authenticated', {
        user: session?.user?.email,
        role: session?.user?.role,
        pathname
      })
    }

    // Add production-specific session debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 ProtectedRoute production debug:', {
        status,
        hasSession: !!session,
        pathname,
        isRedirecting,
        redirectAttempted: redirectAttempted.current
      })
    }

    const handleRedirect = (targetUrl: string, context: string) => {
      if (redirectAttempted.current || isRedirecting) {
        console.warn(`Redirect already in progress to ${targetUrl}`)
        return
      }

      if (redirectGuard.canRedirect(targetUrl, context)) {
        console.log(`🔄 ProtectedRoute redirecting to: ${targetUrl}`)
        redirectAttempted.current = true
        setIsRedirecting(true)
        
        // Set a timeout to reset the redirect state in case of issues
        timeoutRef.current = setTimeout(() => {
          console.warn('Redirect timeout - resetting state')
          setIsRedirecting(false)
          redirectAttempted.current = false
        }, 5000)
        
        router.push(targetUrl)
      } else {
        console.error(`Redirect blocked to prevent loop: ${targetUrl}`)
        setIsRedirecting(false)
      }
    }

    if (status === "unauthenticated") {
      // In production, add a small delay to allow for session initialization
      if (process.env.NODE_ENV === 'production' && !redirectAttempted.current) {
        console.log('⏳ Production: Waiting for session initialization...')
        timeoutRef.current = setTimeout(() => {
          if (status === "unauthenticated") {
            const returnUrl = encodeURIComponent(pathname)
            const loginUrl = `${fallbackUrl}?callbackUrl=${returnUrl}`
            handleRedirect(loginUrl, "ProtectedRoute-unauthenticated-delayed")
          }
        }, 1000) // 1 second delay for production
        return
      }
      
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname)
      const loginUrl = `${fallbackUrl}?callbackUrl=${returnUrl}`
      handleRedirect(loginUrl, "ProtectedRoute-unauthenticated")
      return
    }

    if (session?.user) {
      // Check role-based access
      const userRole = session.user.role || "user"
      
      if (requiredRole === "admin" && userRole !== "admin") {
        handleRedirect("/dashboard", "ProtectedRoute-admin-denied")
        return
      }
      
      if (requiredRole === "reviewer" && !["admin", "reviewer"].includes(userRole)) {
        handleRedirect("/dashboard", "ProtectedRoute-reviewer-denied")
        return
      }
    }
  }, [session, status, router, pathname, requiredRole, fallbackUrl, isRedirecting])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (isRedirecting || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="text-gray-600">
            {isRedirecting ? "Redirecting..." : "Redirecting to login..."}
          </p>
          <p className="text-sm text-gray-500">
            If this takes too long, please refresh the page
          </p>
        </div>
      </div>
    )
  }

  // Check role access
  if (session?.user) {
    const userRole = session.user.role || "user"
    
    if (requiredRole === "admin" && userRole !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    
    if (requiredRole === "reviewer" && !["admin", "reviewer"].includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">You don't have reviewer permissions.</p>
          </div>
        </div>
      )
    }
  }

  // Render protected content
  return <>{children}</>
}

// HOC version for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: "user" | "admin" | "reviewer" = "user"
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}