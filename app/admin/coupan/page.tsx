'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Tag,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCurrency } from '@/hooks/useCurrency'

interface VisaCoupon {
  _id: string
  code: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minAmount?: number
  maxDiscount?: number
  applicableVisas: string[]
  applicableCountries: string[]
  startDate: string
  endDate: string
  usageLimit?: number
  usedCount: number
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  updatedAt: string
}

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<VisaCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<VisaCoupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minAmount: 0,
    maxDiscount: 0,
    applicableVisas: [] as string[],
    applicableCountries: [] as string[],
    startDate: '',
    endDate: '',
    usageLimit: 0,
    status: 'active' as 'active' | 'inactive',
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/visa-coupons', {
        cache: 'no-store',
      })
      const data = await response.json()

      if (data.success) {
        setCoupons(data.coupons || [])
      } else {
        toast.error('Failed to fetch coupons')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Error loading coupons')
    } finally {
      setLoading(false)
    }
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCoupon
        ? `/api/admin/visa-coupons/${editingCoupon._id}`
        : '/api/admin/visa-coupons'
      const method = editingCoupon ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        fetchCoupons()
        setShowCreateModal(false)
        setEditingCoupon(null)
        resetForm()
        toast.success(
          editingCoupon
            ? 'Coupon updated successfully'
            : 'Coupon created successfully'
        )
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save coupon')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast.error('Error saving coupon')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/admin/visa-coupons/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCoupons()
        toast.success('Coupon deleted successfully')
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Error deleting coupon')
    }
  }

  const handleEdit = (coupon: VisaCoupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minAmount: coupon.minAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      applicableVisas: coupon.applicableVisas,
      applicableCountries: coupon.applicableCountries,
      startDate: coupon.startDate.split('T')[0],
      endDate: coupon.endDate.split('T')[0],
      usageLimit: coupon.usageLimit || 0,
      status: coupon.status,
    })
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minAmount: 0,
      maxDiscount: 0,
      applicableVisas: [],
      applicableCountries: [],
      startDate: '',
      endDate: '',
      usageLimit: 0,
      status: 'active',
    })
    setEditingCoupon(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Coupon code copied to clipboard')
  }

  const getStatusBadge = (coupon: VisaCoupon) => {
    // Check if coupon is actually expired based on end date
    const now = new Date()
    const endDate = new Date(coupon.endDate)
    const isExpired = endDate < now
    const actualStatus = isExpired ? 'expired' : coupon.status

    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    }

    const config =
      statusConfig[actualStatus as keyof typeof statusConfig] ||
      statusConfig.inactive
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </Badge>
    )
  }

  const filteredCoupons = coupons.filter(coupon => {
    // Check if coupon is actually expired
    const now = new Date()
    const endDate = new Date(coupon.endDate)
    const isExpired = endDate < now
    const actualStatus = isExpired ? 'expired' : coupon.status

    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || actualStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate active coupons (exclude expired ones)
  const totalActiveCoupons = coupons.filter(c => {
    const now = new Date()
    const endDate = new Date(c.endDate)
    return c.status === 'active' && endDate >= now
  }).length
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-gray-600">
            Manage promotional coupon codes for visa applications
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalActiveCoupons} active coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Times used across all coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <span className="text-lg font-semibold text-muted-foreground">
              {currencySymbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.length > 0
                ? Math.round((totalActiveCoupons / coupons.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Coupons currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCoupons} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Coupons ({filteredCoupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Coupon Code</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Value</th>
                    <th className="text-left p-2">Applicable To</th>
                    <th className="text-left p-2">Validity</th>
                    <th className="text-right p-2">Usage</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map(coupon => (
                    <tr key={coupon._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          <div className="text-sm text-gray-500">
                            {coupon.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="capitalize">
                          {coupon.discountType}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="font-semibold">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </div>
                        {coupon.minAmount > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: ₹{coupon.minAmount}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{coupon.applicableVisas.length} visa types</div>
                          <div>
                            {coupon.applicableCountries.length} countries
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(coupon.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div className="font-semibold">{coupon.usedCount}</div>
                        {coupon.usageLimit && (
                          <div className="text-xs text-gray-500">
                            / {coupon.usageLimit}
                          </div>
                        )}
                      </td>
                      <td className="p-2">{getStatusBadge(coupon)}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(coupon._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCoupons.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  {coupons.length === 0
                    ? 'No coupons found. Create your first coupon!'
                    : 'No coupons found matching your criteria.'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={open => {
          setShowCreateModal(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    required
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCouponCode}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
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
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setFormData(prev => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage'
                    ? 'Percentage (%)'
                    : 'Amount (₹)'}{' '}
                  *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      discountValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={formData.minAmount}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      minAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      maxDiscount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      usageLimit: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
