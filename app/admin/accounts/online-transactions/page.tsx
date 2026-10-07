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
  RefreshCw,
  Wifi,
  WifiOff,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Eye,
  ArrowUpDown,
  FileText,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import TransactionDetailsModal from '@/components/payment/TransactionDetailsModal'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

interface OnlineTransaction {
  _id: string
  transactionId: string
  paymentId: string
  customerName: string
  customerEmail: string
  serviceType: 'visa' | 'travel-insurance'
  amount: number
  paymentMethod: 'razorpay' | 'stripe' | 'upi' | 'card'
  paymentGateway: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  gatewayResponse?: any
  createdAt: string
  completedAt?: string
  failureReason?: string
  convenienceFees?: {
    total: number
    breakdown: any
  }
}

export default function OnlineTransactions() {
  const { symbol: currencySymbol } = useCurrency()
  const [transactions, setTransactions] = useState<OnlineTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterGateway, setFilterGateway] = useState<string>('all')
  const [isLive, setIsLive] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedTransaction, setSelectedTransaction] =
    useState<OnlineTransaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()

    // Set up auto-refresh if live mode is enabled
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        fetchTransactions()
        setLastRefresh(new Date())
      }, 10000) // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [filterStatus, filterGateway, isLive])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: filterStatus,
        gateway: filterGateway,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/admin/online-transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch transactions',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchTransactions()
    setLastRefresh(new Date())
  }

  const handleViewTransaction = (transaction: OnlineTransaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
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
    setFilterGateway('all')
    setSearchTerm('')
  }

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        gateway: filterGateway,
        export: 'true',
      })

      const response = await fetch(
        `/api/admin/online-transactions/export?${params}`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Success',
          description: 'Transactions exported successfully',
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export transactions',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getGatewayBadge = (gateway: string) => {
    const gatewayConfig = {
      razorpay: { color: 'bg-blue-100 text-blue-800' },
      stripe: { color: 'bg-purple-100 text-purple-800' },
      upi: { color: 'bg-green-100 text-green-800' },
      card: { color: 'bg-orange-100 text-orange-800' },
    }

    const config =
      gatewayConfig[gateway as keyof typeof gatewayConfig] ||
      gatewayConfig.razorpay

    return <Badge className={`${config.color} capitalize`}>{gateway}</Badge>
  }

  const filteredTransactions = transactions.filter(
    transaction =>
      transaction.transactionId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
  const successfulTransactions = transactions.filter(
    t => t.status === 'completed'
  ).length
  const failedTransactions = transactions.filter(
    t => t.status === 'failed'
  ).length
  const successRate =
    transactions.length > 0
      ? (successfulTransactions / transactions.length) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Online Transactions
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time transaction monitoring and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 text-gray-900 hover:text-gray-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportTransactions}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Live Status */}
      {isLive && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="font-medium">Live monitoring active</span>
              <span className="text-sm text-green-600">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Volume
            </CardTitle>
            <span className="text-lg font-semibold text-green-600">
              {currencySymbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalVolume.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <FileText className="h-3 w-3 mr-1" />
              <span>{transactions.length} transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {successRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              <span>{successfulTransactions} successful</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Failed Transactions
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedTransactions}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
              <span>
                {transactions.length > 0
                  ? ((failedTransactions / transactions.length) * 100).toFixed(
                      1
                    )
                  : 0}
                % failure rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(transactions.map(t => t.customerEmail)).size}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Unique customers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                  placeholder="Search by transaction ID, customer name, email, or payment ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterGateway} onValueChange={setFilterGateway}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
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

      {/* Transactions Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Transaction Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                <span className="text-gray-600">Loading transactions...</span>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No transactions found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterGateway !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'No transactions have been processed yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('transactionId')}
                    >
                      <div className="flex items-center gap-2">
                        Transaction ID
                        {sortBy === 'transactionId' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center gap-2">
                        Customer
                        {sortBy === 'customerName' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {sortBy === 'amount' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === 'status' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Created
                        {sortBy === 'createdAt' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(transaction => (
                    <TableRow
                      key={transaction._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-mono text-sm">
                              {transaction.transactionId}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.paymentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.serviceType.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>₹{transaction.amount.toLocaleString()}</div>
                        {transaction.convenienceFees && (
                          <div className="text-xs text-gray-500">
                            Fees: ₹{transaction.convenienceFees.total}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getGatewayBadge(transaction.paymentGateway)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-brand-primary hover:text-brand-dark border-brand-primary hover:border-brand-dark"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  )
}
