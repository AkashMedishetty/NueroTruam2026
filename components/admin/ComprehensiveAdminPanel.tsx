"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingTiersManager } from "./PricingTiersManager"
import { WorkshopManager } from "./WorkshopManager"
import { ContactMessagesManager } from "./ContactMessagesManager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  CreditCard,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Download,
  Search,
  RefreshCw,
  Settings,
  Mail,
  BarChart3,
  FileText,
  DollarSign,
  AlertTriangle,
  Star,
  Calendar,
  Globe,
  Shield,
  Database,
  TrendingUp,
  UserCheck,
  Receipt,
  Bell,
  MessageCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalRegistrations: number
  paidRegistrations: number
  pendingPayments: number
  totalRevenue: number
  workshopRegistrations: number
  accompanyingPersons: number
  registrationsByCategory: Record<string, number>
  dailyRegistrations: Array<{ date: string; count: number }>
  paymentsByMethod: Record<string, number>
}

interface Registration {
  _id: string
  registrationId: string
  profile: {
    title: string
    firstName: string
    lastName: string
    phone: string
    institution: string
  }
  email: string
  registration: {
    type: string
    status: string
    workshopSelections: string[]
    accompanyingPersons: any[]
    registrationDate: string
  }
  createdAt: string
}

interface Payment {
  _id: string
  userId: string
  registrationId: string
  amount: {
    total: number
    currency: string
  }
  status: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  transactionDate: string
  paymentMethod?: string
}

export function ComprehensiveAdminPanel() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [error, setError] = useState<string | null>(null)
  const [currentTier, setCurrentTier] = useState<any>(null)
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    paidRegistrations: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    workshopRegistrations: 0,
    accompanyingPersons: 0,
    registrationsByCategory: {},
    dailyRegistrations: [],
    paymentsByMethod: {}
  })
  
  // Registrations data
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  
  // Payments data
  const [payments, setPayments] = useState<Payment[]>([])
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Bulk email states
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [senderName, setSenderName] = useState("NeuroTrauma 2026 Team")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["all"])
  const [filteredRecipients, setFilteredRecipients] = useState<any[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    loadCurrentTier()
  }, [])

  const loadCurrentTier = async () => {
    try {
      const response = await fetch('/api/payment/pricing')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.currentTier) {
          setCurrentTier(result.data.currentTier)
        }
      }
    } catch (error) {
      console.error('Error loading current tier:', error)
    }
  }

  // Filter registrations based on search term and status
  useEffect(() => {
    let filtered = registrations

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.registration.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm, statusFilter])

  // Bulk email functions
  const loadRecipients = async () => {
    setIsLoadingRecipients(true)
    try {
      const response = await fetch('/api/admin/recipients')
      if (response.ok) {
        const data = await response.json()
        let recipients = data.data || []

        // Filter by registration type
        if (!selectedTypes.includes('all')) {
          recipients = recipients.filter((r: any) => 
            selectedTypes.includes(r.registrationType)
          )
        }

        // Filter by payment status
        if (!selectedStatuses.includes('all')) {
          recipients = recipients.filter((r: any) => 
            selectedStatuses.includes(r.registrationStatus)
          )
        }

        setFilteredRecipients(recipients)
        
        toast({
          title: "Recipients Loaded",
          description: `Found ${recipients.length} matching recipients`
        })
      } else {
        throw new Error('Failed to load recipients')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recipients",
        variant: "destructive"
      })
    } finally {
      setIsLoadingRecipients(false)
    }
  }

  const sendBulkEmail = async () => {
    if (!emailSubject || !emailContent || filteredRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide subject, content, and select recipients",
        variant: "destructive"
      })
      return
    }

    setIsSendingEmail(true)
    try {
      const recipients = filteredRecipients.map(r => r.email)
      
      const response = await fetch('/api/admin/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          recipients,
          senderName
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Email Sent Successfully",
          description: `Bulk email sent to ${recipients.length} recipients`
        })
        
        // Reset form
        setEmailSubject("")
        setEmailContent("")
        setFilteredRecipients([])
        setSelectedTypes(["all"])
        setSelectedStatuses(["all"])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send bulk email')
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: error instanceof Error ? error.message : "Failed to send bulk email",
        variant: "destructive"
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [dashboardRes, registrationsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/dashboard').catch(() => ({ ok: false })),
        fetch('/api/admin/registrations').catch(() => ({ ok: false })),
        fetch('/api/admin/payments').catch(() => ({ ok: false }))
      ])

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        setDashboardStats(dashboardData.data || {
          totalRegistrations: 0,
          paidRegistrations: 0,
          pendingPayments: 0,
          totalRevenue: 0,
          workshopRegistrations: 0,
          accompanyingPersons: 0,
          registrationsByCategory: {},
          dailyRegistrations: [],
          paymentsByMethod: {}
        })
      } else {
        // Set default stats if API fails
        setDashboardStats({
          totalRegistrations: 0,
          paidRegistrations: 0,
          pendingPayments: 0,
          totalRevenue: 0,
          workshopRegistrations: 0,
          accompanyingPersons: 0,
          registrationsByCategory: {},
          dailyRegistrations: [],
          paymentsByMethod: {}
        })
      }

      if (registrationsRes.ok) {
        const registrationsData = await registrationsRes.json()
        setRegistrations(registrationsData.data || [])
        setFilteredRegistrations(registrationsData.data || [])
      } else {
        setRegistrations([])
        setFilteredRegistrations([])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.data || [])
      } else {
        setPayments([])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      
      // Set default values on error
      setDashboardStats({
        totalRegistrations: 0,
        paidRegistrations: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        workshopRegistrations: 0,
        accompanyingPersons: 0,
        registrationsByCategory: {},
        dailyRegistrations: [],
        paymentsByMethod: {}
      })
      setRegistrations([])
      setFilteredRegistrations([])
      setPayments([])
      
      toast({
        title: "Error",
        description: "Failed to load admin data. Using default values.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/export/registrations')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Export Successful",
          description: "Registrations data exported successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export registrations data",
        variant: "destructive"
      })
    }
  }

  const handleExportPayments = async () => {
    try {
      const response = await fetch('/api/admin/export/payments')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Export Successful",
          description: "Payments data exported successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export payments data",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading admin panel:</strong> {error}
            <br />
            <Button 
              onClick={() => {
                setError(null)
                fetchDashboardData()
              }} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Admin Panel - NeuroTrauma 2026
          </h1>
          <p className="text-muted-foreground">
            Comprehensive conference management and administration
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Workshops
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                    <p className="text-3xl font-bold">{dashboardStats.totalRegistrations}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Registrations</p>
                    <p className="text-3xl font-bold">{dashboardStats.paidRegistrations}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                    <p className="text-3xl font-bold">{dashboardStats.pendingPayments}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Categories</CardTitle>
                <CardDescription>Breakdown by registration type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats.registrationsByCategory && Object.entries(dashboardStats.registrationsByCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {!dashboardStats.registrationsByCategory && (
                    <p className="text-sm text-muted-foreground">No registration data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleExportRegistrations} className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Registrations
                </Button>
                <Button onClick={handleExportPayments} className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  Export Payments
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Bulk Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Management</CardTitle>
              <CardDescription>View and manage all conference registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or registration ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExportRegistrations}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration._id}>
                        <TableCell className="font-mono text-sm">
                          {registration.registrationId}
                        </TableCell>
                        <TableCell>
                          {registration.profile.title} {registration.profile.firstName} {registration.profile.lastName}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {registration.registration.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={registration.registration.status === 'paid' ? 'default' : 'secondary'}
                          >
                            {registration.registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Registration
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Cancel Registration
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Registration Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-mono text-sm">
                          {payment.registrationId}
                        </TableCell>
                        <TableCell>
                          {payment.amount.currency} {payment.amount.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.userDetails?.registrationType?.replace('-', ' ') || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.paymentMethod || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(payment.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tiers Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing Tiers Management</span>
              </CardTitle>
              <CardDescription>
                Manage pricing tiers, special offers, and category pricing for the conference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingTiersManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workshops Tab */}
        <TabsContent value="workshops" className="space-y-6">
          <WorkshopManager />
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Configuration Tab Notice</h3>
            <p className="text-yellow-700">
              The configuration features have been moved to dedicated tabs for better management:
            </p>
            <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
              <li><strong>Pricing Management</strong> - Use the "Pricing" tab for pricing tiers and special offers</li>
              <li><strong>Workshop Management</strong> - Use the "Workshops" tab for workshop configuration</li>
              <li><strong>Email Settings</strong> - Use the "Emails" tab for SMTP configuration</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Configuration Links</CardTitle>
                <CardDescription>Navigate to specific configuration sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('pricing')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Pricing Tiers & Special Offers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('workshops')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Workshops & Seat Availability
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('emails')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Configure Email Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system configuration status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Pricing Tier</p>
                      <p className="text-sm text-muted-foreground">Active tier for registrations</p>
                    </div>
                    <div className="text-right">
                      {currentTier ? (
                        <>
                          <p className="font-bold text-green-600">{currentTier.name}</p>
                          <Badge variant="secondary" className="mt-1">₹{currentTier.categories?.['ntsi-member']?.amount || 'N/A'}</Badge>
                        </>
                      ) : (
                        <Badge variant="outline">Loading...</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Total Workshops</p>
                      <p className="text-sm text-muted-foreground">Available workshops</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">6</p>
                      <Badge variant="secondary" className="mt-1">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Registration Categories</p>
                      <p className="text-sm text-muted-foreground">Available categories</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">4</p>
                      <Badge variant="secondary" className="mt-1">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings and email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">SMTP Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">SMTP Host</Label>
                      <Input value="smtpout.secureserver.net" disabled />
                    </div>
                    <div>
                      <Label className="text-sm">SMTP Port</Label>
                      <Input value="465" disabled />
                    </div>
                    <div>
                      <Label className="text-sm">From Email</Label>
                      <Input value="hello@violetvoyage.in" disabled />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">SMTP Connected</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Email Templates</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Registration Confirmation</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Confirmation</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Password Reset</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bulk Email</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <Settings className="mr-2 h-4 w-4" />
                Update Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Email Management</CardTitle>
              <CardDescription>Send targeted emails to registered users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Composition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compose Email</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emailSubject">Subject</Label>
                      <Input
                        id="emailSubject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="senderName">Sender Name</Label>
                      <Input
                        id="senderName"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="NeuroTrauma 2026 Team"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emailContent">Message</Label>
                      <Textarea
                        id="emailContent"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Enter your message here..."
                        rows={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Recipient Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Recipients</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Filter by Registration Type</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['all', 'regular', 'student', 'international', 'faculty'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTypes([...selectedTypes, type])
                                } else {
                                  setSelectedTypes(selectedTypes.filter(t => t !== type))
                                }
                              }}
                            />
                            <Label htmlFor={`type-${type}`} className="capitalize">
                              {type === 'all' ? 'All Types' : type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Filter by Payment Status</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['all', 'paid', 'pending', 'failed'].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStatuses([...selectedStatuses, status])
                                } else {
                                  setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                                }
                              }}
                            />
                            <Label htmlFor={`status-${status}`} className="capitalize">
                              {status === 'all' ? 'All Statuses' : status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => loadRecipients()}
                      disabled={isLoadingRecipients}
                      className="w-full"
                    >
                      {isLoadingRecipients ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading Recipients...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Load Recipients ({filteredRecipients.length})
                        </>
                      )}
                    </Button>

                    {filteredRecipients.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                        <p className="text-sm font-medium mb-2">
                          {filteredRecipients.length} recipients selected:
                        </p>
                        <div className="space-y-1 text-xs">
                          {filteredRecipients.slice(0, 10).map((recipient, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{recipient.name}</span>
                              <span className="text-muted-foreground">{recipient.registrationType}</span>
                            </div>
                          ))}
                          {filteredRecipients.length > 10 && (
                            <p className="text-muted-foreground">
                              ...and {filteredRecipients.length - 10} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {filteredRecipients.length > 0 && (
                    <>Ready to send to {filteredRecipients.length} recipients</>
                  )}
                </div>
                <Button
                  onClick={() => sendBulkEmail()}
                  disabled={isSendingEmail || !emailSubject || !emailContent || filteredRecipients.length === 0}
                  className="min-w-[120px]"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Registration Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registration Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Registrations</span>
                    <span className="font-medium">{dashboardStats.totalRegistrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Paid</span>
                    <span className="font-medium text-green-600">{dashboardStats.paidRegistrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-yellow-600">{dashboardStats.pendingPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Workshops</span>
                    <span className="font-medium">{dashboardStats.workshopRegistrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accompanying</span>
                    <span className="font-medium">{dashboardStats.accompanyingPersons}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleExportRegistrations}
                  className="w-full"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Registrations
                </Button>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-medium text-green-600">
                      ₹{dashboardStats.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. per Registration</span>
                    <span className="font-medium">
                      ₹{dashboardStats.totalRegistrations > 0 
                        ? Math.round(dashboardStats.totalRevenue / dashboardStats.totalRegistrations).toLocaleString()
                        : '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Success Rate</span>
                    <span className="font-medium">
                      {dashboardStats.totalRegistrations > 0 
                        ? Math.round((dashboardStats.paidRegistrations / dashboardStats.totalRegistrations) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handleExportPayments}
                  className="w-full"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Payments
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab("emails")}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Bulk Email
                </Button>
                <Button 
                  onClick={() => setActiveTab("config")}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Settings
                </Button>
                <Button 
                  onClick={fetchDashboardData}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Registration Categories Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Categories Breakdown</CardTitle>
              <CardDescription>Distribution of registrations by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardStats.registrationsByCategory || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{count || 0}</span>
                      <span className="text-sm text-muted-foreground">
                        ({dashboardStats.totalRegistrations > 0 
                          ? Math.round(((count || 0) / dashboardStats.totalRegistrations) * 100)
                          : 0
                        }%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Registration Trends</CardTitle>
              <CardDescription>Registration activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dashboardStats.dailyRegistrations || []).slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 bg-blue-500 rounded"
                        style={{ 
                          width: `${Math.max(10, ((day.count || 0) / Math.max(...(dashboardStats.dailyRegistrations || []).map(d => d.count || 0), 1)) * 100)}px` 
                        }}
                      ></div>
                      <span className="font-medium w-8 text-right">{day.count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Subscriptions
              </CardTitle>
              <CardDescription>
                Manage email notification subscriptions for conference updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Notification subscriptions management
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  For detailed notification management, visit the dedicated notifications page
                </p>
                <Button 
                  onClick={() => window.open('/admin/notifications', '_blank')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Open Notifications Manager
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <ContactMessagesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}