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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  MoreVertical,
  Plus,
  Upload,
  FileSpreadsheet,
  Save,
  X,
  DollarSign,
  Gift,
  Award,
  MapPin,
  BookOpen,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmailDialog } from "@/components/admin/EmailDialog"

// Workshop Selection Editor Component
interface WorkshopSelectionEditorProps {
  selectedWorkshops: string[]
  onSelectionChange: (workshops: string[]) => void
}

function WorkshopSelectionEditor({ selectedWorkshops, onSelectionChange }: WorkshopSelectionEditorProps) {
  const [availableWorkshops, setAvailableWorkshops] = useState([
    { id: "brain-surgery", label: "Advanced Brain Surgery Techniques" },
    { id: "spinal-injury", label: "Spinal Cord Injury Management" },
    { id: "pediatric-neurotrauma", label: "Pediatric Neurotrauma" },
    { id: "minimally-invasive", label: "Minimally Invasive Neurosurgery" },
    { id: "neurotrauma-rehab", label: "Neurotrauma Rehabilitation" },
    { id: "emergency-neurosurgery", label: "Emergency Neurosurgery" }
  ])

  const handleWorkshopToggle = (workshopId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedWorkshops, workshopId])
    } else {
      onSelectionChange(selectedWorkshops.filter(id => id !== workshopId))
    }
  }

  return (
    <div className="space-y-3">
      {availableWorkshops.map((workshop) => (
        <div key={workshop.id} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Checkbox
            id={`workshop-${workshop.id}`}
            checked={selectedWorkshops.includes(workshop.id)}
            onCheckedChange={(checked) => handleWorkshopToggle(workshop.id, checked as boolean)}
          />
          <Label htmlFor={`workshop-${workshop.id}`} className="flex-1 cursor-pointer">
            {workshop.label}
          </Label>
        </div>
      ))}
      {selectedWorkshops.length === 0 && (
        <p className="text-sm text-gray-500 italic">No workshops selected</p>
      )}
    </div>
  )
}

// Accompanying Persons Editor Component
interface AccompanyingPersonsEditorProps {
  accompanyingPersons: Array<{
    name: string
    age: number
    relationship: string
    dietaryRequirements?: string
  }>
  onPersonsChange: (persons: Array<{
    name: string
    age: number
    relationship: string
    dietaryRequirements?: string
  }>) => void
}

function AccompanyingPersonsEditor({ accompanyingPersons, onPersonsChange }: AccompanyingPersonsEditorProps) {
  const addPerson = () => {
    onPersonsChange([
      ...accompanyingPersons,
      { name: '', age: 0, relationship: '', dietaryRequirements: '' }
    ])
  }

  const removePerson = (index: number) => {
    onPersonsChange(accompanyingPersons.filter((_, i) => i !== index))
  }

  const updatePerson = (index: number, field: string, value: any) => {
    const updated = accompanyingPersons.map((person, i) =>
      i === index ? { ...person, [field]: value } : person
    )
    onPersonsChange(updated)
  }

  return (
    <div className="space-y-4">
      {accompanyingPersons.map((person, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Person {index + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePerson(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={person.name}
                onChange={(e) => updatePerson(index, 'name', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={person.age}
                onChange={(e) => updatePerson(index, 'age', parseInt(e.target.value) || 0)}
                placeholder="Age"
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Select
                value={person.relationship}
                onValueChange={(value) => updatePerson(index, 'relationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Dietary Requirements</Label>
            <Input
              value={person.dietaryRequirements || ''}
              onChange={(e) => updatePerson(index, 'dietaryRequirements', e.target.value)}
              placeholder="Any dietary restrictions"
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addPerson}
        className="w-full"
        disabled={accompanyingPersons.length >= 5}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Accompanying Person
      </Button>

      {accompanyingPersons.length === 0 && (
        <p className="text-sm text-gray-500 italic">No accompanying persons added</p>
      )}

      {accompanyingPersons.length >= 5 && (
        <p className="text-sm text-amber-600">Maximum 5 accompanying persons allowed</p>
      )}
    </div>
  )
}

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
      dietaryRequirements?: string
    }>
    registrationDate: string
    paymentDate?: string
    paymentType?: 'regular' | 'complementary' | 'sponsored'
    sponsorName?: string
    sponsorCategory?: string
    paymentRemarks?: string
  }
  paymentInfo?: {
    amount: number
    currency: string
    transactionId: string
    status?: string
    breakdown?: {
      baseAmount?: number
      workshopFees?: Array<{ name: string; amount: number }>
      accompanyingPersonFees?: number
      discountsApplied?: Array<{ type: string; percentage: number; amount: number }>
    }
  }
}

interface NewRegistration {
  email: string
  password: string
  profile: {
    title: string
    firstName: string
    lastName: string
    phone: string
    institution: string
    designation: string
    address: {
      city: string
      state: string
      country: string
    }
    dietaryRequirements?: string
    specialNeeds?: string
  }
  registration: {
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
    paymentType?: 'regular' | 'complementary' | 'sponsored'
    sponsorName?: string
    sponsorCategory?: string
    paymentRemarks?: string
  }
  paymentInfo?: {
    amount: number
    currency: string
    status?: string
    breakdown?: {
      baseAmount?: number
      workshopFees?: Array<{ name: string; amount: number }>
      accompanyingPersonFees?: number
      discountsApplied?: Array<{ type: string; percentage: number; amount: number }>
    }
  }
}

interface RegistrationTableProps {
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  workshopFilter?: string
  paymentTypeFilter?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

export function RegistrationTable({
  searchTerm = "",
  statusFilter = "all",
  typeFilter = "all",
  workshopFilter = "all",
  paymentTypeFilter = "all",
  onSelectionChange
}: RegistrationTableProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null)
  const [newRegistration, setNewRegistration] = useState<NewRegistration>({
    email: "",
    password: "",
    profile: {
      title: "",
      firstName: "",
      lastName: "",
      phone: "",
      institution: "",
      designation: "",
      address: {
        city: "",
        state: "",
        country: "India"
      }
    },
    registration: {
      type: "ntsi-member",
      status: "pending",
      workshopSelections: [],
      accompanyingPersons: []
    }
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [paymentData, setPaymentData] = useState({
    paymentType: 'regular' as 'regular' | 'complementary' | 'sponsored',
    sponsorName: '',
    sponsorCategory: '',
    paymentRemarks: '',
    amount: 0
  })
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [selectedRegistrationForEmail, setSelectedRegistrationForEmail] = useState<Registration | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter, typeFilter, workshopFilter, paymentTypeFilter])

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

    // Workshop filter
    if (workshopFilter !== "all") {
      if (workshopFilter === "no-workshop") {
        filtered = filtered.filter(reg => 
          !reg.registration.workshopSelections || 
          reg.registration.workshopSelections.length === 0
        )
      } else {
        filtered = filtered.filter(reg => 
          reg.registration.workshopSelections && 
          reg.registration.workshopSelections.includes(workshopFilter)
        )
      }
    }

    // Payment type filter
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter(reg => {
        const paymentType = reg.registration.paymentType || 'regular'
        return paymentType === paymentTypeFilter
      })
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

  const handleEditRegistration = (registration: Registration) => {
    setEditingRegistration({ ...registration })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingRegistration) return

    try {
      // Sync paymentType with registration type for complementary and sponsored
      const updatedRegistration = { ...editingRegistration }
      if (updatedRegistration.registration.type === 'complementary') {
        updatedRegistration.registration.paymentType = 'complementary'
        updatedRegistration.registration.status = 'paid'
        updatedRegistration.registration.paymentDate = new Date().toISOString()
      } else if (updatedRegistration.registration.type === 'sponsored') {
        updatedRegistration.registration.paymentType = 'sponsored'
        updatedRegistration.registration.status = 'paid'
        updatedRegistration.registration.paymentDate = new Date().toISOString()
      } else {
        updatedRegistration.registration.paymentType = 'regular'
      }

      const response = await fetch(`/api/admin/registrations/${editingRegistration._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedRegistration)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Registration Updated",
          description: "Registration has been updated successfully."
        })
        setIsEditOpen(false)
        setEditingRegistration(null)
        fetchRegistrations()
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update registration",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Edit error:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the registration",
        variant: "destructive"
      })
    }
  }

  const handleAddRegistration = async () => {
    try {
      const response = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRegistration)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Registration Added",
          description: "New registration has been created successfully."
        })
        setIsAddOpen(false)
        setNewRegistration({
          email: "",
          password: "",
          profile: {
            title: "",
            firstName: "",
            lastName: "",
            phone: "",
            institution: "",
            designation: "",
            address: {
              city: "",
              state: "",
              country: "India"
            }
          },
          registration: {
            type: "ntsi-member",
            status: "pending",
            workshopSelections: [],
            accompanyingPersons: []
          }
        })
        fetchRegistrations()
      } else {
        toast({
          title: "Add Failed",
          description: data.message || "Failed to add registration",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Add error:", error)
      toast({
        title: "Error",
        description: "An error occurred while adding the registration",
        variant: "destructive"
      })
    }
  }

  const handleImportRegistrations = async () => {
    if (!importFile) return

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const response = await fetch("/api/admin/registrations/import", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Import Successful",
          description: `${data.imported} registrations imported successfully.`
        })
        setIsImportOpen(false)
        setImportFile(null)
        fetchRegistrations()
      } else {
        toast({
          title: "Import Failed",
          description: data.message || "Failed to import registrations",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Error",
        description: "An error occurred during import",
        variant: "destructive"
      })
    }
  }

  const handleMarkAsPaid = (registration: Registration) => {
    setSelectedRegistration(registration)
    setPaymentData({
      paymentType: registration.registration.paymentType || 'regular',
      sponsorName: registration.registration.sponsorName || '',
      sponsorCategory: registration.registration.sponsorCategory || '',
      paymentRemarks: registration.registration.paymentRemarks || '',
      amount: registration.paymentInfo?.amount || 0
    })
    setIsPaymentOpen(true)
  }

  const handleSavePayment = async () => {
    if (!selectedRegistration) return

    try {
      // Determine status based on payment type
      let status = "pending"
      if (paymentData.paymentType === 'complementary' || paymentData.paymentType === 'sponsored') {
        status = "paid" // Complementary and sponsored are automatically paid
      } else if (paymentData.amount && parseFloat(paymentData.amount.toString()) > 0) {
        status = "paid" // Regular payment with amount
      }

      const response = await fetch(`/api/admin/registrations/${selectedRegistration._id}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          paymentType: paymentData.paymentType,
          sponsorName: paymentData.sponsorName,
          sponsorCategory: paymentData.sponsorCategory,
          paymentRemarks: paymentData.paymentRemarks,
          amount: paymentData.amount
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Payment Updated",
          description: "Payment status has been updated successfully."
        })
        setIsPaymentOpen(false)
        setSelectedRegistration(null)
        fetchRegistrations()
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update payment status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Payment update error:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating payment status",
        variant: "destructive"
      })
    }
  }

  const downloadTemplate = () => {
    const template = `Title,First Name,Last Name,Email,Phone,Designation,Institution,City,State,Country,Registration Type,Membership Number,Dietary Requirements,Special Needs
Dr.,John,Doe,john.doe@example.com,+1234567890,Consultant,Example Hospital,New York,NY,USA,ntsi-member,,Vegetarian,None
Prof.,Jane,Smith,jane.smith@example.com,+0987654321,Consultant,Medical College,Los Angeles,CA,USA,non-member,MED123,None,Wheelchair access
Dr.,Alice,Johnson,alice.johnson@example.com,+1122334455,PG/Student,University Hospital,Boston,MA,USA,pg-student,,None,None`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'registration-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded."
    })
  }

  const handleSendEmail = (registration: Registration | null) => {
    if (!registration) return
    setSelectedRegistrationForEmail(registration)
    setIsEmailDialogOpen(true)
  }

  const handleSendInvoice = async (registration: Registration | null) => {
    if (!registration) return

    try {
      const response = await fetch(`/api/admin/registrations/${registration._id}/send-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Invoice Sent",
          description: "Invoice has been sent successfully to the participant."
        })
      } else {
        toast({
          title: "Invoice Failed",
          description: data.message || "Failed to send invoice",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Send invoice error:", error)
      toast({
        title: "Error",
        description: "An error occurred while sending invoice",
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
      case "ntsi-member": return "NTSI Member"
      case "non-member": return "Non Member"
      case "pg-student": return "PG Student"
      case "complimentary": return "Complimentary"
      case "sponsored": return "Sponsored"
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Add Registration clicked')
                  setIsAddOpen(true)
                }}
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
                <span className="hidden lg:inline">Registration</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Import clicked')
                  setIsImportOpen(true)
                }}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              {selectedRegistrations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email ({selectedRegistrations.length})</span>
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

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
              {filteredRegistrations.map((registration) => (
                <Card key={registration._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(registration._id)}
                        onChange={(e) => handleSelectRegistration(registration._id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedRegistration(registration)
                          setIsDetailsOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRegistration(registration)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Registration
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(registration)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Registration
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="font-medium">
                        {registration.profile.title} {registration.profile.firstName} {registration.profile.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{registration.email}</div>
                      <div className="text-xs text-gray-500">{registration.profile.institution}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-orange-50"
                        onClick={() => {
                          setSelectedRegistration(registration)
                          setIsDetailsOpen(true)
                        }}
                      >
                        {registration.registration.registrationId}
                      </Badge>
                      <Badge variant="secondary">
                        {getTypeLabel(registration.registration.type)}
                      </Badge>
                      <Badge className={`${getStatusColor(registration.registration.status)} flex items-center gap-1`}>
                        {getStatusIcon(registration.registration.status)}
                        {registration.registration.status.charAt(0).toUpperCase() + registration.registration.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div>Registered: {new Date(registration.registration.registrationDate).toLocaleDateString()}</div>
                      {registration.paymentInfo && (
                        <div>Payment: {formatCurrency(registration.paymentInfo.amount, registration.paymentInfo.currency)}</div>
                      )}
                      {registration.registration.paymentType && registration.registration.paymentType !== 'regular' && (
                        <div className="flex items-center gap-1 mt-1">
                          {registration.registration.paymentType === 'complementary' ? (
                            <Gift className="h-3 w-3 text-green-600" />
                          ) : (
                            <Award className="h-3 w-3 text-blue-600" />
                          )}
                          <span className="text-xs capitalize">{registration.registration.paymentType}</span>
                          {registration.registration.sponsorName && (
                            <span className="text-xs">- {registration.registration.sponsorName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border">
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
                          <Badge
                            variant="outline"
                            className="mb-1 cursor-pointer hover:bg-orange-50"
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setIsDetailsOpen(true)
                            }}
                          >
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
                            {registration.registration.paymentType && registration.registration.paymentType !== 'regular' && (
                              <div className="flex items-center gap-1 mt-1">
                                {registration.registration.paymentType === 'complementary' ? (
                                  <Gift className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Award className="h-3 w-3 text-blue-600" />
                                )}
                                <span className="text-xs capitalize">{registration.registration.paymentType}</span>
                              </div>
                            )}
                            {registration.registration.sponsorName && (
                              <div className="text-xs text-gray-500">
                                Sponsor: {registration.registration.sponsorName}
                              </div>
                            )}
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
                            <DropdownMenuItem onClick={() => handleEditRegistration(registration)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Registration
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(registration)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Mark as Paid
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

      {/* Enhanced Registration Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Registration Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedRegistration?.profile.firstName} {selectedRegistration?.profile.lastName}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendEmail(selectedRegistration)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendInvoice(selectedRegistration)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Send Invoice
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* Registration Summary Card */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {selectedRegistration.profile.title} {selectedRegistration.profile.firstName} {selectedRegistration.profile.lastName}
                      </h2>
                      <p className="text-orange-600 dark:text-orange-300 font-medium">
                        {selectedRegistration.profile.institution}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {selectedRegistration.registration.registrationId}
                        </Badge>
                        <Badge className={`${getStatusColor(selectedRegistration.registration.status)} text-sm`}>
                          {getStatusIcon(selectedRegistration.registration.status)}
                          {selectedRegistration.registration.status.charAt(0).toUpperCase() + selectedRegistration.registration.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Registration Type</div>
                      <div className="text-lg font-semibold">{getTypeLabel(selectedRegistration.registration.type)}</div>
                      {selectedRegistration.paymentInfo && (
                        <div className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(selectedRegistration.paymentInfo.amount, selectedRegistration.paymentInfo.currency)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Full Name:</span>
                        <p className="font-medium">
                          {selectedRegistration.profile.title} {selectedRegistration.profile.firstName} {selectedRegistration.profile.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium text-blue-600">{selectedRegistration.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedRegistration.profile.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Institution:</span>
                        <p className="font-medium">{selectedRegistration.profile.institution}</p>
                      </div>
                    </div>

                    {selectedRegistration.profile.address && (
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="font-medium">
                          {[
                            selectedRegistration.profile.address.city,
                            selectedRegistration.profile.address.state,
                            selectedRegistration.profile.address.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    {selectedRegistration.registration.membershipNumber && (
                      <div>
                        <span className="text-sm text-gray-600">Membership Number:</span>
                        <p className="font-medium">{selectedRegistration.registration.membershipNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Registration Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      Registration Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Registration Date:</span>
                        <p className="font-medium">
                          {new Date(selectedRegistration.registration.registrationDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Registration Type:</span>
                        <p className="font-medium">{getTypeLabel(selectedRegistration.registration.type)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <Badge className={`${getStatusColor(selectedRegistration.registration.status)} w-fit`}>
                          {getStatusIcon(selectedRegistration.registration.status)}
                          {selectedRegistration.registration.status.charAt(0).toUpperCase() + selectedRegistration.registration.status.slice(1)}
                        </Badge>
                      </div>
                      {selectedRegistration.registration.paymentDate && (
                        <div>
                          <span className="text-sm text-gray-600">Payment Date:</span>
                          <p className="font-medium">
                            {new Date(selectedRegistration.registration.paymentDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Workshop Selections */}
              {selectedRegistration.registration.workshopSelections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-500" />
                      Workshop Selections ({selectedRegistration.registration.workshopSelections.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRegistration.registration.workshopSelections.map((workshop, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">{workshop}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Accompanying Persons */}
              {selectedRegistration.registration.accompanyingPersons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" />
                      Accompanying Persons ({selectedRegistration.registration.accompanyingPersons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRegistration.registration.accompanyingPersons.map((person, index) => (
                        <div key={index} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">{person.name}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Age: {person.age}</span>
                                <span>Relationship: {person.relationship}</span>
                              </div>
                              {person.dietaryRequirements && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Dietary Requirements:</span>
                                  <p className="text-sm">{person.dietaryRequirements}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              {selectedRegistration.paymentInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedRegistration.paymentInfo.amount, selectedRegistration.paymentInfo.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Transaction ID:</span>
                          <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {selectedRegistration.paymentInfo.transactionId}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Payment Status:</span>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {selectedRegistration.paymentInfo.status}
                          </Badge>
                        </div>
                      </div>

                      {selectedRegistration.paymentInfo.breakdown && (
                        <div>
                          <h4 className="font-semibold mb-3">Payment Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Registration Fee:</span>
                              <span className="font-medium">₹{selectedRegistration.paymentInfo.breakdown.baseAmount?.toLocaleString()}</span>
                            </div>
                            {selectedRegistration.paymentInfo.breakdown.workshopFees && selectedRegistration.paymentInfo.breakdown.workshopFees.length > 0 && (
                              <div className="flex justify-between">
                                <span>Workshop Fees:</span>
                                <span className="font-medium">
                                  ₹{selectedRegistration.paymentInfo.breakdown.workshopFees.reduce((sum: number, w: any) => sum + w.amount, 0).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {selectedRegistration.paymentInfo.breakdown.accompanyingPersonFees && selectedRegistration.paymentInfo.breakdown.accompanyingPersonFees > 0 && (
                              <div className="flex justify-between">
                                <span>Accompanying Persons:</span>
                                <span className="font-medium">₹{selectedRegistration.paymentInfo.breakdown.accompanyingPersonFees.toLocaleString()}</span>
                              </div>
                            )}
                            {selectedRegistration.paymentInfo.breakdown.discountsApplied && selectedRegistration.paymentInfo.breakdown.discountsApplied.length > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount Applied:</span>
                                <span className="font-medium">
                                  -₹{selectedRegistration.paymentInfo.breakdown.discountsApplied.reduce((sum: number, d: any) => sum + d.amount, 0).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Special Requirements */}
              {(selectedRegistration.profile.dietaryRequirements || selectedRegistration.profile.specialNeeds) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Special Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRegistration.profile.dietaryRequirements && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Dietary Requirements:</span>
                        <p className="mt-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                          {selectedRegistration.profile.dietaryRequirements}
                        </p>
                      </div>
                    )}
                    {selectedRegistration.profile.specialNeeds && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Special Needs:</span>
                        <p className="mt-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                          {selectedRegistration.profile.specialNeeds}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Type Information */}
              {selectedRegistration.registration.paymentType && selectedRegistration.registration.paymentType !== 'regular' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedRegistration.registration.paymentType === 'complementary' ? (
                        <Gift className="h-5 w-5 text-green-500" />
                      ) : (
                        <Award className="h-5 w-5 text-blue-500" />
                      )}
                      {selectedRegistration.registration.paymentType === 'complementary' ? 'Complementary Registration' : 'Sponsored Registration'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Payment Type:</span>
                        <Badge className={selectedRegistration.registration.paymentType === 'complementary' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {selectedRegistration.registration.paymentType.charAt(0).toUpperCase() + selectedRegistration.registration.paymentType.slice(1)}
                        </Badge>
                      </div>
                      {selectedRegistration.registration.sponsorName && (
                        <div>
                          <span className="text-sm text-gray-600">Sponsor Name:</span>
                          <p className="font-medium">{selectedRegistration.registration.sponsorName}</p>
                        </div>
                      )}
                      {selectedRegistration.registration.sponsorCategory && (
                        <div>
                          <span className="text-sm text-gray-600">Sponsor Category:</span>
                          <p className="font-medium">{selectedRegistration.registration.sponsorCategory}</p>
                        </div>
                      )}
                      {selectedRegistration.registration.paymentRemarks && (
                        <div>
                          <span className="text-sm text-gray-600">Remarks:</span>
                          <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {selectedRegistration.registration.paymentRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => selectedRegistration && handleEditRegistration(selectedRegistration)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Registration
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedRegistration && handleMarkAsPaid(selectedRegistration)}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Update Payment
              </Button>
            </div>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
            <DialogDescription>
              Update registration information for {editingRegistration?.profile.firstName} {editingRegistration?.profile.lastName}
            </DialogDescription>
          </DialogHeader>

          {editingRegistration && (
            <div className="space-y-4">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Select
                        value={editingRegistration.profile.title}
                        onValueChange={(value) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, title: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Prof.">Prof.</SelectItem>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        value={editingRegistration.profile.firstName}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, firstName: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        value={editingRegistration.profile.lastName}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, lastName: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingRegistration.email}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          email: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        value={editingRegistration.profile.phone}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-institution">Institution</Label>
                      <Input
                        id="edit-institution"
                        value={editingRegistration.profile.institution}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, institution: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-city">City</Label>
                      <Input
                        id="edit-city"
                        value={editingRegistration.profile.address?.city || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: {
                            ...editingRegistration.profile,
                            address: {
                              ...editingRegistration.profile.address,
                              city: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-state">State</Label>
                      <Input
                        id="edit-state"
                        value={editingRegistration.profile.address?.state || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: {
                            ...editingRegistration.profile,
                            address: {
                              ...editingRegistration.profile.address,
                              state: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-country">Country</Label>
                      <Input
                        id="edit-country"
                        value={editingRegistration.profile.address?.country || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: {
                            ...editingRegistration.profile,
                            address: {
                              ...editingRegistration.profile.address,
                              country: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Registration Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-type">Registration Type</Label>
                      <Select
                        value={editingRegistration.registration.type}
                        onValueChange={(value) => setEditingRegistration({
                          ...editingRegistration,
                          registration: { ...editingRegistration.registration, type: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ntsi-member">NTSI Member</SelectItem>
                          <SelectItem value="non-member">Non Member</SelectItem>
                          <SelectItem value="pg-student">PG Student</SelectItem>
                          <SelectItem value="complimentary">Complimentary</SelectItem>
                          <SelectItem value="sponsored">Sponsored</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={editingRegistration.registration.status}
                        onValueChange={(value) => setEditingRegistration({
                          ...editingRegistration,
                          registration: { ...editingRegistration.registration, status: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-membership">Membership Number</Label>
                      <Input
                        id="edit-membership"
                        value={editingRegistration.registration.membershipNumber || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          registration: { ...editingRegistration.registration, membershipNumber: e.target.value }
                        })}
                        placeholder="Enter membership number"
                      />
                    </div>
                  </div>
                </div>

                {/* Workshop Selections */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Workshop Selections
                  </h3>
                  <WorkshopSelectionEditor
                    selectedWorkshops={editingRegistration.registration.workshopSelections}
                    onSelectionChange={(workshops) => setEditingRegistration({
                      ...editingRegistration,
                      registration: { ...editingRegistration.registration, workshopSelections: workshops }
                    })}
                  />
                </div>

                {/* Accompanying Persons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Accompanying Persons
                  </h3>
                  <AccompanyingPersonsEditor
                    accompanyingPersons={editingRegistration.registration.accompanyingPersons}
                    onPersonsChange={(persons) => setEditingRegistration({
                      ...editingRegistration,
                      registration: { ...editingRegistration.registration, accompanyingPersons: persons }
                    })}
                  />
                </div>

                {/* Special Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Special Requirements
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-dietary">Dietary Requirements</Label>
                      <Textarea
                        id="edit-dietary"
                        value={editingRegistration.profile.dietaryRequirements || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, dietaryRequirements: e.target.value }
                        })}
                        placeholder="Any dietary restrictions or preferences"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-special">Special Needs</Label>
                      <Textarea
                        id="edit-special"
                        value={editingRegistration.profile.specialNeeds || ''}
                        onChange={(e) => setEditingRegistration({
                          ...editingRegistration,
                          profile: { ...editingRegistration.profile, specialNeeds: e.target.value }
                        })}
                        placeholder="Any accessibility requirements or special needs"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Registration Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Registration</DialogTitle>
            <DialogDescription>
              Create a new registration manually
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-title">Title</Label>
                  <Select
                    value={newRegistration.profile.title}
                    onValueChange={(value) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, title: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-firstName">First Name</Label>
                  <Input
                    id="new-firstName"
                    value={newRegistration.profile.firstName}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, firstName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-lastName">Last Name</Label>
                  <Input
                    id="new-lastName"
                    value={newRegistration.profile.lastName}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, lastName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newRegistration.email}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    value={newRegistration.profile.phone}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-institution">Institution</Label>
                  <Input
                    id="new-institution"
                    value={newRegistration.profile.institution}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, institution: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-designation">Designation</Label>
                  <Select
                    value={newRegistration.profile.designation}
                    onValueChange={(value) => setNewRegistration({
                      ...newRegistration,
                      profile: { ...newRegistration.profile, designation: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="PG/Student">PG/Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newRegistration.password}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      password: e.target.value
                    })}
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-city">City</Label>
                  <Input
                    id="new-city"
                    value={newRegistration.profile.address.city}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: {
                        ...newRegistration.profile,
                        address: { ...newRegistration.profile.address, city: e.target.value }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-state">State</Label>
                  <Input
                    id="new-state"
                    value={newRegistration.profile.address.state}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: {
                        ...newRegistration.profile,
                        address: { ...newRegistration.profile.address, state: e.target.value }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-country">Country</Label>
                  <Input
                    id="new-country"
                    value={newRegistration.profile.address.country}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      profile: {
                        ...newRegistration.profile,
                        address: { ...newRegistration.profile.address, country: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-type">Registration Type</Label>
                  <Select
                    value={newRegistration.registration.type}
                    onValueChange={(value) => setNewRegistration({
                      ...newRegistration,
                      registration: { ...newRegistration.registration, type: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ntsi-member">NTSI Member</SelectItem>
                      <SelectItem value="non-member">Non Member</SelectItem>
                      <SelectItem value="pg-student">PG Student</SelectItem>
                      <SelectItem value="complimentary">Complimentary</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-status">Status</Label>
                  <Select
                    value={newRegistration.registration.status}
                    onValueChange={(value) => setNewRegistration({
                      ...newRegistration,
                      registration: { ...newRegistration.registration, status: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-membership">Membership Number</Label>
                  <Input
                    id="new-membership"
                    value={newRegistration.registration.membershipNumber || ''}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      registration: { ...newRegistration.registration, membershipNumber: e.target.value }
                    })}
                    placeholder="Enter membership number"
                  />
                </div>
                <div>
                  <Label htmlFor="new-paymentType">Payment Type</Label>
                  <Select
                    value={newRegistration.registration.paymentType || 'regular'}
                    onValueChange={(value) => setNewRegistration({
                      ...newRegistration,
                      registration: { ...newRegistration.registration, paymentType: value as 'regular' | 'complementary' | 'sponsored' }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="complementary">Complementary</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newRegistration.registration.paymentType === 'sponsored' && (
                  <>
                    <div>
                      <Label htmlFor="new-sponsorName">Sponsor Name</Label>
                      <Input
                        id="new-sponsorName"
                        value={newRegistration.registration.sponsorName || ''}
                        onChange={(e) => setNewRegistration({
                          ...newRegistration,
                          registration: { ...newRegistration.registration, sponsorName: e.target.value }
                        })}
                        placeholder="Enter sponsor name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-sponsorCategory">Sponsor Category</Label>
                      <Input
                        id="new-sponsorCategory"
                        value={newRegistration.registration.sponsorCategory || ''}
                        onChange={(e) => setNewRegistration({
                          ...newRegistration,
                          registration: { ...newRegistration.registration, sponsorCategory: e.target.value }
                        })}
                        placeholder="Enter sponsor category"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="new-paymentRemarks">Payment Remarks</Label>
                  <Input
                    id="new-paymentRemarks"
                    value={newRegistration.registration.paymentRemarks || ''}
                    onChange={(e) => setNewRegistration({
                      ...newRegistration,
                      registration: { ...newRegistration.registration, paymentRemarks: e.target.value }
                    })}
                    placeholder="Additional payment notes"
                  />
                </div>
              </div>
            </div>

            {/* Workshop Selections */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Workshop Selections</h3>
              <WorkshopSelectionEditor
                selectedWorkshops={newRegistration.registration.workshopSelections}
                onSelectionChange={(workshops) => setNewRegistration({
                  ...newRegistration,
                  registration: { ...newRegistration.registration, workshopSelections: workshops }
                })}
              />
            </div>

            {/* Accompanying Persons */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Accompanying Persons</h3>
              <AccompanyingPersonsEditor
                accompanyingPersons={newRegistration.registration.accompanyingPersons}
                onPersonsChange={(persons) => setNewRegistration({
                  ...newRegistration,
                  registration: { ...newRegistration.registration, accompanyingPersons: persons }
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRegistration}>
              <Plus className="h-4 w-4 mr-2" />
              Add Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Registrations</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple registrations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">CSV File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Template Format</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download the template to see the required format for importing registrations.
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportRegistrations} disabled={!importFile}>
              <Upload className="h-4 w-4 mr-2" />
              Import Registrations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Management Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Update payment status and details for {selectedRegistration?.profile.firstName} {selectedRegistration?.profile.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={paymentData.paymentType}
                onValueChange={(value: 'regular' | 'complementary' | 'sponsored') =>
                  setPaymentData({ ...paymentData, paymentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Payment</SelectItem>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentData.paymentType === 'sponsored' && (
              <>
                <div>
                  <Label htmlFor="sponsor-name">Sponsor Name</Label>
                  <Input
                    id="sponsor-name"
                    value={paymentData.sponsorName}
                    onChange={(e) => setPaymentData({ ...paymentData, sponsorName: e.target.value })}
                    placeholder="Enter sponsor name"
                  />
                </div>
                <div>
                  <Label htmlFor="sponsor-category">Sponsor Category</Label>
                  <Select
                    value={paymentData.sponsorCategory}
                    onValueChange={(value) => setPaymentData({ ...paymentData, sponsorCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platinum">Platinum Sponsor</SelectItem>
                      <SelectItem value="gold">Gold Sponsor</SelectItem>
                      <SelectItem value="silver">Silver Sponsor</SelectItem>
                      <SelectItem value="bronze">Bronze Sponsor</SelectItem>
                      <SelectItem value="exhibitor">Exhibitor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="payment-remarks">Remarks</Label>
              <Textarea
                id="payment-remarks"
                value={paymentData.paymentRemarks}
                onChange={(e) => setPaymentData({ ...paymentData, paymentRemarks: e.target.value })}
                placeholder="Additional remarks or notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      {selectedRegistrationForEmail && (
        <EmailDialog
          isOpen={isEmailDialogOpen}
          registration={selectedRegistrationForEmail}
          onClose={() => {
            setIsEmailDialogOpen(false)
            setSelectedRegistrationForEmail(null)
          }}
          onEmailSent={() => {
            setIsEmailDialogOpen(false)
            setSelectedRegistrationForEmail(null)
          }}
        />
      )}
    </motion.div>
  )
}