'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, User, Shield, CreditCard } from 'lucide-react'
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
  notes: string
}

export default function AgentEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { symbol: currencySymbol } = useCurrency()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    status: 'pending' as string,
    kycStatus: 'pending' as string,
    commissionRate: 0,
    commissionType: 'percentage' as string,
    fixedCommissionAmount: 0,
    personalDetails: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      dateOfBirth: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
    },
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
    },
    notes: '',
  })

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
        setFormData({
          status: data.data.status,
          kycStatus: data.data.kycStatus,
          commissionRate: data.data.commissionRate,
          commissionType: data.data.commissionType,
          fixedCommissionAmount: data.data.fixedCommissionAmount || 0,
          personalDetails: data.data.personalDetails,
          bankDetails: data.data.bankDetails,
          notes: data.data.notes || '',
        })
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

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'personalDetails' && child.includes('.')) {
        const [subParent, subChild] = child.split('.')
        setFormData(prev => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            [subParent]: {
              ...(prev.personalDetails[
                subParent as keyof typeof prev.personalDetails
              ] as any),
              [subChild]: value,
            },
          },
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/agents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Agent updated successfully',
          duration: 3000,
        })
        router.push(`/admin/agents/${params.id}`)
      } else {
        throw new Error(data.error || 'Failed to update agent')
      }
    } catch (error) {
      console.error('Error updating agent:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update agent',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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
          <Link href={`/admin/agents/${params.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Agent</h1>
            <p className="text-gray-600 mt-1">
              Update agent information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(formData.status)}
          {getKycBadge(formData.kycStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Status & Commission Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg font-semibold">{currencySymbol}</span>
                Status & Commission Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Agent Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kycStatus">KYC Status</Label>
                  <Select
                    value={formData.kycStatus}
                    onValueChange={value =>
                      handleInputChange('kycStatus', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={e =>
                      handleInputChange(
                        'commissionRate',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="commissionType">Commission Type</Label>
                  <Select
                    value={formData.commissionType}
                    onValueChange={value =>
                      handleInputChange('commissionType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.commissionType === 'fixed' && (
                <div>
                  <Label htmlFor="fixedCommissionAmount">
                    Fixed Commission Amount (₹)
                  </Label>
                  <Input
                    id="fixedCommissionAmount"
                    type="number"
                    min="0"
                    value={formData.fixedCommissionAmount}
                    onChange={e =>
                      handleInputChange(
                        'fixedCommissionAmount',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              )}
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
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={e =>
                      handleInputChange(
                        'bankDetails.accountHolderName',
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={e =>
                      handleInputChange('bankDetails.bankName', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={e =>
                      handleInputChange(
                        'bankDetails.accountNumber',
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={e =>
                      handleInputChange('bankDetails.ifscCode', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  value={formData.bankDetails.branchName}
                  onChange={e =>
                    handleInputChange('bankDetails.branchName', e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.personalDetails.fullName}
                  onChange={e =>
                    handleInputChange(
                      'personalDetails.fullName',
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalDetails.email}
                  onChange={e =>
                    handleInputChange('personalDetails.email', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.personalDetails.phone}
                  onChange={e =>
                    handleInputChange('personalDetails.phone', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.personalDetails.dateOfBirth}
                  onChange={e =>
                    handleInputChange(
                      'personalDetails.dateOfBirth',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.personalDetails.address}
                onChange={e =>
                  handleInputChange('personalDetails.address', e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.personalDetails.city}
                  onChange={e =>
                    handleInputChange('personalDetails.city', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.personalDetails.state}
                  onChange={e =>
                    handleInputChange('personalDetails.state', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.personalDetails.pincode}
                  onChange={e =>
                    handleInputChange('personalDetails.pincode', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.personalDetails.emergencyContact.name}
                  onChange={e =>
                    handleInputChange(
                      'personalDetails.emergencyContact.name',
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.personalDetails.emergencyContact.phone}
                  onChange={e =>
                    handleInputChange(
                      'personalDetails.emergencyContact.phone',
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relation</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.personalDetails.emergencyContact.relation}
                  onChange={e =>
                    handleInputChange(
                      'personalDetails.emergencyContact.relation',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any notes about this agent..."
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Link href={`/admin/agents/${params.id}`}>
          <Button
            variant="outline"
            className="text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
