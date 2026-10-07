'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApplicationStatus {
  _id: string
  name: string
  slug: string
  description?: string
  color: string
  order: number
  isActive: boolean
  isSystem: boolean
  category?: 'initial' | 'processing' | 'final'
}

const colorOptions = [
  { value: 'bg-gray-100 text-gray-800', label: 'Gray' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' },
  { value: 'bg-orange-100 text-orange-800', label: 'Orange' },
  { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo' },
  { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
  { value: 'bg-green-100 text-green-800', label: 'Green' },
  { value: 'bg-red-100 text-red-800', label: 'Red' },
]

export default function ApplicationStatusPage() {
  const { toast } = useToast()
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus | null>(null)
  const [deleteStatusId, setDeleteStatusId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: 'bg-gray-100 text-gray-800',
    order: 0,
    category: 'processing' as 'initial' | 'processing' | 'final',
  })

  useEffect(() => {
    fetchStatuses()
  }, [])

  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/application-status')
      const data = await response.json()
      if (data.success) {
        setStatuses(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch application statuses',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching statuses:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch application statuses',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (status?: ApplicationStatus) => {
    if (status) {
      setSelectedStatus(status)
      setFormData({
        name: status.name,
        slug: status.slug,
        description: status.description || '',
        color: status.color,
        order: status.order,
        category: status.category || 'processing',
      })
    } else {
      setSelectedStatus(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: 'bg-gray-100 text-gray-800',
        order:
          statuses.length > 0 ? Math.max(...statuses.map(s => s.order)) + 1 : 0,
        category: 'processing',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedStatus(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: 'bg-gray-100 text-gray-800',
      order: 0,
      category: 'processing',
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: selectedStatus ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.color) {
      toast({
        title: 'Validation Error',
        description: 'Name, slug, and color are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const url = selectedStatus
        ? `/api/admin/application-status/${selectedStatus._id}`
        : '/api/admin/application-status'
      const method = selectedStatus ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: selectedStatus
            ? 'Status updated successfully'
            : 'Status created successfully',
        })
        handleCloseDialog()
        fetchStatuses()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving status:', error)
      toast({
        title: 'Error',
        description: 'Failed to save status',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteClick = (statusId: string) => {
    setDeleteStatusId(statusId)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteStatusId) return

    try {
      const response = await fetch(
        `/api/admin/application-status/${deleteStatusId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Status deleted successfully',
        })
        setIsDeleteDialogOpen(false)
        setDeleteStatusId(null)
        fetchStatuses()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting status:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete status',
        variant: 'destructive',
      })
    }
  }

  const toggleActive = async (status: ApplicationStatus) => {
    try {
      const response = await fetch(
        `/api/admin/application-status/${status._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !status.isActive }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: `Status ${!status.isActive ? 'activated' : 'deactivated'}`,
        })
        fetchStatuses()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Status Management</h1>
          <p className="text-gray-600 mt-1">
            Manage application statuses for visa bookings
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statuses</CardTitle>
          <CardDescription>
            Configure application statuses that can be assigned to visa bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No statuses found. Create your first status to get started.
              </div>
            ) : (
              statuses.map(status => (
                <div
                  key={status._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <Badge className={status.color}>{status.name}</Badge>
                    <div className="flex-1">
                      <p className="font-medium">{status.name}</p>
                      <p className="text-sm text-gray-500">
                        {status.slug} • {status.category}
                        {status.description && ` • ${status.description}`}
                      </p>
                    </div>
                    {status.isSystem && (
                      <Badge variant="outline" className="text-xs">
                        System
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(status)}
                        disabled={status.isSystem}
                      >
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(status)}
                        disabled={status.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(status._id)}
                        disabled={status.isSystem}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus ? 'Edit Status' : 'Create New Status'}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus
                ? 'Update the application status details'
                : 'Add a new application status that can be assigned to bookings'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g., Under Review"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={e =>
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }
                placeholder="e.g., under_review"
                disabled={!!selectedStatus}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier (cannot be changed after creation)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={formData.color}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      category: value as 'initial' | 'processing' | 'final',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Display order"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {selectedStatus ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              application status. Make sure no applications are using this
              status before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
