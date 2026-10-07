'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  BarChart3,
  Edit,
  Trash2,
  TrendingUp,
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

interface Statistic {
  _id?: string
  title: string
  value: number
  suffix?: string
  icon?: string
  color?: string
  status: 'active' | 'inactive'
  order: number
}

export default function StatisticsManager() {
  const router = useRouter()
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingStatistic, setEditingStatistic] = useState<Statistic | null>(
    null
  )
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Statistic>({
    title: '',
    value: 0,
    suffix: '',
    icon: '',
    color: '#3B82F6',
    status: 'active',
    order: 0,
  })

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/home/statistics')
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.statistics || [])
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Statistic, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      value: 0,
      suffix: '',
      icon: '',
      color: '#3B82F6',
      status: 'active',
      order: statistics.length + 1,
    })
    setEditingStatistic(null)
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (statistic: Statistic) => {
    setFormData(statistic)
    setEditingStatistic(statistic)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.title || formData.value === undefined) {
      alert('Please fill in title and value')
      return
    }

    setIsSaving(true)

    try {
      const url = editingStatistic
        ? `/api/admin/home/statistics`
        : '/api/admin/home/statistics'

      const method = editingStatistic ? 'PATCH' : 'POST'
      const body = editingStatistic
        ? { id: editingStatistic._id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        alert(
          editingStatistic
            ? 'Statistic updated successfully!'
            : 'Statistic created successfully!'
        )
        setShowForm(false)
        resetForm()
        fetchStatistics()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save statistic')
      }
    } catch (error) {
      console.error('Error saving statistic:', error)
      alert('Error saving statistic. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/home/statistics?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Statistic deleted successfully!')
        fetchStatistics()
      } else {
        alert('Failed to delete statistic')
      }
    } catch (error) {
      console.error('Error deleting statistic:', error)
      alert('Error deleting statistic')
    }
  }

  const predefinedColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' },
  ]

  if (loading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/admin/content/home">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-900 bg-white hover:bg-gray-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Page Management
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Manage Statistics
              </h1>
              <p className="text-gray-600 mt-2">
                Manage achievement numbers and statistics counters
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open('/', '_blank')}
                className="text-gray-900 bg-white hover:bg-gray-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Statistic
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistics ({statistics.length})</CardTitle>
                <CardDescription>
                  Achievement numbers and counters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No statistics yet</p>
                    <p className="text-sm">
                      Click "Add Statistic" to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statistics.map((statistic, index) => (
                      <div
                        key={statistic._id || index}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: statistic.color }}
                            >
                              {statistic.icon || (
                                <TrendingUp className="h-4 w-4" />
                              )}
                            </div>
                            <Badge
                              variant={
                                statistic.status === 'active'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {statistic.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(statistic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Statistic
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    statistic? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      statistic._id &&
                                      handleDelete(statistic._id)
                                    }
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="text-center">
                          <div
                            className="text-3xl font-bold mb-1"
                            style={{ color: statistic.color }}
                          >
                            {statistic.value.toLocaleString()}
                            {statistic.suffix}
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            {statistic.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          {showForm && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingStatistic ? 'Edit Statistic' : 'Add New Statistic'}
                  </CardTitle>
                  <CardDescription>
                    {editingStatistic
                      ? 'Update statistic details'
                      : 'Create a new achievement counter'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Happy Clients"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={e =>
                        handleInputChange(
                          'value',
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="15000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                      id="suffix"
                      value={formData.suffix}
                      onChange={e =>
                        handleInputChange('suffix', e.target.value)
                      }
                      placeholder="e.g., +, %, K, M"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={e => handleInputChange('icon', e.target.value)}
                      placeholder="e.g., 👥, 🌍, ✅"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={value => handleInputChange('color', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedColors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: color.value }}
                              />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive') =>
                        handleInputChange('status', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving
                        ? 'Saving...'
                        : editingStatistic
                          ? 'Update'
                          : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 border rounded-lg">
                    <div
                      className="text-3xl font-bold mb-2"
                      style={{ color: formData.color }}
                    >
                      {formData.value.toLocaleString()}
                      {formData.suffix}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.title || 'Statistic Title'}
                    </h3>
                    {formData.icon && (
                      <div className="text-2xl mt-2">{formData.icon}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
