'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Ban
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Agent {
  _id: string
  agentId: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive' | 'disabled'
  kycStatus: 'pending' | 'verified' | 'rejected'
  commissionRate: number
  commissionType: 'percentage' | 'fixed'
  personalDetails: {
    fullName: string
    email: string
    phone: string
  }
  performance: {
    totalApplications: number
    approvedApplications: number
    totalCommissionEarned: number
  }
  createdAt: string
  approvedAt?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(kycFilter && kycFilter !== 'all' && { kycStatus: kycFilter })
      })

      const response = await fetch(`/api/admin/agents?${params}`)
      const data = await response.json()

      if (data.success) {
        setAgents(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [currentPage, searchTerm, statusFilter, kycFilter])

  // Handle agent status update
  const handleStatusUpdate = async (agentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to update agent status';
        const validationDetails = data.details ? ` (${data.details.map((d: any) => d.message).join(', ')})` : '';
        throw new Error(errorMessage + validationDetails);
      }
      
      if (data.success) {
        // Update the agent in the local state
        setAgents(prevAgents =>
          prevAgents.map(agent =>
            agent._id === agentId
              ? { ...agent, status: newStatus as any, approvedAt: newStatus === 'approved' ? new Date().toISOString() : agent.approvedAt }
              : agent
          )
        )

        toast({
          title: "✅ Status Updated",
          description: `Agent has been ${newStatus} successfully`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error updating agent status:', error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to update agent status. Please try again.",
        variant: "destructive",
        duration: 4000,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      disabled: { color: 'bg-red-100 text-red-800', label: 'Disabled' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspended' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      label: status.charAt(0).toUpperCase() + status.slice(1) 
    }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getKycBadge = (kycStatus: string) => {
    const kycConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    }
    const config = kycConfig[kycStatus as keyof typeof kycConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      label: kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1) 
    }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage agents, commissions, and payouts</p>
        </div>
        <div className="flex items-center gap-4">
          
          <Button variant="outline" className="text-gray-700 hover:text-gray-900">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'approved').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'suspended').length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Status</SelectItem>
                <SelectItem value="pending">KYC Pending</SelectItem>
                <SelectItem value="verified">KYC Verified</SelectItem>
                <SelectItem value="rejected">KYC Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agents List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                         
                          <div>
                            <p className="font-medium text-gray-900">
                              {agent.personalDetails.fullName}
                            </p>
                           
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {agent.agentId}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(agent.status)}</TableCell>
                      <TableCell>{getKycBadge(agent.kycStatus)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {agent.commissionRate}% {agent.commissionType}
                          </p>
                          <p className="text-gray-500">
                            ₹{agent.performance.totalCommissionEarned.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {agent.performance.totalApplications} applications
                          </p>
                          <p className="text-gray-500">
                            {agent.performance.approvedApplications} approved
                          </p>
                          {agent.status === 'approved' && agent.approvedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Approved: {new Date(agent.approvedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/agents/${agent._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {/* Edit Button */}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/agents/${agent._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          {/* Status Action Buttons */}
                          {agent.status === 'pending' || agent.status === 'disabled' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(agent._id, 'approved')}
                              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          ) : agent.status === 'approved' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(agent._id, 'disabled')}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Disable
                            </Button>
                          ) : agent.status === 'suspended' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(agent._id, 'approved')}
                              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
