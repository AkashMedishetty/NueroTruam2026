"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users, 
  Search, 
  Filter,
  Download,
  Mail,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Phone,
  Calendar,
  MoreVertical
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Registration {
  _id: string
  email: string
  profile: {
    title: string
    firstName: string
    lastName: string
    phone: string
    institution: string
    address: {
      city: string
      state: string
      country: string
    }
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
    }>
    registrationDate: string
    paymentDate?: string
  }
  paymentInfo?: {
    amount: number
    currency: string
    transactionId: string
  }
}

interface RegistrationTableProps {
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

export function RegistrationTable({ 
  searchTerm = "",
  statusFilter = "all",
  typeFilter = "all",
  onSelectionChange
}: RegistrationTableProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRegistrations)
    }
  }, [selectedRegistrations, onSelectionChange])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/registrations")
      const data = await response.json()

      if (data.success) {
        setRegistrations(data.data)
      } else {
        setError(data.message || "Failed to fetch registrations")
      }
    } catch (error) {
      console.error("Registrations fetch error:", error)
      setError("An error occurred while fetching registrations")
    } finally {
      setIsLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = [...registrations]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registration.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.profile.institution.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(reg => reg.registration.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(reg => reg.registration.type === typeFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(filteredRegistrations.map(reg => reg._id))
    } else {
      setSelectedRegistrations([])
    }
  }

  const handleSelectRegistration = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(prev => [...prev, id])
    } else {
      setSelectedRegistrations(prev => prev.filter(regId => regId !== id))
    }
  }

  const handleStatusUpdate = async (registrationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Status Updated",
          description: "Registration status has been updated successfully."
        })
        fetchRegistrations()
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update registration status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the status",
        variant: "destructive"
      })
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/export/registrations")
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Export Started",
          description: "Registration data is being downloaded."
        })
      } else {
        toast({
          title: "Export Failed",
          description: "Unable to export registration data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during export",
        variant: "destructive"
      })
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "cancelled":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
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

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`
    }
    return `₹${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Registrations ({filteredRegistrations.length})
              </CardTitle>
              <CardDescription>
                Manage conference registrations and attendee information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              {selectedRegistrations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Selected ({selectedRegistrations.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.registration.status === 'paid').length}
                </div>
                <div className="text-xs text-gray-600">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {registrations.filter(r => r.registration.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {registrations.reduce((sum, r) => sum + r.registration.workshopSelections.length, 0)}
                </div>
                <div className="text-xs text-gray-600">Workshop Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {registrations.reduce((sum, r) => sum + r.registration.accompanyingPersons.length, 0)}
                </div>
                <div className="text-xs text-gray-600">Accompanying Persons</div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(registration._id)}
                          onChange={(e) => handleSelectRegistration(registration._id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {registration.profile.title} {registration.profile.firstName} {registration.profile.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{registration.email}</div>
                            <div className="text-xs text-gray-500">{registration.profile.institution}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {registration.registration.registrationId}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {registration.registration.workshopSelections.length} workshops
                          </div>
                          {registration.registration.accompanyingPersons.length > 0 && (
                            <div className="text-xs text-gray-500">
                              +{registration.registration.accompanyingPersons.length} accompanying
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getTypeLabel(registration.registration.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(registration.registration.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(registration.registration.status)}
                          {registration.registration.status.charAt(0).toUpperCase() + registration.registration.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(registration.registration.registrationDate).toLocaleDateString()}
                        </div>
                        {registration.registration.paymentDate && (
                          <div className="text-xs text-gray-500">
                            Paid: {new Date(registration.registration.paymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.paymentInfo ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatCurrency(registration.paymentInfo.amount, registration.paymentInfo.currency)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {registration.paymentInfo.transactionId}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(registration)
                                setIsDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(registration._id, 
                                registration.registration.status === 'paid' ? 'pending' : 'paid'
                              )}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {registration.registration.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
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

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No registrations found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedRegistration?.profile.firstName} {selectedRegistration?.profile.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">
                      {selectedRegistration.profile.title} {selectedRegistration.profile.firstName} {selectedRegistration.profile.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p>{selectedRegistration.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p>{selectedRegistration.profile.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Institution:</span>
                    <p>{selectedRegistration.profile.institution}</p>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Registration Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Registration ID:</span>
                    <p className="font-medium">{selectedRegistration.registration.registrationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p>{getTypeLabel(selectedRegistration.registration.type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(selectedRegistration.registration.status)}>
                      {selectedRegistration.registration.status.charAt(0).toUpperCase() + selectedRegistration.registration.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Registration Date:</span>
                    <p>{new Date(selectedRegistration.registration.registrationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Workshop Selections */}
              {selectedRegistration.registration.workshopSelections.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Workshop Selections</h3>
                  <div className="space-y-1">
                    {selectedRegistration.registration.workshopSelections.map((workshop, index) => (
                      <div key={index} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {workshop}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accompanying Persons */}
              {selectedRegistration.registration.accompanyingPersons.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Accompanying Persons</h3>
                  <div className="space-y-2">
                    {selectedRegistration.registration.accompanyingPersons.map((person, index) => (
                      <div key={index} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium">{person.name}</p>
                        <p className="text-gray-600">Age: {person.age}, Relationship: {person.relationship}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(selectedRegistration.profile.dietaryRequirements || selectedRegistration.profile.specialNeeds) && (
                <div>
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  {selectedRegistration.profile.dietaryRequirements && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm">Dietary Requirements:</span>
                      <p className="text-sm">{selectedRegistration.profile.dietaryRequirements}</p>
                    </div>
                  )}
                  {selectedRegistration.profile.specialNeeds && (
                    <div>
                      <span className="text-gray-600 text-sm">Special Needs:</span>
                      <p className="text-sm">{selectedRegistration.profile.specialNeeds}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Information */}
              {selectedRegistration.paymentInfo && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedRegistration.paymentInfo.amount, selectedRegistration.paymentInfo.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <p className="font-mono text-xs">{selectedRegistration.paymentInfo.transactionId}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}