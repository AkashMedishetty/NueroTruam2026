"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock,
  User,
  AlertTriangle,
  Calendar,
  Building,
  Mail,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardStats {
  totalRegistrations: number
  paidRegistrations: number
  pendingPayments: number
  totalRevenue: number
  currency: string
  registrationsByType: {
    regular: number
    student: number
    international: number
    faculty: number
  }
  recentRegistrations: Array<{
    _id: string
    registrationId: string
    name: string
    email: string
    type: string
    status: string
    registrationDate: string
  }>
  workshopStats: {
    totalWorkshops: number
    totalParticipants: number
    popularWorkshops: Array<{
      name: string
      participants: number
    }>
  }
  accompanyingPersons: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/dashboard")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || "Failed to fetch dashboard statistics")
      }
    } catch (error) {
      console.error("Dashboard stats error:", error)
      setError("An error occurred while fetching dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`
    }
    return `₹${amount.toLocaleString()}`
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "regular": return "Regular"
      case "student": return "Student"
      case "international": return "International"
      case "faculty": return "Faculty"
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>No dashboard data available.</AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidRegistrations} paid, {stats.pendingPayments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue, stats.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.paidRegistrations} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshop Participants</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workshopStats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.workshopStats.totalWorkshops} workshops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accompanying Persons</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accompanyingPersons}</div>
            <p className="text-xs text-muted-foreground">
              Additional attendees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Registration Breakdown
            </CardTitle>
            <CardDescription>Distribution by registration type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.registrationsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <Badge variant="secondary">
                      {((count / stats.totalRegistrations) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Popular Workshops
            </CardTitle>
            <CardDescription>Most selected workshops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.workshopStats.popularWorkshops.slice(0, 5).map((workshop, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{workshop.name}</span>
                  </div>
                  <Badge variant="outline">{workshop.participants}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                Recent Registrations
              </CardTitle>
              <CardDescription>Latest 10 registrations</CardDescription>
            </div>
            <Link href="/admin/registrations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentRegistrations.slice(0, 10).map((registration) => (
              <div key={registration._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {registration.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {registration.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {registration.registrationId}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTypeLabel(registration.type)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(registration.status)}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </Badge>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(registration.registrationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/registrations">
              <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
                <Users className="h-4 w-4" />
                Manage Registrations
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
                <CreditCard className="h-4 w-4" />
                View Payments
              </Button>
            </Link>
            <Link href="/admin/emails">
              <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
                <Mail className="h-4 w-4" />
                Send Emails
              </Button>
            </Link>
            <Link href="/admin/config">
              <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
                <Building className="h-4 w-4" />
                Configuration
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Payments:</span>
                <Badge variant="secondary">{stats.pendingPayments}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Registrations (24h):</span>
                <Badge variant="secondary">
                  {stats.recentRegistrations.filter(r => 
                    new Date(r.registrationDate) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export All Registrations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Payment Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}