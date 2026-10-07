'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  CreditCard,
  Activity,
  Target,
  Award,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

interface AgentReport {
  _id: string
  agentId: string
  personalDetails: {
    fullName: string
    email: string
  }
  status: string
  commissionRate: number
  commissionType: string
  performance: {
    totalApplications: number
    approvedApplications: number
    rejectedApplications: number
    totalCommissionEarned: number
    averageProcessingTime: number
    clientSatisfactionRating: number
  }
  createdAt: string
  approvedAt?: string
}

interface CommissionData {
  agentId: string
  agentName: string
  totalEarnings: number
  applicationsProcessed: number
  commissionRate: number
  lastPayout: string
}

interface PayoutData {
  agentId: string
  agentName: string
  amount: number
  date: string
  status: 'pending' | 'completed' | 'failed'
  applications: number
}

export default function AgentReportsPage() {
  const { symbol: currencySymbol } = useCurrency()
  const { toast } = useToast()
  const [agents, setAgents] = useState<AgentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')
  const [commissionData, setCommissionData] = useState<CommissionData[]>([])
  const [payoutData, setPayoutData] = useState<PayoutData[]>([])

  useEffect(() => {
    fetchAgentReports()
  }, [dateRange, statusFilter])

  const fetchAgentReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/agents/reports?dateRange=${dateRange}&status=${statusFilter}`
      )
      const data = await response.json()

      if (data.success) {
        setAgents(data.data.agents || [])
        setCommissionData(data.data.commissions || [])
        setPayoutData(data.data.payouts || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch agent reports',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching agent reports:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch agent reports',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      disabled: { color: 'bg-red-100 text-red-800', label: 'Disabled' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspended' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'bg-gray-100 text-gray-800',
      label: status.charAt(0).toUpperCase() + status.slice(1),
    }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPayoutStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'bg-gray-100 text-gray-800',
      label: status.charAt(0).toUpperCase() + status.slice(1),
    }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const totalCommissionEarned = commissionData.reduce(
    (sum, agent) => sum + agent.totalEarnings,
    0
  )
  const totalApplications = agents.reduce(
    (sum, agent) => sum + agent.performance.totalApplications,
    0
  )
  const approvedApplications = agents.reduce(
    (sum, agent) => sum + agent.performance.approvedApplications,
    0
  )
  const successRate =
    totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Agent Name',
      'Status',
      'Total Applications',
      'Approved',
      'Success Rate',
      'Avg Processing (days)',
      'Rating',
      'Total Earnings',
      'Last Payout',
    ]
    const rows = agents.map(agent => {
      const successRate =
        agent.performance.totalApplications > 0
          ? (agent.performance.approvedApplications /
              agent.performance.totalApplications) *
            100
          : 0
      const commission = commissionData.find(c => c.agentId === agent._id)
      const payout = payoutData.find(p => p.agentId === agent._id)
      return [
        agent.personalDetails.fullName,
        agent.status,
        agent.performance.totalApplications,
        agent.performance.approvedApplications,
        `${successRate.toFixed(1)}%`,
        agent.performance.averageProcessingTime,
        `${agent.performance.clientSatisfactionRating}/5`,
        `₹${commission?.totalEarnings || 0}`,
        payout?.date || 'Never',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `agent-reports-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Success',
      description: 'Report exported successfully',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Agent Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of agent performance, commissions, and payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchAgentReports}
            variant="outline"
            className="text-gray-700 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={loading || agents.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Agent Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search Agent
              </label>
              <Input placeholder="Search by name or ID..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Agents
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Commission
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalCommissionEarned.toLocaleString()}
                </p>
              </div>
              <span className="text-2xl font-semibold text-green-600">
                {currencySymbol}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalApplications}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {successRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Commission Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Agent
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Commission Rate
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Applications
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Total Earnings
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Last Payout
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissionData.map(agent => (
                  <tr key={agent.agentId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {agent.agentName}
                        </p>
                        <p className="text-sm text-gray-500">{agent.agentId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">
                        {agent.commissionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">
                        {agent.applicationsProcessed}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">
                        ₹{agent.totalEarnings.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{agent.lastPayout}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Agent
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Applications
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutData.map((payout, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payout.agentName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payout.agentId}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">
                        ₹{payout.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">
                        {payout.applications}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{payout.date}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getPayoutStatusBadge(payout.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Agent Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Agent
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Total Apps
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Approved
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Success Rate
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Avg Processing
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => {
                  const successRate =
                    agent.performance.totalApplications > 0
                      ? (agent.performance.approvedApplications /
                          agent.performance.totalApplications) *
                        100
                      : 0

                  return (
                    <tr key={agent._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {agent.personalDetails.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {agent.agentId}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(agent.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {agent.performance.totalApplications}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-medium">
                          {agent.performance.approvedApplications}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">
                          {agent.performance.averageProcessingTime} days
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-gray-900">
                            {agent.performance.clientSatisfactionRating}/5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
