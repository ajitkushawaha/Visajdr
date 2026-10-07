"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, RefreshCw, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Supplier {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  service: string;
  country: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
  commission?: number;
  notes?: string;
  contactPerson?: string;
  website?: string;
  rating?: number;
  totalApplications?: number;
  successRate?: number;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OfflineSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKey, setSearchKey] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    service: "",
    country: "",
    city: "",
    address: "",
    commission: "",
    notes: "",
    contactPerson: "",
    website: "",
    rating: "5"
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchKey && searchValue) {
        params.append('searchKey', searchKey)
        params.append('searchValue', searchValue)
      }
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)

      const response = await fetch(`/api/admin/suppliers?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setSuppliers(result.data.suppliers)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch suppliers",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchSuppliers()
  }

  const handleReset = () => {
    setSearchKey("")
    setSearchValue("")
    setFromDate("")
    setToDate("")
    setSelectedSuppliers([])
    fetchSuppliers()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(suppliers.map(supplier => supplier._id))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId])
    } else {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId))
    }
  }

  const handleAddSupplier = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Supplier added successfully"
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchSuppliers()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add supplier",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSupplier = async () => {
    if (!editingSupplier) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/suppliers/${editingSupplier._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Supplier updated successfully"
        })
        setIsEditDialogOpen(false)
        setEditingSupplier(null)
        resetForm()
        fetchSuppliers()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update supplier",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return

    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully"
        })
        fetchSuppliers()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete supplier",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive"
      })
    }
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: "Warning",
        description: "Please select suppliers to change status",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/admin/suppliers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-status',
          supplierIds: selectedSuppliers,
          status
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setSelectedSuppliers([])
        fetchSuppliers()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update supplier status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating supplier status:", error)
      toast({
        title: "Error",
        description: "Failed to update supplier status",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      service: "",
      country: "",
      city: "",
      address: "",
      commission: "",
      notes: "",
      contactPerson: "",
      website: "",
      rating: "5"
    })
  }

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email,
      mobile: supplier.mobile,
      service: supplier.service,
      country: supplier.country,
      city: supplier.city || "",
      address: supplier.address || "",
      commission: supplier.commission?.toString() || "",
      notes: supplier.notes || "",
      contactPerson: supplier.contactPerson || "",
      website: supplier.website || "",
      rating: supplier.rating?.toString() || "5"
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage your offline suppliers and their services</p>
        </div>
          <div className="text-sm text-gray-500">
            Total Suppliers: {suppliers.length}
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Supplier List</CardTitle>
            <div className="flex gap-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-primary hover:bg-brand-dark text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Offline Supplier
              </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Supplier Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Type *</Label>
                      <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa-processing">Visa Processing</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                          <SelectItem value="medical-examination">Medical Examination</SelectItem>
                          <SelectItem value="embassy-liaison">Embassy Liaison</SelectItem>
                          <SelectItem value="courier-service">Courier Service</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        placeholder="Enter country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="Enter website URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        value={formData.commission}
                        onChange={(e) => setFormData({...formData, commission: e.target.value})}
                        placeholder="Enter commission percentage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select value={formData.rating} onValueChange={(value) => setFormData({...formData, rating: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Enter full address"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Enter any additional notes"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSupplier} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Supplier'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Status
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}>
                    Mark as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}>
                    Mark as Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search/Filter Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg text-gray-900">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="search-key">
                Select key to search by <span className="text-red-500">*</span>
              </Label>
              <Select value={searchKey} onValueChange={setSearchKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier-name">Supplier Name</SelectItem>
                  <SelectItem value="email">Email Id</SelectItem>
                  <SelectItem value="mobile">Mobile Number</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-value">Value</Label>
              <Input
                id="search-value"
                placeholder="Value"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                placeholder="Select From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                placeholder="Select To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="bg-brand-primary hover:bg-brand-dark text-white px-6">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="link" onClick={handleReset} className="text-brand-primary hover:text-brand-dark p-0">
              Reset Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedSuppliers.length === suppliers.length && suppliers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Service</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Supplier Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Email Id</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Mobile Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Created Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Modified Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading suppliers...
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No suppliers found. Add your first supplier to get started.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier._id} className="border-b border-gray-200 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedSuppliers.includes(supplier._id)}
                          onCheckedChange={(checked) => handleSelectSupplier(supplier._id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        <span className="capitalize">{supplier.service.replace('-', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{supplier.name}</td>
                      <td className="px-4 py-3 text-gray-600">{supplier.email}</td>
                      <td className="px-4 py-3 text-gray-600">{supplier.mobile}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={supplier.status === "active" ? "default" : "secondary"}
                          className={
                            supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(supplier.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(supplier.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteSupplier(supplier._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {suppliers.length} suppliers
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Supplier Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile Number *</Label>
              <Input
                id="edit-mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-service">Service Type *</Label>
              <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa-processing">Visa Processing</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="medical-examination">Medical Examination</SelectItem>
                  <SelectItem value="embassy-liaison">Embassy Liaison</SelectItem>
                  <SelectItem value="courier-service">Courier Service</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country *</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="Enter website URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-commission">Commission (%)</Label>
              <Input
                id="edit-commission"
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({...formData, commission: e.target.value})}
                placeholder="Enter commission percentage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating</Label>
              <Select value={formData.rating} onValueChange={(value) => setFormData({...formData, rating: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter full address"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSupplier} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Supplier'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
