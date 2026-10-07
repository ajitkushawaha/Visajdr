'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Download,
  Filter,
  Calendar,
  CreditCard,
  User,
  Building,
  CheckCircle,
  Clock,
  Calculator,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

interface PaymentRecord {
  _id: string
  trackingId: string
  customerName: string
  customerEmail: string
  serviceType: 'visa' | 'travel-insurance'
  amount: number
  paymentMethod: 'upi' | 'card' | 'razorpay'
  paymentStatus: 'pending' | 'completed' | 'failed'
  paymentId?: string
  convenienceFees?: {
    total: number
    onlineProcessing?: number
    paymentMethod?: number
    expressService?: number
    documentProcessing?: number
  }
  createdAt: string
  updatedAt: string
}

export default function PaymentHistory() {
  const { symbol: currencySymbol } = useCurrency()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [
    currentPage,
    filterStatus,
    filterService,
    filterMethod,
    sortBy,
    sortOrder,
  ])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: filterStatus,
        service: filterService,
        method: filterMethod,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setTotalPages(data.totalPages)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch payments',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(
    payment =>
      payment.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return '💳'
      case 'card':
        return '💳'
      case 'razorpay':
        return '🏦'
      default:
        return '💳'
    }
  }

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        service: filterService,
        method: filterMethod,
        export: 'true',
      })

      const response = await fetch(`/api/admin/payments/export?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Success',
          description: 'Payments exported successfully',
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export payments',
        variant: 'destructive',
      })
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterService('all')
    setFilterMethod('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            Track all payment transactions and revenue
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchPayments}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 text-gray-900 hover:text-gray-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportPayments}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <span className="text-lg font-semibold text-green-600">
              {currencySymbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(
                payments.reduce(
                  (sum, p) =>
                    sum + (p.paymentStatus === 'completed' ? p.amount : 0),
                  0
                )
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span>Completed payments only</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payments.length}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <FileText className="h-3 w-3 mr-1" />
              <span>All transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payments.filter(p => p.paymentStatus === 'completed').length}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Badge variant="secondary" className="text-xs">
                {payments.length > 0
                  ? Math.round(
                      (payments.filter(p => p.paymentStatus === 'completed')
                        .length /
                        payments.length) *
                        100
                    )
                  : 0}
                % success rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payments.filter(p => p.paymentStatus === 'pending').length}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Convenience Fees
            </CardTitle>
            <Calculator className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(
                payments.reduce(
                  (sum, p) => sum + (p.convenienceFees?.total || 0),
                  0
                )
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Additional charges</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by tracking ID, customer name, or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="travel-insurance">
                    Travel Insurance
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-gray-700 hover:text-gray-900"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900">
              Payment Records
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredPayments.length} of {payments.length} payments
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payments found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('trackingId')}
                    >
                      <div className="flex items-center gap-2">
                        Tracking ID
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('serviceType')}
                    >
                      <div className="flex items-center gap-2">
                        Service
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('paymentStatus')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => (
                    <TableRow key={payment._id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {payment.trackingId}
                          </span>
                          {payment.paymentId && (
                            <Badge variant="outline" className="text-xs">
                              {payment.paymentId.slice(-8)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            payment.serviceType === 'visa'
                              ? 'border-blue-200 text-blue-800 bg-blue-50'
                              : 'border-green-200 text-green-800 bg-green-50'
                          }`}
                        >
                          {payment.serviceType === 'visa'
                            ? 'Visa Application'
                            : 'Travel Insurance'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatAmount(payment.amount)}
                          </p>
                          {payment.convenienceFees?.total &&
                            payment.convenienceFees.total > 0 && (
                              <p className="text-xs text-gray-500">
                                +{formatAmount(payment.convenienceFees.total)}{' '}
                                fees
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                          </span>
                          <span className="capitalize font-medium">
                            {payment.paymentMethod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(payment.paymentStatus)}
                        >
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({payments.length}{' '}
                total payments)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
