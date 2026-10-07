'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

interface Agent {
  _id: string
  agentId: string
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'inactive'
    | 'disabled'
  kycStatus: 'pending' | 'verified' | 'rejected'
  commissionRate: number
  commissionType: 'percentage' | 'fixed'
  fixedCommissionAmount?: number
  personalDetails: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    dateOfBirth: string
    emergencyContact: {
      name: string
      phone: string
      relation: string
    }
  }
  businessDetails: {
    businessName?: string
    businessType: 'individual' | 'partnership' | 'company'
    gstNumber?: string
    businessAddress?: string
    yearsOfExperience: number
    previousAgency?: string
  }
  bankDetails: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branchName?: string
  }
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
  approvedBy?: {
    name: string
    email: string
  }
}

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { symbol: currencySymbol } = useCurrency()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAgent()
    }
  }, [params.id])

  const fetchAgent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/agents/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setAgent(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch agent details',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching agent:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch agent details',
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

  const getKycBadge = (kycStatus: string) => {
    const kycConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    }
    const config = kycConfig[kycStatus as keyof typeof kycConfig] || {
      color: 'bg-gray-100 text-gray-800',
      label: kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1),
    }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Agent not found</p>
        <Link href="/admin/agents">
          <Button className="mt-4">Back to Agents</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Details</h1>
            <p className="text-gray-600 mt-1">
              View and manage agent information
            </p>
          </div>
        </div>
        <Link href={`/admin/agents/${agent._id}/edit`}>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Agent
          </Button>
        </Link>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gray-600 text-white text-lg">
                {getInitials(agent.personalDetails.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {agent.personalDetails.fullName}
                </h2>
                {getStatusBadge(agent.status)}
                {getKycBadge(agent.kycStatus)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  ID: {agent.agentId}
                </span>
                <span>
                  Joined: {new Date(agent.createdAt).toLocaleDateString()}
                </span>
                {agent.approvedAt && (
                  <span>
                    Approved: {new Date(agent.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-gray-900">
                  {agent.personalDetails.fullName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {agent.personalDetails.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {agent.personalDetails.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(
                    agent.personalDetails.dateOfBirth
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Address
              </label>
              <p className="text-gray-900 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {agent.personalDetails.address}, {agent.personalDetails.city},{' '}
                {agent.personalDetails.state} - {agent.personalDetails.pincode}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Emergency Contact
              </label>
              <p className="text-gray-900">
                {agent.personalDetails.emergencyContact.name} (
                {agent.personalDetails.emergencyContact.relation}) -{' '}
                {agent.personalDetails.emergencyContact.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Holder
                </label>
                <p className="text-gray-900">
                  {agent.bankDetails.accountHolderName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Bank Name
                </label>
                <p className="text-gray-900">{agent.bankDetails.bankName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Number
                </label>
                <p className="text-gray-900 font-mono">
                  {agent.bankDetails.accountNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  IFSC Code
                </label>
                <p className="text-gray-900 font-mono">
                  {agent.bankDetails.ifscCode}
                </p>
              </div>
            </div>
            {agent.bankDetails.branchName && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Branch Name
                </label>
                <p className="text-gray-900">{agent.bankDetails.branchName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance & Commission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg font-semibold">{currencySymbol}</span>
              Performance & Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Commission Rate
                </label>
                <p className="text-gray-900">
                  {agent.commissionRate}% {agent.commissionType}
                  {agent.fixedCommissionAmount &&
                    ` (₹${agent.fixedCommissionAmount})`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Commission
                </label>
                <p className="text-gray-900">
                  ₹{agent.performance.totalCommissionEarned.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Applications
                </label>
                <p className="text-gray-900">
                  {agent.performance.totalApplications}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Approved Applications
                </label>
                <p className="text-gray-900">
                  {agent.performance.approvedApplications}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Success Rate
                </label>
                <p className="text-gray-900">
                  {agent.performance.totalApplications > 0
                    ? (
                        (agent.performance.approvedApplications /
                          agent.performance.totalApplications) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Avg Processing Time
                </label>
                <p className="text-gray-900">
                  {agent.performance.averageProcessingTime} days
                </p>
              </div>
            </div>
            {agent.approvedBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Approved By
                </label>
                <p className="text-gray-900">
                  {agent.approvedBy.name} ({agent.approvedBy.email})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
