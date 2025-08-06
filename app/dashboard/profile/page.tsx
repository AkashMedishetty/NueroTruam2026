import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Profile | NeuroTrauma 2026",
  description: "Manage your NeuroTrauma 2026 conference profile",
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your personal information and conference preferences
              </p>
            </div>
            
            <ProfileForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}