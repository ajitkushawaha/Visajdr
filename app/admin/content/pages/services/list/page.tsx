'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ServiceDetail {
  _id: string
  title: string
  slug: string
  status: 'published' | 'draft'
  createdAt: string
  updatedAt: string
}

export default function ServiceDetailsListPage() {
  const [services, setServices] = useState<ServiceDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/service-details')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setServices(data.serviceDetails || [])
        }
      } else {
        toast.error('Failed to fetch service details')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Error fetching service details')
    } finally {
      setLoading(false)
    }
  }

  // Filter services based on search and status
  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || service.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (serviceId: string, serviceTitle: string) => {
    setDeletingId(serviceId)

    try {
      const response = await fetch(`/api/admin/service-details/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(`"${serviceTitle}" deleted successfully!`)
        fetchServices()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete service')
      }
    } catch (error: any) {
      console.error('Error deleting service:', error)
      toast.error(error.message || 'Error deleting service. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin/content/pages/services">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Services Home
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Service Detail Pages</h1>
            <p className="text-blue-100 mt-2">
              Create, edit, and manage individual service pages
            </p>
          </div>
          <Link href="/admin/content/pages/services/new">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Create New Service
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or slug..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No services found'
                  : 'No service detail pages yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first service detail page to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/admin/content/pages/services/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Service
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredServices.map(service => (
              <Card
                key={service._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {service.title}
                        </h3>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Slug:</span> /services/
                        {service.slug}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {formatDate(service.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Updated: {formatDate(service.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/services/${service.slug}`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-900 bg-white hover:bg-gray-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </Link>
                      <Link
                        href={`/admin/content/pages/services/${service._id}`}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === service._id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingId === service._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Service Detail Page
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{service.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(service._id, service.title)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {services.length}
              </div>
              <div className="text-sm text-gray-600">Total Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {services.filter(s => s.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { FileText } from 'lucide-react'
