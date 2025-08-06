'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Users, Calendar, Clock, MapPin } from 'lucide-react'

interface Workshop {
  _id?: string
  id: string
  name: string
  description: string
  instructor: string
  duration: string
  price: number
  currency: string
  maxSeats: number
  bookedSeats: number
  availableSeats: number
  registrationStart: string
  registrationEnd: string
  workshopDate: string
  workshopTime: string
  venue: string
  prerequisites?: string
  materials?: string
  isActive: boolean
  registrationStatus?: string
  canRegister?: boolean
}

export function WorkshopManager() {
  const { toast } = useToast()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<Workshop>>({
    id: '',
    name: '',
    description: '',
    instructor: '',
    duration: '',
    price: 0,
    currency: 'INR',
    maxSeats: 0,
    registrationStart: '',
    registrationEnd: '',
    workshopDate: '',
    workshopTime: '',
    venue: '',
    prerequisites: '',
    materials: '',
    isActive: true
  })

  useEffect(() => {
    loadWorkshops()
  }, [])

  const loadWorkshops = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/workshops')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWorkshops(result.data)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load workshops",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading workshops:', error)
      toast({
        title: "Error",
        description: "Failed to load workshops",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Success",
            description: "Workshop created successfully"
          })
          setIsCreateDialogOpen(false)
          resetForm()
          loadWorkshops()
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to create workshop",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
      toast({
        title: "Error",
        description: "Failed to create workshop",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingWorkshop) return

    try {
      const response = await fetch('/api/admin/workshops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workshopId: editingWorkshop.id,
          ...formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Success",
            description: "Workshop updated successfully"
          })
          setIsEditDialogOpen(false)
          setEditingWorkshop(null)
          resetForm()
          loadWorkshops()
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update workshop",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating workshop:', error)
      toast({
        title: "Error",
        description: "Failed to update workshop",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      instructor: '',
      duration: '',
      price: 0,
      currency: 'INR',
      maxSeats: 0,
      registrationStart: '',
      registrationEnd: '',
      workshopDate: '',
      workshopTime: '',
      venue: '',
      prerequisites: '',
      materials: '',
      isActive: true
    })
  }

  const openEditDialog = (workshop: Workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      instructor: workshop.instructor,
      duration: workshop.duration,
      price: workshop.price,
      currency: workshop.currency,
      maxSeats: workshop.maxSeats,
      registrationStart: workshop.registrationStart.split('T')[0],
      registrationEnd: workshop.registrationEnd.split('T')[0],
      workshopDate: workshop.workshopDate.split('T')[0],
      workshopTime: workshop.workshopTime,
      venue: workshop.venue,
      prerequisites: workshop.prerequisites || '',
      materials: workshop.materials || '',
      isActive: workshop.isActive
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (workshop: Workshop) => {
    if (!workshop.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    switch (workshop.registrationStatus) {
      case 'open':
        return <Badge variant="default" className="bg-green-500">Open</Badge>
      case 'full':
        return <Badge variant="destructive">Full</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const renderWorkshopForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Workshop ID *</Label>
          <Input
            value={formData.id}
            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
            placeholder="e.g., brain-surgery"
            disabled={!!editingWorkshop}
          />
        </div>
        <div>
          <Label>Workshop Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Advanced Brain Surgery"
          />
        </div>
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Workshop description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Instructor *</Label>
          <Input
            value={formData.instructor}
            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
            placeholder="Dr. John Doe"
          />
        </div>
        <div>
          <Label>Duration *</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 4 hours"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Price (₹) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            min="0"
          />
        </div>
        <div>
          <Label>Max Seats *</Label>
          <Input
            type="number"
            value={formData.maxSeats}
            onChange={(e) => setFormData(prev => ({ ...prev, maxSeats: parseInt(e.target.value) || 0 }))}
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Registration Start Date *</Label>
          <Input
            type="date"
            value={formData.registrationStart}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationStart: e.target.value }))}
          />
        </div>
        <div>
          <Label>Registration End Date *</Label>
          <Input
            type="date"
            value={formData.registrationEnd}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationEnd: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Workshop Date *</Label>
          <Input
            type="date"
            value={formData.workshopDate}
            onChange={(e) => setFormData(prev => ({ ...prev, workshopDate: e.target.value }))}
          />
        </div>
        <div>
          <Label>Workshop Time *</Label>
          <Input
            value={formData.workshopTime}
            onChange={(e) => setFormData(prev => ({ ...prev, workshopTime: e.target.value }))}
            placeholder="e.g., 09:00 AM - 01:00 PM"
          />
        </div>
      </div>

      <div>
        <Label>Venue *</Label>
        <Input
          value={formData.venue}
          onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
          placeholder="e.g., Workshop Hall A"
        />
      </div>

      <div>
        <Label>Prerequisites</Label>
        <Textarea
          value={formData.prerequisites}
          onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
          placeholder="Any prerequisites for the workshop..."
          rows={2}
        />
      </div>

      <div>
        <Label>Materials Provided</Label>
        <Textarea
          value={formData.materials}
          onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
          placeholder="Materials and equipment provided..."
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label>Active</Label>
      </div>
    </div>
  )

  if (loading) {
    return <div className="flex justify-center p-8">Loading workshops...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workshop Management</h2>
          <p className="text-gray-600">Manage conference workshops and seat availability</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workshop</DialogTitle>
              <DialogDescription>
                Add a new workshop to the conference program
              </DialogDescription>
            </DialogHeader>
            {renderWorkshopForm()}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Workshop</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workshops ({workshops.length})</CardTitle>
          <CardDescription>
            Manage workshop details, pricing, and seat availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workshop</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workshop.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {workshop.duration}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {workshop.venue}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{workshop.instructor}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{workshop.bookedSeats}/{workshop.maxSeats}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {workshop.availableSeats} available
                    </div>
                  </TableCell>
                  <TableCell>₹{workshop.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(workshop.workshopDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {workshop.workshopTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(workshop)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(workshop)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workshop</DialogTitle>
            <DialogDescription>
              Update workshop details and configuration
            </DialogDescription>
          </DialogHeader>
          {renderWorkshopForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Workshop</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}