"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Loader2 } from "lucide-react"

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

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname)
      router.push(`${fallbackUrl}?callbackUrl=${returnUrl}`)
      return
    }

    if (session?.user) {
      // Check role-based access
      const userRole = session.user.role || "user"
      
      if (requiredRole === "admin" && userRole !== "admin") {
        router.push("/dashboard") // Redirect non-admin users to dashboard
        return
      }
      
      if (requiredRole === "reviewer" && !["admin", "reviewer"].includes(userRole)) {
        router.push("/dashboard") // Redirect non-reviewers to dashboard
        return
      }
    }
  }, [session, status, router, pathname, requiredRole, fallbackUrl])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting unauthenticated users
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="text-gray-600">Redirecting to login...</p>
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