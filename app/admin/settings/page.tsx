'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Loader2,
  Save,
  Check,
  UserIcon,
  Bell,
  MessageSquare,
  Mail,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

interface CompanySettings {
  companyName: string
  gstNo: string
  cinNo: string
  supportNo: string
  tollfreeNo: string
  whatsappNo: string
  supportEmail: string
  panName: string
  panNumber: string
  streetAddress: string
  country: string
  state: string
  city: string
  zipCode: string
  copyright: string
  googleAnalyticsHead: string
  googleAnalyticsBody: string
  googleSiteVerification: string
  googlePlacesApi: string
  googleApiKey: string
  googleClientSecret: string
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
  logoUrl: string
  faviconUrl: string
  facebookLink: string
  linkedinLink: string
  instagramLink: string
  twitterLink: string
  youtubeLink: string
  mailer: string
  smtpServer: string
  portNumber: string
  fromEmail: string
  emailId: string
  emailPassword: string
  ccEmail: string
  bccEmail: string
  androidAppUrl: string
  iosAppUrl: string
  metaRobots: string
  metaTitle: string
  metaKeyword: string
  metaDescription: string
  defaultCurrency?: string
  sendgridApiKey: string
  notificationSettings?: {
    email: { isActive: boolean; provider: string }
    sms: { isActive: boolean; provider: string }
    whatsapp: { isActive: boolean; provider: string }
  }
  twilioSettings?: {
    accountSid: string
    authToken: string
    phoneNumber: string
    whatsappNumber: string
    messagingServiceSid?: string
  }
  convenienceFees?: {
    isActive: boolean
    fees: {
      onlineProcessing: {
        isActive: boolean
        amount: number
        type: string
        description: string
      }
      paymentMethod: {
        razorpay: {
          isActive: boolean
          amount: number
          type: string
          description: string
        }
        stripe: {
          isActive: boolean
          amount: number
          type: string
          description: string
        }
        upi: {
          isActive: boolean
          amount: number
          type: string
          description: string
        }
        card: {
          isActive: boolean
          amount: number
          type: string
          description: string
        }
      }
      expressService: {
        isActive: boolean
        amount: number
        type: string
        description: string
      }
      documentProcessing: {
        isActive: boolean
        amount: number
        type: string
        description: string
      }
    }
  }
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab') || 'settings'
  const [users, setUsers] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    gstNo: '',
    cinNo: '',
    supportNo: '',
    tollfreeNo: '',
    whatsappNo: '',
    supportEmail: '',
    panName: '',
    panNumber: '',
    streetAddress: '',
    country: 'india',
    state: '',
    city: '',
    zipCode: '',
    copyright: '',
    googleAnalyticsHead: '',
    googleAnalyticsBody: '',
    googleSiteVerification: '',
    googlePlacesApi: 'AIzaSyDxaNW...........',
    googleApiKey: '',
    googleClientSecret: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    logoUrl: '',
    faviconUrl: '/favicon_io/favicon-32x32.png',
    facebookLink: '',
    linkedinLink: '',
    instagramLink: '',
    twitterLink: '',
    youtubeLink: '',
    mailer: 'smtp',
    smtpServer: '',
    portNumber: '',
    fromEmail: '',
    emailId: '',
    emailPassword: '',
    ccEmail: '',
    bccEmail: '',
    androidAppUrl: '',
    iosAppUrl: '',
    metaRobots: 'index_follow',
    metaTitle: '',
    metaKeyword: '',
    metaDescription: '',
    defaultCurrency: 'INR',
    notificationSettings: {
      email: { isActive: false, provider: 'smtp' },
      sms: { isActive: false, provider: 'twilio' },
      whatsapp: { isActive: false, provider: 'twilio' },
    },
    twilioSettings: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      whatsappNumber: '',
      messagingServiceSid: '',
    },
    sendgridApiKey: '',
  })

  useEffect(() => {
    fetchCompanySettings()
    getUsers()
  }, [])

  async function getUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        console.error('Failed to fetch users:', res.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  const fetchCompanySettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/company-settings')
      const result = await response.json()
      if (result.success) {
        // Ensure all string fields are never undefined to prevent controlled/uncontrolled input errors
        const sanitizedData = {
          ...result.data,
          companyName: result.data.companyName || '',
          gstNo: result.data.gstNo || '',
          cinNo: result.data.cinNo || '',
          supportNo: result.data.supportNo || '',
          tollfreeNo: result.data.tollfreeNo || '',
          whatsappNo: result.data.whatsappNo || '',
          supportEmail: result.data.supportEmail || '',
          panName: result.data.panName || '',
          panNumber: result.data.panNumber || '',
          streetAddress: result.data.streetAddress || '',
          country: result.data.country || 'india',
          state: result.data.state || '',
          city: result.data.city || '',
          zipCode: result.data.zipCode || '',
          copyright: result.data.copyright || '',
          googleAnalyticsHead: result.data.googleAnalyticsHead || '',
          googleAnalyticsBody: result.data.googleAnalyticsBody || '',
          googleSiteVerification: result.data.googleSiteVerification || '',
          googlePlacesApi: result.data.googlePlacesApi || '',
          googleApiKey: result.data.googleApiKey || '',
          googleClientSecret: result.data.googleClientSecret || '',
          cloudinaryCloudName: result.data.cloudinaryCloudName || '',
          cloudinaryApiKey: result.data.cloudinaryApiKey || '',
          cloudinaryApiSecret: result.data.cloudinaryApiSecret || '',
          logoUrl: result.data.logoUrl || '',
          faviconUrl: result.data.faviconUrl || '/favicon_io/favicon-32x32.png',
          facebookLink: result.data.facebookLink || '',
          linkedinLink: result.data.linkedinLink || '',
          instagramLink: result.data.instagramLink || '',
          twitterLink: result.data.twitterLink || '',
          youtubeLink: result.data.youtubeLink || '',
          mailer: result.data.mailer || 'smtp',
          smtpServer: result.data.smtpServer || '',
          portNumber: result.data.portNumber || '',
          fromEmail: result.data.fromEmail || '',
          emailId: result.data.emailId || '',
          emailPassword: result.data.emailPassword || '',
          ccEmail: result.data.ccEmail || '',
          bccEmail: result.data.bccEmail || '',
          androidAppUrl: result.data.androidAppUrl || '',
          iosAppUrl: result.data.iosAppUrl || '',
          metaRobots: result.data.metaRobots || 'index_follow',
          metaTitle: result.data.metaTitle || '',
          metaKeyword: result.data.metaKeyword || '',
          metaDescription: result.data.metaDescription || '',
          defaultCurrency: result.data.defaultCurrency || 'INR',
          notificationSettings: result.data.notificationSettings || {
            email: { isActive: false, provider: 'smtp' },
            sms: { isActive: false, provider: 'twilio' },
            whatsapp: { isActive: false, provider: 'twilio' },
          },
          twilioSettings: result.data.twilioSettings || {
            accountSid: '',
            authToken: '',
            phoneNumber: '',
            whatsappNumber: '',
            messagingServiceSid: '',
          },
          sendgridApiKey: result.data.sendgridApiKey || '',
        }
        setSettings(sanitizedData)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load company settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load company settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Validate required fields
      if (!settings.companyName || !settings.supportEmail) {
        toast({
          title: '⚠️ Validation Error',
          description: 'Company name and support email are required fields',
          variant: 'destructive',
          duration: 4000,
        })
        return
      }

      const response = await fetch('/api/admin/company-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        setSaveSuccess(true)
        toast({
          title: '✅ Settings Saved!',
          description: 'Your company settings have been updated successfully',
          duration: 4000,
        })
        setSettings(result.data)

        // Reset success state after animation
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        toast({
          title: '❌ Save Failed',
          description:
            result.error || 'Failed to save settings. Please try again.',
          variant: 'destructive',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: '❌ Network Error',
        description:
          'Failed to save company settings. Please check your connection and try again.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationToggle = (
    channel: 'email' | 'sms' | 'whatsapp',
    isActive: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings!,
        [channel]: {
          ...prev.notificationSettings![channel],
          isActive,
        },
      },
    }))
  }

  const handleTwilioChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      twilioSettings: {
        ...prev.twilioSettings!,
        [field]: value,
      },
    }))
  }

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setIsUploadingLogo(true)

      try {
        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'company-assets')

        // Upload to Cloudinary via API
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          handleInputChange('faviconUrl', result.image?.url || result.data?.url || '')
          toast({
            title: 'Success',
            description: 'Logo uploaded successfully',
          })
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Logo upload error:', error)
        toast({
          title: 'Error',
          description: 'Failed to upload logo',
          variant: 'destructive',
        })
        setLogoFile(null)
      } finally {
        setIsUploadingLogo(false)
      }
    }
  }

  const handleFaviconUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      setIsUploadingFavicon(true)

      try {
        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'company-assets')

        // Upload to Cloudinary via API
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          handleInputChange('faviconUrl', result.data.url)
          toast({
            title: 'Success',
            description: 'Favicon uploaded successfully',
          })
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Favicon upload error:', error)
        toast({
          title: 'Error',
          description: 'Failed to upload favicon',
          variant: 'destructive',
        })
        setFaviconFile(null)
      } finally {
        setIsUploadingFavicon(false)
      }
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        <Tabs defaultValue={tab} className="space-y-6">
          <TabsList className="grid h-auto w-full xl:grid-cols-3 md:grid-cols-1 bg-white border border-gray-200 rounded-lg">
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            >
              Company Settings
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            >
              Profile Settings
            </TabsTrigger>
            <TabsTrigger
              value="google-reviews"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            >
              Google Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            {/* Settings Header */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">
                  Settings
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Company Information */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={settings.companyName}
                      onChange={e =>
                        handleInputChange('companyName', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst-no">Company GST No</Label>
                    <Input
                      id="gst-no"
                      placeholder="Company GST No"
                      value={settings.gstNo}
                      onChange={e => handleInputChange('gstNo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cin-no">Company CIN No</Label>
                    <Input
                      id="cin-no"
                      value={settings.cinNo}
                      onChange={e => handleInputChange('cinNo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-no">Support No.</Label>
                    <Input
                      id="support-no"
                      value={settings.supportNo}
                      onChange={e =>
                        handleInputChange('supportNo', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tollfree-no">Tollfree No.</Label>
                    <Input
                      id="tollfree-no"
                      value={settings.tollfreeNo}
                      onChange={e =>
                        handleInputChange('tollfreeNo', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-no">Whatsapp No.</Label>
                    <Input
                      id="whatsapp-no"
                      value={settings.whatsappNo}
                      onChange={e =>
                        handleInputChange('whatsappNo', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email *</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={settings.supportEmail}
                      onChange={e =>
                        handleInputChange('supportEmail', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan-name">Pan Name</Label>
                    <Input
                      id="pan-name"
                      value={settings.panName}
                      onChange={e =>
                        handleInputChange('panName', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan-number">Pan Number</Label>
                    <Input
                      id="pan-number"
                      value={settings.panNumber}
                      onChange={e =>
                        handleInputChange('panNumber', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street-address">Street / Address</Label>
                    <Input
                      id="street-address"
                      value={settings.streetAddress}
                      onChange={e =>
                        handleInputChange('streetAddress', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={settings.country}
                      onValueChange={value =>
                        handleInputChange('country', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="usa">USA</SelectItem>
                        <SelectItem value="uk">UK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={settings.state}
                      onChange={e => handleInputChange('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={settings.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip-code">Zip Code</Label>
                    <Input
                      id="zip-code"
                      value={settings.zipCode}
                      onChange={e =>
                        handleInputChange('zipCode', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright">Copyright</Label>
                    <Input
                      id="copyright"
                      value={settings.copyright}
                      onChange={e =>
                        handleInputChange('copyright', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Analytics */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="google-analytics-head">
                      Google Analytics For Head / Chat Code & Others
                    </Label>
                    <Textarea
                      id="google-analytics-head"
                      placeholder="<script async src='https://www.googletagmanager.com/gtag/js?id=G-L5V00R4ZDB'></script>"
                      rows={4}
                      value={settings.googleAnalyticsHead}
                      onChange={e =>
                        handleInputChange('googleAnalyticsHead', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google-analytics-body">
                      Google Analytics For Body
                    </Label>
                    <Textarea
                      id="google-analytics-body"
                      placeholder="<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-L5V00R4ZDB');</script>"
                      rows={4}
                      value={settings.googleAnalyticsBody}
                      onChange={e =>
                        handleInputChange('googleAnalyticsBody', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Google Site Verification */}
                <div className="space-y-2">
                  <Label htmlFor="google-site-verification">
                    Google Site Verification
                  </Label>
                  <Input
                    id="google-site-verification"
                    type="text"
                    placeholder="google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.googleSiteVerification}
                    onChange={e =>
                      handleInputChange(
                        'googleSiteVerification',
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the content value from the meta tag: &lt;meta
                    name="google-site-verification" content="..." /&gt;
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="google-places-api">
                      Google Places API Key
                    </Label>
                    <Input
                      id="google-places-api"
                      type="text"
                      placeholder="AIzaSyDxaNWvg7z......"
                      value={settings.googlePlacesApi}
                      onChange={e =>
                        handleInputChange('googlePlacesApi', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google OAuth Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Google OAuth Configuration</CardTitle>
                <CardDescription>
                  Configure Google OAuth credentials for user authentication.
                  These will override environment variables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="google-client-id">Google Client ID</Label>
                    <Input
                      id="google-client-id"
                      placeholder="Enter Google Client ID"
                      value={settings.googleApiKey}
                      onChange={e =>
                        handleInputChange('googleApiKey', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google-client-secret">
                      Google Client Secret
                    </Label>
                    <Input
                      id="google-client-secret"
                      type="password"
                      placeholder="Enter Google Client Secret"
                      value={settings.googleClientSecret}
                      onChange={e =>
                        handleInputChange('googleClientSecret', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">
                    How it works:
                  </h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • These credentials will be used for Google OAuth
                      authentication
                    </li>
                    <li>
                      • If not configured, system will fallback to environment
                      variables
                    </li>
                    <li>• Changes take effect immediately after saving</li>
                    <li>
                      • Make sure to configure redirect URIs in your Google
                      Console
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cloudinary Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Cloudinary Configuration</CardTitle>
                <CardDescription>
                  Configure Cloudinary credentials for image upload and
                  management. These will override environment variables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinary-cloud-name">Cloud Name</Label>
                    <Input
                      id="cloudinary-cloud-name"
                      placeholder="Enter Cloudinary Cloud Name"
                      value={settings.cloudinaryCloudName}
                      onChange={e =>
                        handleInputChange('cloudinaryCloudName', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinary-api-key">API Key</Label>
                    <Input
                      id="cloudinary-api-key"
                      placeholder="Enter Cloudinary API Key"
                      value={settings.cloudinaryApiKey}
                      onChange={e =>
                        handleInputChange('cloudinaryApiKey', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinary-api-secret">API Secret</Label>
                    <Input
                      id="cloudinary-api-secret"
                      type="password"
                      placeholder="Enter Cloudinary API Secret"
                      value={settings.cloudinaryApiSecret}
                      onChange={e =>
                        handleInputChange('cloudinaryApiSecret', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">
                    How it works:
                  </h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • These credentials will be used for image uploads and
                      management
                    </li>
                    <li>
                      • If not configured, system will fallback to environment
                      variables
                    </li>
                    <li>• Changes take effect immediately after saving</li>
                    <li>
                      • Make sure to configure upload presets in your Cloudinary
                      dashboard
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Logo and Favicon */}
            <Card>
              <CardHeader>
                <CardTitle>Logo and Favicon Setting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="mb-4">
                        <Image
                          src={
                            settings.logoUrl ||
                            '/placeholder.svg?height=60&width=120&text=EURO+WORLD'
                          }
                          alt="Logo"
                          width={120}
                          height={60}
                          className="mx-auto"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={isUploadingLogo}
                        >
                          <span className="cursor-pointer">
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose file
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        {logoFile ? logoFile.name : 'No file chosen'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Favicon ( Favicon Icon Size 128 * 128 )</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="mb-4">
                        {settings.faviconUrl ? (
                          <div className="flex justify-center">
                            <Image
                              src={settings.faviconUrl}
                              alt="Favicon"
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded mx-auto"></div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label htmlFor="favicon-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={isUploadingFavicon}
                        >
                          <span className="cursor-pointer">
                            {isUploadingFavicon ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose file
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        {faviconFile ? faviconFile.name : 'No file chosen'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Link Setting */}
            <Card>
              <CardHeader>
                <CardTitle>Social Link Setting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook-link">Facebook Link</Label>
                    <Input
                      id="facebook-link"
                      value={settings.facebookLink}
                      onChange={e =>
                        handleInputChange('facebookLink', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-link">LinkedIn Link</Label>
                    <Input
                      id="linkedin-link"
                      value={settings.linkedinLink}
                      onChange={e =>
                        handleInputChange('linkedinLink', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-link">Instagram Link</Label>
                    <Input
                      id="instagram-link"
                      value={settings.instagramLink}
                      onChange={e =>
                        handleInputChange('instagramLink', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-link">Twitter Link</Label>
                    <Input
                      id="twitter-link"
                      value={settings.twitterLink}
                      onChange={e =>
                        handleInputChange('twitterLink', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-link">Youtube Link</Label>
                    <Input
                      id="youtube-link"
                      value={settings.youtubeLink}
                      onChange={e =>
                        handleInputChange('youtubeLink', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mailer">Mailer</Label>
                    <Select
                      value={settings.mailer}
                      onValueChange={value =>
                        handleInputChange('mailer', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">Other SMTP</SelectItem>
                        <SelectItem value="gmail">Gmail</SelectItem>
                        <SelectItem value="outlook">Outlook</SelectItem>
                        <SelectItem value="twilio">
                          Twilio (SendGrid)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(settings.mailer === 'twilio' ||
                    settings.notificationSettings?.email.provider ===
                      'twilio') && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="sendgrid-key">
                        SendGrid API Key (Twilio)
                      </Label>
                      <Input
                        id="sendgrid-key"
                        type="password"
                        placeholder="SG.xxxxxxxx.xxxxxxxx"
                        value={settings.sendgridApiKey}
                        onChange={e =>
                          handleInputChange('sendgridApiKey', e.target.value)
                        }
                        className="border-brand-primary/30 focus:border-brand-primary"
                      />
                      <p className="text-[10px] text-gray-500 italic">
                        Required if Mailer or Notification Provider is set to
                        Twilio.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      value={settings.smtpServer}
                      onChange={e =>
                        handleInputChange('smtpServer', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port-number">Port Number</Label>
                    <Input
                      id="port-number"
                      value={settings.portNumber}
                      onChange={e =>
                        handleInputChange('portNumber', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From E-mail ID</Label>
                    <Input
                      id="from-email"
                      value={settings.fromEmail}
                      onChange={e =>
                        handleInputChange('fromEmail', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-id">E-Mail ID</Label>
                    <Input
                      id="email-id"
                      value={settings.emailId}
                      onChange={e =>
                        handleInputChange('emailId', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-password">E-Mail ID Password</Label>
                    <Input
                      id="email-password"
                      type="password"
                      value={settings.emailPassword}
                      onChange={e =>
                        handleInputChange('emailPassword', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-email">CC Email</Label>
                    <Input
                      id="cc-email"
                      placeholder="CC Email"
                      value={settings.ccEmail}
                      onChange={e =>
                        handleInputChange('ccEmail', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc-email">BCC Email</Label>
                    <Input
                      id="bcc-email"
                      placeholder="BCC Email"
                      value={settings.bccEmail}
                      onChange={e =>
                        handleInputChange('bccEmail', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* App url settings */}
            <Card>
              <CardHeader>
                <CardTitle>App Url Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="android-app-url">Android App URL</Label>
                    <Input
                      id="android-app-url"
                      placeholder="Android App URL"
                      value={settings.androidAppUrl}
                      onChange={e =>
                        handleInputChange('androidAppUrl', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ios-app-url">iOS App URL</Label>
                    <Input
                      id="ios-app-url"
                      placeholder="IOS App URL"
                      value={settings.iosAppUrl}
                      onChange={e =>
                        handleInputChange('iosAppUrl', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription>
                  Set the default currency for displaying prices across the
                  website
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency *</Label>
                  <Select
                    value={settings.defaultCurrency || 'INR'}
                    onValueChange={value =>
                      handleInputChange('defaultCurrency', value)
                    }
                  >
                    <SelectTrigger id="default-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (Indian Rupees)</SelectItem>
                      <SelectItem value="USD">$ USD (US Dollars)</SelectItem>
                      <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                      <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                      <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    This currency will be used for displaying prices, fees, and
                    charges across the website
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-brand-primary" />
                  Notification Channels
                </CardTitle>
                <CardDescription>
                  Enable or disable notification methods for your users and
                  agents.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Send booking and status updates via Email.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={settings.notificationSettings?.email.provider}
                      onValueChange={value => {
                        setSettings(prev => ({
                          ...prev,
                          notificationSettings: {
                            ...prev.notificationSettings!,
                            email: {
                              ...prev.notificationSettings!.email,
                              provider: value,
                            },
                          },
                        }))
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={settings.notificationSettings?.email.isActive}
                      onCheckedChange={checked =>
                        handleNotificationToggle('email', checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        SMS Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Send text alerts via Twilio Programmable SMS.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notificationSettings?.sms.isActive}
                    onCheckedChange={checked =>
                      handleNotificationToggle('sms', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        WhatsApp Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Send alerts directly to user's WhatsApp.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notificationSettings?.whatsapp.isActive}
                    onCheckedChange={checked =>
                      handleNotificationToggle('whatsapp', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Twilio Configuration */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">
                  Twilio API Settings
                </CardTitle>
                <CardDescription>
                  Enter your Twilio credentials to enable SMS and WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-sid">Account SID</Label>
                    <Input
                      id="twilio-sid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.twilioSettings?.accountSid}
                      onChange={e =>
                        handleTwilioChange('accountSid', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-token">Auth Token</Label>
                    <Input
                      id="twilio-token"
                      type="password"
                      placeholder="Enter Auth Token"
                      value={settings.twilioSettings?.authToken}
                      onChange={e =>
                        handleTwilioChange('authToken', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                    <Input
                      id="twilio-phone"
                      placeholder="+1234567890"
                      value={settings.twilioSettings?.phoneNumber}
                      onChange={e =>
                        handleTwilioChange('phoneNumber', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-whatsapp">WhatsApp Number</Label>
                    <Input
                      id="twilio-whatsapp"
                      placeholder="whatsapp:+1234567890"
                      value={settings.twilioSettings?.whatsappNumber}
                      onChange={e =>
                        handleTwilioChange('whatsappNumber', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-service-sid">
                      Messaging Service SID (Optional)
                    </Label>
                    <Input
                      id="twilio-service-sid"
                      placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.twilioSettings?.messagingServiceSid}
                      onChange={e =>
                        handleTwilioChange(
                          'messagingServiceSid',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo">Meta Robots</Label>
                    <Select
                      value={settings.metaRobots}
                      onValueChange={value =>
                        handleInputChange('metaRobots', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index_follow">
                          INDEX, FOLLOW
                        </SelectItem>
                        <SelectItem value="noindex_follow">
                          NOINDEX, FOLLOW
                        </SelectItem>
                        <SelectItem value="index_nofollow">
                          INDEX, NOFOLLOW
                        </SelectItem>
                        <SelectItem value="noindex_nofollow">
                          NOINDEX, NOFOLLOW
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      placeholder="Meta Title"
                      value={settings.metaTitle}
                      onChange={e =>
                        handleInputChange('metaTitle', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta-keyword">Meta Keyword</Label>
                    <Textarea
                      id="meta-keyword"
                      placeholder="Meta Keyword"
                      value={settings.metaKeyword}
                      onChange={e =>
                        handleInputChange('metaKeyword', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-desc">Meta Description</Label>
                    <Textarea
                      id="meta-desc"
                      placeholder="Meta Description"
                      value={settings.metaDescription}
                      onChange={e =>
                        handleInputChange('metaDescription', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`px-8 transition-all duration-300 ${
                  saveSuccess
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-brand-primary hover:bg-brand-dark text-white'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : saveSuccess ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Saved!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <ProfileDetailsCard />
          </TabsContent>

          <TabsContent value="google-reviews" className="space-y-6">
            {/* Google Reviews Management */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">
                  Google Reviews Management
                </CardTitle>
                <CardDescription>
                  Manage your Google My Business reviews and sync settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Google Reviews Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Access the dedicated Google Reviews management page to sync
                    and manage your reviews.
                  </p>
                  <Button asChild>
                    <a href="/admin/settings/google-reviews">
                      Open Google Reviews Management
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
