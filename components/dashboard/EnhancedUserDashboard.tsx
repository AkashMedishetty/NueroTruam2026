"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  CreditCard, 
  FileText, 
  Calendar, 
  MapPin, 
  Mail,
  Phone,
  Building,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Edit,
  RefreshCw,
  Eye,
  Star,
  Award,
  BookOpen,
  UserCheck,
  DollarSign,
  Receipt,
  QrCode,
  Share2
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  _id: string
  email: string
  profile: {
    title: string
    firstName: string
    lastName: string
    phone: string
    institution: string
    address: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    profilePicture?: string
    dietaryRequirements?: string
    specialNeeds?: string
  }
  registration: {
    registrationId: string
    type: string
    status: string
    membershipNumber?: string
    workshopSelections: string[]
    accompanyingPersons: Array<{
      name: string
      age: number
      relationship: string
      dietaryRequirements?: string
    }>
    registrationDate: string
    paymentDate?: string
  }
  role: string
  createdAt: string
}

interface PaymentData {
  _id: string
  amount: {
    total: number
    currency: string
    registration: number
    workshops: number
    accompanyingPersons: number
    discount: number
  }
  breakdown: {
    registrationType: string
    baseAmount: number
    workshopFees: Array<{
      name: string
      amount: number
    }>
    accompanyingPersonFees: number
    discountsApplied: Array<{
      type: string
      code?: string
      percentage: number
      amount: number
    }>
  }
  status: string
  transactionDate: string
  razorpayPaymentId: string
  invoiceGenerated: boolean
  invoicePath?: string
}

export function EnhancedUserDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const fetchUserData = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) {
        setRefreshing(true)
        toast({
          title: "Refreshing Data",
          description: "Updating your dashboard information..."
        })
      }

      const [userResponse, paymentResponse] = await Promise.all([
        fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('/api/user/payments', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      ])

      if (userResponse.ok) {
        const userResult = await userResponse.json()
        if (userResult.success) {
          setUserData(userResult.data)
        }
      }

      if (paymentResponse.ok) {
        const paymentResult = await paymentResponse.json()
        if (paymentResult.success) {
          setPaymentData(paymentResult.payments || [])
        }
      }

      if (showRefreshMessage) {
        toast({
          title: "Dashboard Updated",
          description: "Your information has been refreshed successfully."
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  // Auto-refresh data when returning to tab or when payment succeeds
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        fetchUserData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [session])

  // Check URL params for payment success and refresh
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      // Wait a moment for backend to process payment
      setTimeout(() => {
        fetchUserData(true)
      }, 2000)
    }
  }, [])

  const handleDownloadInvoice = async (paymentId: string, registrationId: string) => {
    setIsDownloading(true)
    try {
      // Open invoice in new window
      const invoiceUrl = `/api/payment/invoice/${paymentId}`
      const newWindow = window.open(invoiceUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
      
      if (newWindow) {
        toast({
          title: "Invoice Opened",
          description: "Your invoice has been opened in a new window. You can print it as PDF."
        })
      } else {
        // Fallback: direct navigation if popup blocked
        window.location.href = invoiceUrl
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while opening the invoice.",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`
    }
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Date not available'
    }
  }

  const getRegistrationProgress = () => {
    if (!userData) return 0
    const steps = [
      userData.profile.firstName,
      userData.registration.registrationId,
      paymentData.some(p => p.status === 'completed')
    ]
    return (steps.filter(Boolean).length / steps.length) * 100
  }

  const getRegistrationTypeLabel = (type: string) => {
    switch (type) {
      case "regular": return "Regular Delegate"
      case "student": return "Student/Resident"
      case "international": return "International Delegate"
      case "faculty": return "Faculty Member"
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load your profile information. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  const latestPayment = paymentData.length > 0 ? paymentData[0] : null
  const isRegistrationComplete = userData.registration.status === 'paid'

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Welcome and Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Welcome back, {userData.profile.title} {userData.profile.firstName} {userData.profile.lastName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Registration ID: <span className="font-semibold">{userData.registration.registrationId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchUserData(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {userData.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Registration Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              Registration Progress
            </CardTitle>
            <CardDescription>
              Your journey to NeuroTrauma 2026 Conference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(getRegistrationProgress())}%</span>
              </div>
              <Progress value={getRegistrationProgress()} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Profile Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Registration Created</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRegistrationComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">
                    {isRegistrationComplete ? 'Payment Complete' : 'Payment Pending'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registration
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Registration Status */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-500" />
                    Registration Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-2">
                    <Badge className={getStatusColor(userData.registration.status)}>
                      {getStatusIcon(userData.registration.status)}
                      <span className="ml-1">
                        {userData.registration.status.charAt(0).toUpperCase() + userData.registration.status.slice(1)}
                      </span>
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Type: {getRegistrationTypeLabel(userData.registration.type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registered: {formatDate(userData.registration.registrationDate)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  {latestPayment ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {formatCurrency(latestPayment.amount.total, latestPayment.amount.currency)}
                      </div>
                      <Badge className={getStatusColor(latestPayment.status)}>
                        {getStatusIcon(latestPayment.status)}
                        <span className="ml-1">
                          {latestPayment.status.charAt(0).toUpperCase() + latestPayment.status.slice(1)}
                        </span>
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Paid: {formatDate(latestPayment.transactionDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-muted-foreground">Pending</div>
                      <Link href="/dashboard/payment">
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                          Complete Payment
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-950" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  {latestPayment && latestPayment.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDownloadInvoice(latestPayment._id, userData.registration.registrationId)}
                      disabled={isDownloading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isDownloading ? 'Opening...' : 'View Invoice'}
                    </Button>
                  )}
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/program">
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Conference Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Conference Information
                </CardTitle>
                <CardDescription>
                  NeuroTrauma 2026 - Annual Conference of the Neurotrauma Society of India
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="font-semibold">Dates</p>
                      <p className="text-sm text-muted-foreground">August 7-9, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">Hyderabad, Telangana</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="font-semibold">Expected Attendees</p>
                      <p className="text-sm text-muted-foreground">500+ Delegates</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="registration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  Your conference registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration ID</label>
                      <p className="text-lg font-semibold">{userData.registration.registrationId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Type</label>
                      <p className="text-lg">{getRegistrationTypeLabel(userData.registration.type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                      <p className="text-lg">{formatDate(userData.registration.registrationDate)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(userData.registration.status)}>
                          {getStatusIcon(userData.registration.status)}
                          <span className="ml-1">
                            {userData.registration.status.charAt(0).toUpperCase() + userData.registration.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    {userData.registration.membershipNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Membership Number</label>
                        <p className="text-lg">{userData.registration.membershipNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workshop Selections */}
                {userData.registration.workshopSelections && userData.registration.workshopSelections.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Selected Workshops</label>
                    <div className="mt-2 space-y-2">
                      {userData.registration.workshopSelections.map((workshop, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          <span>{workshop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accompanying Persons */}
                {userData.registration.accompanyingPersons && userData.registration.accompanyingPersons.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Accompanying Persons</label>
                    <div className="mt-2 space-y-2">
                      {userData.registration.accompanyingPersons.map((person, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <User className="h-4 w-4 text-orange-500" />
                          <span>{person.name} ({person.age} years, {person.relationship})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            {paymentData.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't made any payments yet. Complete your registration by making a payment.
                  </p>
                  <Link href="/dashboard/payment">
                    <Button>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {paymentData.map((payment, index) => (
                  <Card key={payment._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-500" />
                        Payment #{index + 1}
                      </CardTitle>
                      <CardDescription>
                        Transaction ID: {payment.razorpayPaymentId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Payment Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                          <p className="text-2xl font-bold">
                            {formatCurrency(payment.amount.total, payment.amount.currency)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Registration Type</label>
                          <p className="text-lg">
                            {getRegistrationTypeLabel(payment.breakdown?.registrationType || 'N/A')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                          <p className="text-lg">{formatDate(payment.transactionDate)}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Breakdown */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Breakdown
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Registration Fee ({getRegistrationTypeLabel(payment.breakdown?.registrationType || 'N/A')}):</span>
                            <span>{formatCurrency(payment.breakdown?.baseAmount || 0, payment.amount.currency)}</span>
                          </div>
                          
                          {payment.breakdown?.workshopFees && payment.breakdown.workshopFees.length > 0 && (
                            <>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Workshop Fees:</div>
                              {payment.breakdown.workshopFees.map((workshop, idx) => (
                                <div key={idx} className="flex justify-between ml-4 text-sm">
                                  <span>• {workshop.name}:</span>
                                  <span>{formatCurrency(workshop.amount, payment.amount.currency)}</span>
                                </div>
                              ))}
                            </>
                          )}

                          {payment.breakdown?.accompanyingPersonFees > 0 && (
                            <div className="flex justify-between">
                              <span>Accompanying Person Fees:</span>
                              <span>{formatCurrency(payment.breakdown.accompanyingPersonFees, payment.amount.currency)}</span>
                            </div>
                          )}

                          {payment.breakdown?.discountsApplied && payment.breakdown.discountsApplied.length > 0 && (
                            <>
                              <div className="text-sm font-medium text-green-700 dark:text-green-300">Discounts Applied:</div>
                              {payment.breakdown.discountsApplied.map((discount, idx) => (
                                <div key={idx} className="flex justify-between ml-4 text-sm text-green-600">
                                  <span>
                                    • {discount.type} {discount.code ? `(${discount.code})` : ''} - {discount.percentage}%:
                                  </span>
                                  <span>-{formatCurrency(discount.amount, payment.amount.currency)}</span>
                                </div>
                              ))}
                            </>
                          )}

                          <Separator />
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount Paid:</span>
                            <span>{formatCurrency(payment.amount.total, payment.amount.currency)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <div className="flex items-center justify-between pt-4">
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </Badge>
                        
                        {payment.status === 'completed' && (
                          <Button
                            onClick={() => handleDownloadInvoice(payment._id, userData.registration.registrationId)}
                            disabled={isDownloading}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading ? 'Opening...' : 'View Invoice'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p>{userData.profile.title} {userData.profile.firstName} {userData.profile.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p>{userData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p>{userData.profile.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Institution</label>
                        <p>{userData.profile.institution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                        <p>{userData.profile.address.street}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <p>{userData.profile.address.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">State</label>
                        <p>{userData.profile.address.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p>{userData.profile.address.country}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                        <p>{userData.profile.address.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(userData.profile.dietaryRequirements || userData.profile.specialNeeds) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Additional Information</h4>
                    {userData.profile.dietaryRequirements && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dietary Requirements</label>
                        <p>{userData.profile.dietaryRequirements}</p>
                      </div>
                    )}
                    {userData.profile.specialNeeds && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Special Needs</label>
                        <p>{userData.profile.specialNeeds}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/dashboard/profile">
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}