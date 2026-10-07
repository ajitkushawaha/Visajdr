'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Star,
  StarOff,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Globe,
  Clock,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Visa {
  _id: string
  country: string
  visaType: string
  adultPrice: number | string
  childPrice: number | string
  status: 'active' | 'inactive' | 'draft'
  processingTime?: string
  processingTimeValue: string
  createdAt: string
  updatedAt: string
  hotListed: boolean | string
  countryFlag: string
  countryImage: string
  metaTitle?: string
  metaDescription?: string
}

export default function VisaListPage() {
  const [visas, setVisas] = useState<Visa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedVisas, setSelectedVisas] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000000])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Refresh when pathname changes (e.g., when coming back from create/edit page)
  useEffect(() => {
    fetchVisas()
  }, [pathname])

  const fetchVisas = async () => {
    try {
      const response = await fetch('/api/admin/create-visa', {
        cache: 'no-store', // Force fresh data
        next: { revalidate: 0 },
      })
      const data = await response.json()
      setVisas(data.visas || [])
      setLoading(false) // Set loading to false immediately
    } catch (error) {
      console.error('Error fetching visas:', error)
      toast.error('Failed to fetch visas')
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVisas.length === 0) return

    try {
      const promises = selectedVisas.map(id =>
        fetch(`/api/admin/visa/${id}/delete`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      setVisas(visas.filter(visa => !selectedVisas.includes(visa._id)))
      setSelectedVisas([])
      toast.success(`${selectedVisas.length} visas deleted successfully!`)
    } catch (error) {
      console.error('Error deleting visas:', error)
      toast.error('Error deleting visas. Please try again.')
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedVisas.length === 0) return

    try {
      const promises = selectedVisas.map(id =>
        fetch(`/api/admin/visa/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(promises)
      setVisas(
        visas.map(visa =>
          selectedVisas.includes(visa._id)
            ? { ...visa, status: newStatus as 'active' | 'inactive' | 'draft' }
            : visa
        )
      )
      setSelectedVisas([])
      toast.success(`${selectedVisas.length} visas updated successfully!`)
    } catch (error) {
      console.error('Error updating visas:', error)
      toast.error('Error updating visas. Please try again.')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVisas(filteredVisas.map(visa => visa._id))
    } else {
      setSelectedVisas([])
    }
  }

  const handleSelectVisa = (visaId: string, checked: boolean) => {
    if (checked) {
      setSelectedVisas([...selectedVisas, visaId])
    } else {
      setSelectedVisas(selectedVisas.filter(id => id !== visaId))
    }
  }

  const toggleHotListed = async (visaId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/visa/${visaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotListed: !currentStatus }),
      })

      if (response.ok) {
        setVisas(
          visas.map(visa =>
            visa._id === visaId ? { ...visa, hotListed: !currentStatus } : visa
          )
        )
        toast.success(
          `Visa ${!currentStatus ? 'added to' : 'removed from'} hot list`
        )
      }
    } catch (error) {
      console.error('Error updating hot list status:', error)
      toast.error('Error updating hot list status')
    }
  }
  const handleDelete = async (id: string, visaName: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/visa/${id}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVisas(visas.filter(visa => visa._id !== id))
        toast.success(`${visaName} deleted successfully!`)
      } else {
        throw new Error('Failed to delete visa')
      }
    } catch (error) {
      console.error('Error deleting visa:', error)
      toast.error('Error deleting visa. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Get unique countries for filter
  const countries = Array.from(new Set(visas.map(visa => visa.country))).sort()

  // Filter and sort visas
  const filteredVisas = visas
    .filter(visa => {
      const matchesSearch =
        visa.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visa.visaType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visa.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || visa.status === statusFilter
      const matchesCountry =
        countryFilter === 'all' || visa.country === countryFilter
      const adultPriceNum = Number(visa.adultPrice) || 0
      const matchesPrice =
        adultPriceNum >= priceRange[0] && adultPriceNum <= priceRange[1]
      return matchesSearch && matchesStatus && matchesCountry && matchesPrice
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Visa]
      let bValue = b[sortBy as keyof Visa]

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (sortOrder === 'asc') {
        return (aValue || 0) > (bValue || 0) ? 1 : -1
      } else {
        return (aValue || 0) < (bValue || 0) ? 1 : -1
      }
    })

  const exportToCSV = () => {
    const csvContent = [
      [
        'Country',
        'Visa Type',
        'Adult Price',
        'Child Price',
        'Status',
        'Processing Time',
        'Hot Listed',
        'Created Date',
      ],
      ...filteredVisas.map(visa => [
        visa.country,
        visa.visaType,
        visa.adultPrice,
        visa.childPrice,
        visa.status,
        visa.processingTimeValue,
        visa.hotListed ? 'Yes' : 'No',
        new Date(visa.createdAt).toLocaleDateString(),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Visa data exported successfully!')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Visa Management
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Manage all visa types and pricing •{' '}
                  <span className="font-semibold text-gray-900">
                    {visas.length}
                  </span>{' '}
                  total visas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  onClick={exportToCSV}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Link href="/admin/visa">
                  <Button className="bg-brand-primary hover:bg-brand-primary/90 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Visa
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Filter className="w-5 h-5 text-blue-700" />
                  </div>
                  Search & Filters
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-1">
                  {filteredVisas.length} visa
                  {filteredVisas.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by country, visa type, or title..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="adultPrice">Price</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Country
                  </label>
                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0].toLocaleString()} - ₹
                    {priceRange[1].toLocaleString()}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setCountryFilter('all')
                      setPriceRange([0, 100000])
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedVisas.length > 0 && (
          <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedVisas.length} visa
                    {selectedVisas.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange('active')}
                    >
                      <ToggleRight className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange('inactive')}
                    >
                      <ToggleLeft className="w-4 h-4 mr-1" />
                      Deactivate
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Selected Visas
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            {selectedVisas.length} visa
                            {selectedVisas.length !== 1 ? 's' : ''}? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete {selectedVisas.length} Visa
                            {selectedVisas.length !== 1 ? 's' : ''}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVisas([])}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Visa Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading visas...</div>
              </div>
            ) : filteredVisas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ||
                  statusFilter !== 'all' ||
                  countryFilter !== 'all'
                    ? 'No visas found matching your criteria.'
                    : 'No visas created yet.'}
                </div>
                <Link href="/admin/visa">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Visa
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedVisas.length === filteredVisas.length &&
                          filteredVisas.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Country
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Visa Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Pricing
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Processing
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Hot Listed
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Created
                    </TableHead>
                    <TableHead className="w-32 font-semibold text-gray-900">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisas.map(visa => (
                    <TableRow
                      key={visa._id}
                      className={`transition-colors ${
                        selectedVisas.includes(visa._id)
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedVisas.includes(visa._id)}
                          onCheckedChange={checked =>
                            handleSelectVisa(visa._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {visa.countryFlag && (
                            <img
                              src={visa.countryFlag}
                              alt={visa.country}
                              className="w-8 h-6 rounded object-cover border border-gray-200 shadow-sm"
                            />
                          )}
                          <span className="capitalize font-semibold text-gray-900">
                            {visa.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className="font-medium text-gray-800">
                          {visa.visaType?.replace('-', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-semibold text-green-700">
                            Adult: ₹
                            {Number(visa.adultPrice)?.toLocaleString('en-IN')}
                          </div>
                          <div className="text-gray-600">
                            Child: ₹
                            {Number(visa.childPrice)?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`font-semibold ${
                            visa.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : visa.status === 'inactive'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          {visa.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {visa.processingTimeValue}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleHotListed(
                              visa._id,
                              visa.hotListed === true ||
                                visa.hotListed === 'true'
                            )
                          }
                          className={
                            visa.hotListed === true || visa.hotListed === 'true'
                              ? 'text-yellow-600'
                              : 'text-gray-400'
                          }
                        >
                          {visa.hotListed === true ||
                          visa.hotListed === 'true' ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(visa.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/admin/visa/${visa._id}`}
                                className="flex items-center cursor-pointer"
                                onClick={e => {
                                  e.preventDefault()
                                  router.push(`/admin/visa/${visa._id}`)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/admin/visa/${visa._id}/edit`}
                                className="flex items-center cursor-pointer"
                                onClick={e => {
                                  e.preventDefault()
                                  router.push(`/admin/visa/${visa._id}/edit`)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Visa
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                const isHotListed =
                                  visa.hotListed === true ||
                                  visa.hotListed === 'true'
                                toggleHotListed(visa._id, isHotListed)
                              }}
                              className={
                                visa.hotListed === true ||
                                visa.hotListed === 'true'
                                  ? 'text-yellow-600'
                                  : ''
                              }
                            >
                              {visa.hotListed === true ||
                              visa.hotListed === 'true' ? (
                                <StarOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Star className="w-4 h-4 mr-2" />
                              )}
                              {visa.hotListed === true ||
                              visa.hotListed === 'true'
                                ? 'Remove from Hot List'
                                : 'Add to Hot List'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={e => e.preventDefault()}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Visa
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Visa Confirmation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the{' '}
                                    {visa.country} {visa.visaType} visa? This
                                    action cannot be undone and will permanently
                                    remove all visa data from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(
                                        visa._id,
                                        `${visa.country} ${visa.visaType}`
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deletingId === visa._id}
                                  >
                                    {deletingId === visa._id ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Deleting...
                                      </div>
                                    ) : (
                                      'Delete Visa'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
