import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import { EnhancedUserDashboard } from "@/components/dashboard/EnhancedUserDashboard"

export const metadata: Metadata = {
  title: "Dashboard | NeuroTrauma 2026",
  description: "Manage your NeuroTrauma 2026 conference registration and profile",
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout currentPage="dashboard" showSearch={true}>
        <EnhancedUserDashboard />
      </MainLayout>
    </ProtectedRoute>
  )
}