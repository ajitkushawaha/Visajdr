'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calculator,
  CreditCard,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

interface ConvenienceFeeSettings {
  isActive: boolean
  processingFeeEnabled: boolean
  fees: {
    onlineProcessing: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
    paymentMethod: {
      razorpay: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      stripe: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      upi: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      card: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      cashfree: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
    }
  }
}

export default function ConvenienceFee() {
  const { symbol: currencySymbol } = useCurrency()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  const DEFAULT_SETTINGS: ConvenienceFeeSettings = {
    isActive: false,
    processingFeeEnabled: false,
    fees: {
      onlineProcessing: {
        isActive: false,
        amount: 0,
        type: 'fixed',
        description: 'Online processing convenience fee',
      },
      paymentMethod: {
        razorpay: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Razorpay payment convenience fee',
        },
        stripe: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Stripe payment convenience fee',
        },
        upi: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'UPI payment convenience fee',
        },
        card: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Card payment convenience fee',
        },
        cashfree: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Cashfree payment convenience fee',
        },
      },
    },
  }

  const [settings, setSettings] =
    useState<ConvenienceFeeSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetchSettings()
  }, [])

  const normalizeSettings = (raw: any): ConvenienceFeeSettings => {
    const d = DEFAULT_SETTINGS
    const r = raw || {}
    const rf = r.fees || {}
    const rpm = rf.paymentMethod || {}

    return {
      isActive: r.isActive ?? d.isActive,
      processingFeeEnabled:
        r.processingFeeEnabled !== undefined
          ? r.processingFeeEnabled
          : d.processingFeeEnabled,
      fees: {
        onlineProcessing: {
          isActive:
            rf.onlineProcessing?.isActive ?? d.fees.onlineProcessing.isActive,
          amount: rf.onlineProcessing?.amount ?? d.fees.onlineProcessing.amount,
          type: rf.onlineProcessing?.type ?? d.fees.onlineProcessing.type,
          description:
            rf.onlineProcessing?.description ??
            d.fees.onlineProcessing.description,
        },
        paymentMethod: {
          razorpay: {
            isActive:
              rpm.razorpay?.isActive ?? d.fees.paymentMethod.razorpay.isActive,
            amount:
              rpm.razorpay?.amount ?? d.fees.paymentMethod.razorpay.amount,
            type: rpm.razorpay?.type ?? d.fees.paymentMethod.razorpay.type,
            description:
              rpm.razorpay?.description ??
              d.fees.paymentMethod.razorpay.description,
          },
          stripe: {
            isActive:
              rpm.stripe?.isActive ?? d.fees.paymentMethod.stripe.isActive,
            amount: rpm.stripe?.amount ?? d.fees.paymentMethod.stripe.amount,
            type: rpm.stripe?.type ?? d.fees.paymentMethod.stripe.type,
            description:
              rpm.stripe?.description ??
              d.fees.paymentMethod.stripe.description,
          },
          upi: {
            isActive: rpm.upi?.isActive ?? d.fees.paymentMethod.upi.isActive,
            amount: rpm.upi?.amount ?? d.fees.paymentMethod.upi.amount,
            type: rpm.upi?.type ?? d.fees.paymentMethod.upi.type,
            description:
              rpm.upi?.description ?? d.fees.paymentMethod.upi.description,
          },
          card: {
            isActive: rpm.card?.isActive ?? d.fees.paymentMethod.card.isActive,
            amount: rpm.card?.amount ?? d.fees.paymentMethod.card.amount,
            type: rpm.card?.type ?? d.fees.paymentMethod.card.type,
            description:
              rpm.card?.description ?? d.fees.paymentMethod.card.description,
          },
          cashfree: {
            isActive:
              rpm.cashfree?.isActive ?? d.fees.paymentMethod.cashfree.isActive,
            amount:
              rpm.cashfree?.amount ?? d.fees.paymentMethod.cashfree.amount,
            type: rpm.cashfree?.type ?? d.fees.paymentMethod.cashfree.type,
            description:
              rpm.cashfree?.description ??
              d.fees.paymentMethod.cashfree.description,
          },
        },
      },
    }
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/convenience-fees')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // API returns data directly, not nested in convenienceFees
          const normalized = normalizeSettings(data.data)
          setSettings(normalized)
        } else {
          console.log('No convenience fees found, using defaults')
          setSettings(DEFAULT_SETTINGS)
        }
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch convenience fee settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFee = async (category: string, field: string, value: any) => {
    // Update local state immediately for UI responsiveness
    const updatedSettings = {
      ...settings,
      fees: {
        ...settings.fees,
        [category]: {
          ...settings.fees[category as keyof typeof settings.fees],
          [field]: value,
        },
      },
    }

    setSettings(updatedSettings)

    // If toggling active/inactive, save immediately
    if (field === 'isActive') {
      try {
        const response = await fetch('/api/admin/convenience-fees', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ convenienceFees: updatedSettings }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          toast({
            title: 'Success',
            description: 'Fee setting updated successfully',
          })
        } else {
          // Revert on error
          setSettings(settings)
          throw new Error(result.error || 'Failed to update settings')
        }
      } catch (error) {
        console.error('Error updating fee:', error)
        toast({
          title: 'Error',
          description: `Failed to update fee setting: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        })
        // Revert to previous state
        setSettings(settings)
      }
    }
  }

  const updatePaymentMethodFee = async (
    method: string,
    field: string,
    value: any
  ) => {
    // Update local state immediately for UI responsiveness
    const pm: any = settings.fees.paymentMethod || {}
    const current = pm[method] || {
      isActive: false,
      amount: 0,
      type: 'fixed',
      description: '',
    }

    const updatedSettings = {
      ...settings,
      fees: {
        ...settings.fees,
        paymentMethod: {
          ...pm,
          [method]: {
            ...current,
            [field]: value,
          },
        },
      },
    }

    setSettings(updatedSettings)

    // If toggling active/inactive, save immediately
    if (field === 'isActive') {
      try {
        const response = await fetch('/api/admin/convenience-fees', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ convenienceFees: updatedSettings }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          toast({
            title: 'Success',
            description: 'Payment method fee updated successfully',
          })
        } else {
          // Revert on error
          setSettings(settings)
          throw new Error(result.error || 'Failed to update settings')
        }
      } catch (error) {
        console.error('Error updating payment method fee:', error)
        toast({
          title: 'Error',
          description: `Failed to update payment method fee: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        })
        // Revert to previous state
        setSettings(settings)
      }
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const formatFee = (amount: number, type: 'fixed' | 'percentage') => {
    if (type === 'percentage') {
      return `${amount}%`
    }
    return `₹${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading convenience fee settings...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Convenience Fee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Configure additional fees for different services and payment methods
          </p>
        </div>
      </div>

      {/* Processing Fee Feature Toggle */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calculator className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  Processing Fee Feature
                  {getStatusBadge(settings.processingFeeEnabled)}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enable to show processing fee field in visa creation form.
                  Each visa can have its own processing fee (e.g., UK: ₹200, US:
                  ₹300).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="processing-fee-enabled">Enable Feature</Label>
              <Switch
                id="processing-fee-enabled"
                checked={settings.processingFeeEnabled}
                onCheckedChange={async checked => {
                  const updatedSettings = {
                    ...settings,
                    processingFeeEnabled: checked,
                  }
                  setSettings(updatedSettings)

                  try {
                    const response = await fetch(
                      '/api/admin/convenience-fees',
                      {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          convenienceFees: updatedSettings,
                        }),
                      }
                    )

                    const result = await response.json()

                    if (response.ok && result.success) {
                      toast({
                        title: 'Success',
                        description:
                          'Processing fee feature updated successfully',
                      })
                    } else {
                      setSettings(settings)
                      throw new Error(
                        result.error || 'Failed to update settings'
                      )
                    }
                  } catch (error) {
                    console.error(
                      'Error updating processing fee feature:',
                      error
                    )
                    toast({
                      title: 'Error',
                      description: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: 'destructive',
                    })
                    setSettings(settings)
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Global Toggle */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  Convenience Fees System
                  {getStatusBadge(settings.isActive)}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enable or disable the entire convenience fee system
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="global-active">Enable System</Label>
              <Switch
                id="global-active"
                checked={settings.isActive}
                onCheckedChange={async checked => {
                  const updatedSettings = { ...settings, isActive: checked }
                  setSettings(updatedSettings)

                  try {
                    const response = await fetch(
                      '/api/admin/convenience-fees',
                      {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          convenienceFees: updatedSettings,
                        }),
                      }
                    )

                    const result = await response.json()

                    if (response.ok && result.success) {
                      toast({
                        title: 'Success',
                        description:
                          'Convenience fee system updated successfully',
                      })
                    } else {
                      setSettings(settings)
                      throw new Error(
                        result.error || 'Failed to update settings'
                      )
                    }
                  } catch (error) {
                    console.error(
                      'Error updating convenience fee system:',
                      error
                    )
                    toast({
                      title: 'Error',
                      description: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: 'destructive',
                    })
                    setSettings(settings)
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cashfree Payment Method Fee */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  Payment Method Fee (Cashfree)
                  {getStatusBadge(
                    settings?.fees?.paymentMethod?.cashfree?.isActive ?? false
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Fee applied when paying via Cashfree
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cashfree-fee-active">Active</Label>
              <Switch
                id="cashfree-fee-active"
                checked={
                  settings?.fees?.paymentMethod?.cashfree?.isActive ?? false
                }
                onCheckedChange={checked =>
                  updatePaymentMethodFee('cashfree', 'isActive', checked)
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="cashfree-fee-amount"
                className="text-sm font-medium text-gray-700"
              >
                Amount
              </Label>
              <Input
                id="cashfree-fee-amount"
                type="number"
                value={settings?.fees?.paymentMethod?.cashfree?.amount ?? 0}
                onChange={e =>
                  updatePaymentMethodFee(
                    'cashfree',
                    'amount',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="cashfree-fee-type"
                className="text-sm font-medium text-gray-700"
              >
                Type
              </Label>
              <Select
                value={settings?.fees?.paymentMethod?.cashfree?.type ?? 'fixed'}
                onValueChange={(value: 'fixed' | 'percentage') =>
                  updatePaymentMethodFee('cashfree', 'type', value)
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Current Fee
              </Label>
              <div className="text-lg font-semibold text-brand-primary">
                {formatFee(
                  settings?.fees?.paymentMethod?.cashfree?.amount ?? 0,
                  settings?.fees?.paymentMethod?.cashfree?.type ?? 'fixed'
                )}
              </div>
            </div>
          </div>
          <div>
            <Label
              htmlFor="cashfree-fee-description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Input
              id="cashfree-fee-description"
              value={settings?.fees?.paymentMethod?.cashfree?.description ?? ''}
              onChange={e =>
                updatePaymentMethodFee(
                  'cashfree',
                  'description',
                  e.target.value
                )
              }
              placeholder="Fee description for customers"
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <span className="text-lg font-semibold">{currencySymbol}</span>
            Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                {
                  Object.values(settings.fees).filter(
                    fee =>
                      typeof fee === 'object' &&
                      'isActive' in fee &&
                      fee.isActive
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Active Fee Types</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {settings.isActive ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                ₹
                {Object.values(settings.fees)
                  .reduce((total, fee) => {
                    if (
                      typeof fee === 'object' &&
                      'amount' in fee &&
                      fee.isActive
                    ) {
                      return total + (fee.amount || 0)
                    }
                    return total
                  }, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Fixed Fees</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
