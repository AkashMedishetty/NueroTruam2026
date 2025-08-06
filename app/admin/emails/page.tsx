import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { BulkEmailForm } from "@/components/admin/BulkEmailForm"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Email Management | NeuroTrauma 2026",
  description: "Send bulk emails to conference participants and manage communications",
}

export default function EmailsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Email Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Send bulk emails and manage communications with conference participants
              </p>
            </div>

            {/* Bulk Email Form */}
            <BulkEmailForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}