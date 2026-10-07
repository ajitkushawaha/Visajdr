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
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentGatewaySettings {
  razorpay: {
    isActive: boolean
    keyId: string
    keySecret: string
    webhookSecret: string
  }
  stripe: {
    isActive: boolean
    publishableKey: string
    secretKey: string
    webhookSecret: string
  }
  paypal: {
    isActive: boolean
    clientId: string
    clientSecret: string
    mode: 'sandbox' | 'live'
  }
  upi: {
    isActive: boolean
    upiId: string
    merchantName: string
  }
  cashfree: {
    isActive: boolean
    appId: string
    secretKey: string
    environment: 'sandbox' | 'production'
    webhookSecret: string
  }
}

export default function PaymentGateway() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  const [settings, setSettings] = useState<PaymentGatewaySettings>({
    razorpay: { isActive: false, keyId: '', keySecret: '', webhookSecret: '' },
    stripe: {
      isActive: false,
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    paypal: {
      isActive: false,
      clientId: '',
      clientSecret: '',
      mode: 'sandbox',
    },
    upi: { isActive: false, upiId: '', merchantName: '' },
    cashfree: {
      isActive: false,
      appId: '',
      secretKey: '',
      environment: 'sandbox',
      webhookSecret: '',
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Try new endpoint first, fallback to old one
      let response = await fetch('/api/admin/payment-methods')
      if (!response.ok) {
        // Fallback to old endpoint
        response = await fetch('/api/admin/company-settings')
      }

      if (response.ok) {
        const data = await response.json()
        // Handle both new and old API formats
        const pg = data.data?.paymentGateways || data.data

        if (data.success && pg) {
          // Merge fetched settings with defaults to ensure all gateways are initialized
          setSettings({
            razorpay: {
              isActive: pg.razorpay?.isActive ?? false,
              keyId: pg.razorpay?.keyId ?? '',
              keySecret: pg.razorpay?.keySecret ?? '',
              webhookSecret: pg.razorpay?.webhookSecret ?? '',
            },
            stripe: {
              isActive: pg.stripe?.isActive ?? false,
              publishableKey: pg.stripe?.publishableKey ?? '',
              secretKey: pg.stripe?.secretKey ?? '',
              webhookSecret: pg.stripe?.webhookSecret ?? '',
            },
            paypal: {
              isActive: pg.paypal?.isActive ?? false,
              clientId: pg.paypal?.clientId ?? '',
              clientSecret: pg.paypal?.clientSecret ?? '',
              mode: pg.paypal?.mode ?? 'sandbox',
            },
            upi: {
              isActive: pg.upi?.isActive ?? false,
              upiId: pg.upi?.upiId ?? '',
              merchantName: pg.upi?.merchantName ?? '',
            },
            cashfree: {
              isActive: (pg.cashfree as any)?.isActive ?? false,
              appId: (pg.cashfree as any)?.appId ?? '',
              secretKey: (pg.cashfree as any)?.secretKey ?? '',
              environment: (pg.cashfree as any)?.environment ?? 'sandbox',
              webhookSecret: (pg.cashfree as any)?.webhookSecret ?? '',
            },
          })
        } else {
          console.warn('⚠️ No paymentGateways found in response')
        }
      } else {
        console.error(
          '❌ Failed to fetch settings:',
          response.status,
          response.statusText
        )
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch payment gateway settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // Use new endpoint
      const response = await fetch('/api/admin/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentGateways: settings }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update settings directly from response to avoid stale data
        // Handle both new and old API formats
        const pg = result.data?.paymentGateways || result.data

        if (pg) {
          setSettings({
            razorpay: {
              isActive: pg.razorpay?.isActive ?? false,
              keyId: pg.razorpay?.keyId ?? '',
              keySecret: pg.razorpay?.keySecret ?? '',
              webhookSecret: pg.razorpay?.webhookSecret ?? '',
            },
            stripe: {
              isActive: pg.stripe?.isActive ?? false,
              publishableKey: pg.stripe?.publishableKey ?? '',
              secretKey: pg.stripe?.secretKey ?? '',
              webhookSecret: pg.stripe?.webhookSecret ?? '',
            },
            paypal: {
              isActive: pg.paypal?.isActive ?? false,
              clientId: pg.paypal?.clientId ?? '',
              clientSecret: pg.paypal?.clientSecret ?? '',
              mode: pg.paypal?.mode ?? 'sandbox',
            },
            upi: {
              isActive: pg.upi?.isActive ?? false,
              upiId: pg.upi?.upiId ?? '',
              merchantName: pg.upi?.merchantName ?? '',
            },
            cashfree: {
              isActive: (pg.cashfree as any)?.isActive ?? false,
              appId: (pg.cashfree as any)?.appId ?? '',
              secretKey: (pg.cashfree as any)?.secretKey ?? '',
              environment: (pg.cashfree as any)?.environment ?? 'sandbox',
              webhookSecret: (pg.cashfree as any)?.webhookSecret ?? '',
            },
          })
        } else {
          // Fallback: reload settings
          await fetchSettings()
        }

        toast({
          title: 'Success',
          description: 'Payment gateway settings saved successfully',
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Failed to save settings:', errorData)
        throw new Error(errorData.error || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment gateway settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateGateway = (
    gateway: keyof PaymentGatewaySettings,
    field: string,
    value: any
  ) => {
    setSettings(prev => {
      // If activating a gateway, deactivate all others and activate the selected one
      if (field === 'isActive' && value === true) {
        const updated: PaymentGatewaySettings = {
          razorpay: { ...prev.razorpay, isActive: gateway === 'razorpay' },
          stripe: { ...prev.stripe, isActive: gateway === 'stripe' },
          paypal: { ...prev.paypal, isActive: gateway === 'paypal' },
          upi: { ...prev.upi, isActive: gateway === 'upi' },
          cashfree: { ...prev.cashfree, isActive: gateway === 'cashfree' },
        }

        toast({
          title: 'Payment Method Activated',
          description: `${gateway.charAt(0).toUpperCase() + gateway.slice(1)} is now active. All other payment methods have been deactivated. Only one payment method can be active at a time.`,
        })

        return updated
      }

      // Normal update for other fields using explicit branches to keep types safe
      switch (gateway) {
        case 'razorpay':
          return { ...prev, razorpay: { ...prev.razorpay, [field]: value } }
        case 'stripe':
          return { ...prev, stripe: { ...prev.stripe, [field]: value } }
        case 'paypal':
          return { ...prev, paypal: { ...prev.paypal, [field]: value } }
        case 'upi':
          return { ...prev, upi: { ...prev.upi, [field]: value } }
        case 'cashfree':
          return { ...prev, cashfree: { ...prev.cashfree, [field]: value } }
        default:
          return prev
      }
    })
  }

  const getGatewayStatus = (gateway: keyof PaymentGatewaySettings) => {
    switch (gateway) {
      case 'razorpay': {
        const d = settings.razorpay
        if (!d?.isActive) return 'inactive'
        const hasRequired = !!(d.keyId?.trim() && d.keySecret?.trim())
        return hasRequired ? 'active' : 'inactive'
      }
      case 'stripe': {
        const d = settings.stripe
        if (!d?.isActive) return 'inactive'
        const hasRequired = !!(d.publishableKey?.trim() && d.secretKey?.trim())
        return hasRequired ? 'active' : 'inactive'
      }
      case 'paypal': {
        const d = settings.paypal
        if (!d?.isActive) return 'inactive'
        const hasRequired = !!(d.clientId?.trim() && d.clientSecret?.trim())
        return hasRequired ? 'active' : 'inactive'
      }
      case 'upi': {
        const d = settings.upi
        if (!d?.isActive) return 'inactive'
        // Only require UPI ID; Merchant Name is not needed/displayed
        const hasRequired = !!d.upiId?.trim()
        return hasRequired ? 'active' : 'inactive'
      }
      case 'cashfree': {
        const d = settings.cashfree
        if (!d?.isActive) {
          return 'inactive'
        }
        const appId = d.appId?.trim() || ''
        const secretKey = d.secretKey?.trim() || ''
        const hasRequiredFields = !!(appId && secretKey)

        const status = hasRequiredFields ? 'active' : 'inactive'

        return status
      }
      default:
        return 'inactive'
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading payment gateway settings...
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
            Payment Gateway Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure and manage payment gateways for your application
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSecrets(!showSecrets)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {showSecrets ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-brand-primary hover:bg-brand-dark text-white"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Configuration Instructions (Cashfree only) */}
      <Card className="bg-gray-50 border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Configuration Instructions
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  • <strong>Cashfree:</strong> Configure with your App ID and
                  Secret Key. Choose environment: Sandbox for testing or
                  Production for live.
                </p>
                <p className="text-xs mt-2">
                  💡 <strong>Note:</strong> Only Cashfree is currently in use;
                  other gateways are hidden. Only one payment method can be
                  active at a time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-Cashfree gateways are temporarily hidden */}

      {/* Cashfree */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  Cashfree
                  {getStatusBadge(getGatewayStatus('cashfree'))}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Cards, UPI, Wallets, Netbanking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cashfree-active">Active</Label>
              <Switch
                id="cashfree-active"
                checked={settings.cashfree?.isActive || false}
                onCheckedChange={checked => {
                  updateGateway('cashfree', 'isActive', checked)
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cashfree-app-id">App ID</Label>
              <Input
                id="cashfree-app-id"
                type={showSecrets ? 'text' : 'password'}
                value={settings.cashfree?.appId || ''}
                onChange={e => {
                  updateGateway('cashfree', 'appId', e.target.value)
                }}
                placeholder="Your Cashfree App ID"
              />
            </div>
            <div>
              <Label htmlFor="cashfree-secret-key">Secret Key</Label>
              <Input
                id="cashfree-secret-key"
                type={showSecrets ? 'text' : 'password'}
                value={settings.cashfree?.secretKey || ''}
                onChange={e => {
                  updateGateway('cashfree', 'secretKey', e.target.value)
                }}
                placeholder="Your Cashfree Secret Key"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cashfree-environment">Environment</Label>
            <Select
              value={settings.cashfree?.environment || 'sandbox'}
              onValueChange={(value: 'sandbox' | 'production') =>
                updateGateway('cashfree', 'environment', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production (Live)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cashfree-webhook">Webhook Secret (Optional)</Label>
            <div className="relative">
              <Input
                id="cashfree-webhook"
                type={showSecrets || showWebhookSecret ? 'text' : 'password'}
                value={settings.cashfree?.webhookSecret || ''}
                onChange={e =>
                  updateGateway('cashfree', 'webhookSecret', e.target.value)
                }
                placeholder="Webhook secret for payment verification"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showWebhookSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Credential Validation */}
          {settings.cashfree?.appId && settings.cashfree?.secretKey && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {settings.cashfree.appId.trim() &&
                  settings.cashfree.secretKey.trim() ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Credentials configured
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Please enter both App ID and Secret Key
                    </span>
                  )}
                </div>
                {settings.cashfree.environment && (
                  <Badge variant="outline" className="text-xs">
                    {settings.cashfree.environment === 'production'
                      ? 'Production'
                      : 'Sandbox'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {
                Object.entries(settings).filter(([key, g]) => {
                  const status = getGatewayStatus(
                    key as keyof PaymentGatewaySettings
                  )

                  return status === 'active'
                }).length
              }
            </div>
            <div className="text-sm text-gray-600">Active Gateways</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {
                Object.entries(settings).filter(([key, g]) => {
                  return (
                    g.isActive &&
                    getGatewayStatus(key as keyof PaymentGatewaySettings) ===
                      'inactive'
                  )
                }).length
              }
            </div>
            <div className="text-sm text-gray-600">Needs Setup</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {Object.values(settings).filter(g => !g.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-brand-primary">
              {Object.values(settings).filter(g => g.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Total Active</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
