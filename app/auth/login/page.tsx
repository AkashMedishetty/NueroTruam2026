import { Suspense } from "react"
import { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"
import { MainLayout } from "@/components/layout/MainLayout"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Login | NeuroTrauma 2026",
  description: "Sign in to your NeuroTrauma 2026 conference account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}