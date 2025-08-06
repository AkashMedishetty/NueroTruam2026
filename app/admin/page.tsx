import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ComprehensiveAdminPanel } from "@/components/admin/ComprehensiveAdminPanel"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Admin Dashboard | NeuroTrauma 2026",
  description: "Comprehensive administrative dashboard for NeuroTrauma 2026 conference management",
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <main className="pt-20">
          <ComprehensiveAdminPanel />
        </main>
      </div>
    </ProtectedRoute>
  )
}