import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { PaymentForm } from "@/components/payment/PaymentForm"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Payment | NeuroTrauma 2026",
  description: "Complete your NeuroTrauma 2026 conference registration payment",
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        
        <main>
          <PaymentForm />
        </main>
      </div>
    </ProtectedRoute>
  )
}