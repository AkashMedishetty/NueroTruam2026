import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ConfigManager } from "@/components/admin/ConfigManager"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "System Configuration | NeuroTrauma 2026",
  description: "Manage system settings, pricing, discounts, and email configurations",
}

export default function ConfigPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">System Configuration</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage pricing, discounts, email settings, and other system configurations
              </p>
            </div>

            {/* Config Manager */}
            <ConfigManager />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}