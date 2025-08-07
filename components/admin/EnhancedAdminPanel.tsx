"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Gift,
  Award,
  MessageCircle,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  Star
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    paymentDate?: string
    paymentType?: 'regular' | 'complementary' | 'sponsored'
    sponsorName?: string
    sponsorCategory?: string
    paymentRemarks?: string
  }
  adminRemarks?: string
  role: string
  createdAt: string
}

export function EnhancedAdminPanel() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [adminRemarks, setAdminRemarks] = useState("")
  const [isComplimentary, setIsComplimentary] = useState(false)
  const [isSponsored, setIsSponsored] = useState(false)
  const [sponsorName, setSponsorName] = useState("")

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter, paymentTypeFilter])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/registrations')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRegistrations(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(reg => reg.registration.status === statusFilter)
    }

    // Payment type filter
    if (paymentTypeFilter !== "all") {
      if (paymentTypeFilter === "complementary") {
        filtered = filtered.filter(reg => 
          reg.registration.type === 'complimentary' || 
          reg.registration.paymentType === 'complementary'
        )
      } else if (paymentTypeFilter === "sponsored") {
        filtered = filtered.filter(reg => 
          reg.registration.type === 'sponsored' || 
          reg.registration.paymentType === 'sponsored'
        )
      } else if (paymentTypeFilter === "regular") {
        filtered = filtered.filter(reg => 
          reg.registration.paymentType === 'regular' || 
          (!reg.registration.paymentType && 
           reg.registration.type !== 'complimentary' && 
           reg.registration.type !== 'sponsored')
        )
      }
    }

    setFilteredRegistrations(filtered)
  }

  const handleAcceptWithoutPayment = async (registrationId: string) => {
    try {
      const response = await fetch('/api/admin/accept-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationId,
          acceptWithoutPayment: true,
          adminRemarks: "Accepted without payment by admin"
        })
      })

      if (response.ok) {
        toast({
          title: "Registration Accepted",
          description: "Registration has been accepted without payment requirement."
        })
        fetchRegistrations()
      } else {
        throw new Error('Failed to accept registration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept registration",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration) return

    try {
      const response = await fetch(`/api/admin/registrations/${selectedRegistration._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Registration Deleted",
          description: "Registration has been permanently deleted."
        })
        setIsDeleteModalOpen(false)
        setSelectedRegistration(null)
        fetchRegistrations()
      } else {
        throw new Error('Failed to delete registration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRegistration = async () => {
    if (!selectedRegistration) return

    try {
      // Prepare update data with correct field mapping
      const updateData: any = {
        adminRemarks,
        'registration.status': isComplimentary || isSponsored ? 'paid' : selectedRegistration.registration.status
      }

      // Set registration type and payment type based on selection
      if (isComplimentary) {
        updateData['registration.type'] = 'complimentary'
        updateData['registration.paymentType'] = 'complementary'
        updateData['registration.paymentDate'] = new Date().toISOString()
        updateData['registration.sponsorName'] = ''
        updateData['registration.sponsorCategory'] = ''
      } else if (isSponsored) {
        updateData['registration.type'] = 'sponsored'
        updateData['registration.paymentType'] = 'sponsored'
        updateData['registration.paymentDate'] = new Date().toISOString()
        updateData['registration.sponsorName'] = sponsorName
      } else {
        // Reset to regular if neither complementary nor sponsored
        updateData['registration.paymentType'] = 'regular'
        updateData['registration.sponsorName'] = ''
        updateData['registration.sponsorCategory'] = ''
      }

      const response = await fetch(`/api/admin/registrations/${selectedRegistration._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({
          title: "Registration Updated",
          description: "Registration details have been updated successfully."
        })
        setIsEditModalOpen(false)
        setSelectedRegistration(null)
        resetForm()
        fetchRegistrations()
      } else {
        throw new Error('Failed to update registration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update registration",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setAdminRemarks("")
    setIsComplimentary(false)
    setIsSponsored(false)
    setSponsorName("")
  }

  const openEditModal = (registration: Registration) => {
    setSelectedRegistration(registration)
    setAdminRemarks(registration.adminRemarks || "")
    setIsComplimentary(registration.registration.type === 'complimentary' || registration.registration.paymentType === 'complementary')
    setIsSponsored(registration.registration.type === 'sponsored' || registration.registration.paymentType === 'sponsored')
    setSponsorName(registration.registration.sponsorName || "")
    setIsEditModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    if (!status || typeof status !== 'string') {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
    
    switch (status.toLowerCase()) {
      case "confirmed":
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.registration.status === 'confirmed' || r.registration.status === 'paid').length,
    pending: registrations.filter(r => r.registration.status === 'pending').length,
    complimentary: registrations.filter(r => r.registration.type === 'complimentary' || r.registration.paymentType === 'complementary').length,
    sponsored: registrations.filter(r => r.registration.type === 'sponsored' || r.registration.paymentType === 'sponsored').length
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
            Manage registrations, payments, and conference administration
          </p>
        </div>
        <Button onClick={fetchRegistrations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Complimentary</p>
                <p className="text-2xl font-bold">{stats.complimentary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sponsored</p>
                <p className="text-2xl font-bold">{stats.sponsored}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="complementary">Complementary</SelectItem>
                <SelectItem value="sponsored">Sponsored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
          <CardDescription>
            Manage all conference registrations and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Special</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell className="font-medium">
                      {registration.registrationId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {registration.profile.title} {registration.profile.firstName} {registration.profile.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.profile.institution}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {registration.registration.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(registration.registration.status)}>
                        {registration.registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(registration.registration.status)}>
                        {registration.registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(registration.registration.registrationDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(registration.registration.type === 'complimentary' || registration.registration.paymentType === 'complementary') && (
                          <Badge variant="secondary" className="text-xs">
                            <Gift className="h-3 w-3 mr-1" />
                            Comp
                          </Badge>
                        )}
                        {(registration.registration.type === 'sponsored' || registration.registration.paymentType === 'sponsored') && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Sponsor
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(registration)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          {registration.registration.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleAcceptWithoutPayment(registration._id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Without Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setIsDeleteModalOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Registration
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

      {/* Edit Registration Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
            <DialogDescription>
              Update registration details, add remarks, or mark as complimentary/sponsored
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6">
              {/* Registration Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Registration Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {selectedRegistration.profile.title} {selectedRegistration.profile.firstName} {selectedRegistration.profile.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedRegistration.email}
                  </div>
                  <div>
                    <strong>Registration ID:</strong> {selectedRegistration.registrationId}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedRegistration.registration.type}
                  </div>
                </div>
              </div>

              {/* Admin Remarks */}
              <div className="space-y-2">
                <Label htmlFor="adminRemarks">Admin Remarks</Label>
                <Textarea
                  id="adminRemarks"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Add any remarks or notes about this registration..."
                  rows={3}
                />
              </div>

              {/* Special Status */}
              <div className="space-y-4">
                <h3 className="font-semibold">Special Status</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="complimentary"
                    checked={isComplimentary}
                    onCheckedChange={(checked) => setIsComplimentary(!!checked)}
                  />
                  <Label htmlFor="complimentary" className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span>Mark as Complimentary</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sponsored"
                      checked={isSponsored}
                      onCheckedChange={(checked) => setIsSponsored(!!checked)}
                    />
                    <Label htmlFor="sponsored" className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span>Mark as Sponsored</span>
                    </Label>
                  </div>
                  
                  {isSponsored && (
                    <div className="ml-6">
                      <Label htmlFor="sponsorName">Sponsor Name</Label>
                      <Input
                        id="sponsorName"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="Enter sponsor name"
                      />
                    </div>
                  )}
                </div>

                {(isComplimentary || isSponsored) && (
                  <Alert>
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                      This registration will be automatically marked as confirmed and payment requirement will be waived.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRegistration}>
              Update Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm">
                <strong>Registration:</strong> {selectedRegistration.registrationId}<br/>
                <strong>Name:</strong> {selectedRegistration.profile.firstName} {selectedRegistration.profile.lastName}<br/>
                <strong>Email:</strong> {selectedRegistration.email}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRegistration}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}