'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye, Trash2, Upload, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { slugify } from '@/utils/slugify'

interface ServiceDetailData {
  _id?: string
  title: string
  slug: string
  hero: {
    title: string
    subtitle: string
    image: string
    imageAlt?: string
    badgeText?: string
    primaryButtonText?: string
    primaryButtonLink?: string
    secondaryButtonText?: string
    secondaryButtonLink?: string
  }
  statistics?: Array<{ label: string; value: string; icon: string }>
  description: string
  applySectionTitle?: string
  applySectionSubtitle?: string
  applySectionDescription?: string
  visaInfo?: {
    title: string
    items: Array<{
      label: string
      value: string
      type:
        | 'sticker'
        | 'stay'
        | 'category'
        | 'entry'
        | 'validity'
        | 'processing'
        | 'document'
        | 'fees'
        | 'guest'
        | 'purpose'
        | 'business'
        | 'student'
        | 'medical'
        | 'tourist'
        | 'transit'
    }>
  }
  benefits: {
    title: string
    subtitle?: string
    items: Array<{ icon: string; title: string; description: string }>
  }
  requirements: {
    title: string
    subtitle?: string
    items: Array<{ title: string; description: string }>
  }
  process: {
    title: string
    subtitle?: string
    steps: Array<{ number?: string; title: string; description: string }>
  }
  comparison?: {
    title: string
    description: string
    atlysRate: string
    overallRate: string
    table: Array<{ title: string; good: string; bad: string }>
  }
  video?: {
    url: string
    poster: string
    title: string
    subtitle?: string
  }
  documentsSection?: {
    title: string
    steps: Array<{
      title: string
      description: string
      subtext?: string
      commonDocs?: {
        title: string
        items: Array<{ label: string; icon: string }>
      }
    }>
  }
  pricing?: {
    title: string
    govFee: string
    atlysFee: string
    totalFee: string
    ctaText: string
    guaranteeText: string
    guaranteeSubtext: string
  }
  reviews?: {
    rating: string
    totalCount: string
    items: Array<{
      name: string
      location: string
      date: string
      rating: number
      title: string
      comment: string
      initials: string
      color: string
      travelerType: string
      image?: string
    }>
  }
  faqs: {
    title: string
    subtitle?: string
    items: Array<{ question: string; answer: string }>
  }
  applicationPacket?: Array<{ src: string; label: string }>
  applicationPacketTitle?: string
  applicationPacketDescription?: string
  applicationPacketPreviewTitle?: string
  applicationPacketPreviewSubtitle?: string
  applicationPacketDisclaimer?: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  status: 'draft' | 'published'
}

const iconOptions = [
  'GraduationCap',
  'Briefcase',
  'Plane',
  'TrendingUp',
  'Home',
  'Users',
  'BookOpen',
  'CheckCircle2',
]

export default function ServiceDetailEditPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params?.id as string
  const isNew = serviceId === 'new'

  const [loading, setLoading] = useState(isNew ? false : true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ServiceDetailData>({
    title: '',
    slug: '',
    hero: {
      title: '',
      subtitle: '',
      image: '',
      imageAlt: '',
      primaryButtonText: 'Get Started Now',
      primaryButtonLink: '',
      secondaryButtonText: '',
      secondaryButtonLink: '',
    },
    statistics: [],
    description: '',
    applySectionTitle: '',
    applySectionSubtitle: '',
    applySectionDescription: '',
    visaInfo: {
      title: 'Visa Information',
      items: [],
    },
    benefits: {
      title: 'Benefits',
      subtitle: 'Why choose this service?',
      items: [],
    },
    requirements: {
      title: 'Requirements',
      subtitle: 'What you need to get started',
      items: [],
    },
    process: {
      title: 'Our Process',
      subtitle: 'How we help you',
      steps: [],
    },
    comparison: {
      title: 'Comparison',
      description: '',
      atlysRate: '99%',
      overallRate: '75%',
      table: [],
    },
    video: {
      url: '',
      poster: '',
      title: '',
      subtitle: '',
    },
    documentsSection: {
      title: 'Documents Required',
      steps: [],
    },
    pricing: {
      title: 'Pricing',
      govFee: '',
      atlysFee: '',
      totalFee: '',
      ctaText: 'Get Your Visa Or Full Refund',
      guaranteeText: 'Approval guaranteed, or your money back!',
      guaranteeSubtext:
        'This also includes the government fees. Zero loss for you!',
    },
    reviews: {
      rating: '4.8',
      totalCount: '1500+',
      items: [],
    },
    faqs: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions about this service',
      items: [],
    },
    applicationPacket: [],
    applicationPacketTitle: 'What you get',
    applicationPacketDescription:
      'Visa 4 gives you a fully prepared application packet with all required documents.',
    applicationPacketPreviewTitle: 'Your Final Application Preview',
    applicationPacketPreviewSubtitle: 'Application Packet',
    applicationPacketDisclaimer:
      'For illustrative purposes only; actual packet will reflect your details',
    seo: {
      title: '',
      description: '',
      keywords: [],
    },
    status: 'draft',
  })

  useEffect(() => {
    if (!isNew) {
      fetchServiceDetail()
    }
  }, [serviceId, isNew])

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !formData.slug) {
      const generatedSlug = slugify(formData.title)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title])

  const fetchServiceDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/service-details/${serviceId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFormData(data.serviceDetail)
        } else {
          toast.error('Failed to fetch service detail')
        }
      } else {
        toast.error('Failed to fetch service detail')
      }
    } catch (error) {
      console.error('Error fetching service detail:', error)
      toast.error('Error fetching service detail')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file')
      return
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${isVideo ? '50MB' : '10MB'}`)
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'service-details')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          onSuccess(data.image.url)
          toast.success('File uploaded successfully!')
        } else {
          toast.error(data.error || 'Failed to upload file')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const addArrayItem = (path: string, item: any) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      const arrayKey = keys[keys.length - 1]
      if (!current[arrayKey]) {
        current[arrayKey] = []
      }
      current[arrayKey] = [...current[arrayKey], item]
      return newData
    })
  }

  const updateArrayItem = (path: string, index: number, item: any) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      const arrayKey = keys[keys.length - 1]
      current[arrayKey] = [...current[arrayKey]]
      current[arrayKey][index] = { ...current[arrayKey][index], ...item }
      return newData
    })
  }

  const removeArrayItem = (path: string, index: number) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      const arrayKey = keys[keys.length - 1]
      current[arrayKey] = current[arrayKey].filter(
        (_: any, i: number) => i !== index
      )
      return newData
    })
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please fill in the title')
      return
    }

    if (!formData.slug) {
      toast.error('Please fill in the slug')
      return
    }

    setSaving(true)

    try {
      const url = isNew
        ? '/api/admin/service-details'
        : `/api/admin/service-details/${serviceId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success(
            isNew
              ? 'Service detail created successfully!'
              : 'Service detail updated successfully!'
          )
          if (isNew && data.serviceDetail?._id) {
            router.push(
              `/admin/content/pages/services/${data.serviceDetail._id}`
            )
          }
        } else {
          toast.error(data.error || 'Failed to save service detail')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save service detail')
      }
    } catch (error) {
      console.error('Error saving service detail:', error)
      toast.error('Error saving service detail. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/content/pages/services/list">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNew
                    ? 'Create New Service Detail Page'
                    : 'Edit Service Detail Page'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  formData.status === 'published' ? 'default' : 'secondary'
                }
              >
                {formData.status}
              </Badge>
              {!isNew && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`/services/${formData.slug}`, '_blank')
                  }
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap h-auto gap-2 p-1 bg-slate-100/50">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="apply-section">Apply Section</TabsTrigger>
            <TabsTrigger value="visa-info">Visa Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="app-packet">App Packet</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic details of your service page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="Enter service title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => handleInputChange('slug', e.target.value)}
                      placeholder="service-slug"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL-friendly identifier (auto-generated from title)
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published') =>
                      handleInputChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Configure the hero section of your service page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Hero Title</Label>
                    <Input
                      value={formData.hero.title}
                      onChange={e =>
                        handleInputChange('hero.title', e.target.value)
                      }
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div>
                    <Label>Hero Badge Text</Label>
                    <Input
                      value={formData.hero.badgeText}
                      onChange={e =>
                        handleInputChange('hero.badgeText', e.target.value)
                      }
                      placeholder="e.g. #1 Trusted Visa Consultant"
                    />
                  </div>
                  <div>
                    <Label>Hero Subtitle</Label>
                    <Input
                      value={formData.hero.subtitle}
                      onChange={e =>
                        handleInputChange('hero.subtitle', e.target.value)
                      }
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                </div>

                <div>
                  <Label>Hero Image</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      value={formData.hero.image}
                      onChange={e =>
                        handleInputChange('hero.image', e.target.value)
                      }
                      placeholder="Image URL or upload"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file)
                          handleFileUpload(file, url =>
                            handleInputChange('hero.image', url)
                          )
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  {formData.hero.image && (
                    <div className="mt-2">
                      <img
                        src={formData.hero.image}
                        alt="Preview"
                        className="max-w-xs h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Hero Image Alt Text</Label>
                  <Input
                    value={formData.hero.imageAlt}
                    onChange={e =>
                      handleInputChange('hero.imageAlt', e.target.value)
                    }
                    placeholder="Enter alt text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input
                      value={formData.hero.primaryButtonText}
                      onChange={e =>
                        handleInputChange(
                          'hero.primaryButtonText',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Primary Button Link</Label>
                    <Input
                      value={formData.hero.primaryButtonLink}
                      onChange={e =>
                        handleInputChange(
                          'hero.primaryButtonLink',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input
                      value={formData.hero.secondaryButtonText}
                      onChange={e =>
                        handleInputChange(
                          'hero.secondaryButtonText',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Secondary Button Link</Label>
                    <Input
                      value={formData.hero.secondaryButtonLink}
                      onChange={e =>
                        handleInputChange(
                          'hero.secondaryButtonLink',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <hr />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">
                      Hero Statistics
                    </Label>
                    <Button
                      onClick={() =>
                        addArrayItem('statistics', {
                          label: '',
                          value: '',
                          icon: 'CheckCircle2',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Statistic
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.statistics?.map((stat, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Label>Icon</Label>
                              <Select
                                value={stat.icon}
                                onValueChange={value =>
                                  updateArrayItem('statistics', index, {
                                    icon: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map(icon => (
                                    <SelectItem key={icon} value={icon}>
                                      {icon}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('statistics', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              value={stat.value}
                              onChange={e =>
                                updateArrayItem('statistics', index, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="e.g. 99%"
                            />
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={stat.label}
                              onChange={e =>
                                updateArrayItem('statistics', index, {
                                  label: e.target.value,
                                })
                              }
                              placeholder="e.g. Approval Rate"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apply Section Tab */}
          <TabsContent value="apply-section">
            <Card>
              <CardHeader>
                <CardTitle>Apply Section Intro</CardTitle>
                <CardDescription>
                  Configure the introductory text for the apply section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={formData.applySectionTitle}
                    onChange={e =>
                      handleInputChange('applySectionTitle', e.target.value)
                    }
                    placeholder="Apply Tourist Visa Online in India"
                  />
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Input
                    value={formData.applySectionSubtitle}
                    onChange={e =>
                      handleInputChange('applySectionSubtitle', e.target.value)
                    }
                    placeholder="Explore [Service Name] with Ease"
                  />
                </div>
                <div>
                  <Label>Section Description (HTML supported)</Label>
                  <Textarea
                    value={formData.applySectionDescription}
                    onChange={e =>
                      handleInputChange(
                        'applySectionDescription',
                        e.target.value
                      )
                    }
                    placeholder="Detailed introduction content..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visa Info Tab */}
          <TabsContent value="visa-info">
            <Card>
              <CardHeader>
                <CardTitle>Visa Information</CardTitle>
                <CardDescription>
                  Configure the visa details for the summary section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={formData.visaInfo?.title}
                    onChange={e =>
                      handleInputChange('visaInfo.title', e.target.value)
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Visa Info Items</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('visaInfo.items', {
                          label: '',
                          value: '',
                          type: 'sticker',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.visaInfo?.items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm text-gray-500">
                              Item #{index + 1}
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('visaInfo.items', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={item.label}
                              onChange={e =>
                                updateArrayItem('visaInfo.items', index, {
                                  label: e.target.value,
                                })
                              }
                              placeholder="e.g. Visa Type"
                            />
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              value={item.value}
                              onChange={e =>
                                updateArrayItem('visaInfo.items', index, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="e.g. Sticker"
                            />
                          </div>
                          <div>
                            <Label>Type Icon</Label>
                            <Select
                              value={item.type}
                              onValueChange={value =>
                                updateArrayItem('visaInfo.items', index, {
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sticker">Sticker</SelectItem>
                                <SelectItem value="stay">Stay</SelectItem>
                                <SelectItem value="category">
                                  Category
                                </SelectItem>
                                <SelectItem value="entry">Entry</SelectItem>
                                <SelectItem value="validity">
                                  Validity
                                </SelectItem>
                                <SelectItem value="processing">
                                  Processing Time
                                </SelectItem>
                                <SelectItem value="document">
                                  Documents
                                </SelectItem>
                                <SelectItem value="fees">Fees</SelectItem>
                                <SelectItem value="guest">
                                  Guest/Traveller
                                </SelectItem>
                                <SelectItem value="purpose">Purpose</SelectItem>
                                <SelectItem value="business">
                                  Business
                                </SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="tourist">Tourist</SelectItem>
                                <SelectItem value="transit">Transit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>
                  Add a detailed description of the service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter service description"
                  rows={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Section</CardTitle>
                <CardDescription>
                  Configure the benefits of this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.benefits.title}
                      onChange={e =>
                        handleInputChange('benefits.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Input
                      value={formData.benefits.subtitle}
                      onChange={e =>
                        handleInputChange('benefits.subtitle', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Benefits Items</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('benefits.items', {
                          icon: '',
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.benefits.items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Label>Icon</Label>
                              <Select
                                value={item.icon}
                                onValueChange={value =>
                                  updateArrayItem('benefits.items', index, {
                                    ...item,
                                    icon: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map(icon => (
                                    <SelectItem key={icon} value={icon}>
                                      {icon}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('benefits.items', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={item.title}
                              onChange={e =>
                                updateArrayItem('benefits.items', index, {
                                  ...item,
                                  title: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={e =>
                                updateArrayItem('benefits.items', index, {
                                  ...item,
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Requirements Section</CardTitle>
                <CardDescription>
                  Configure the requirements for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.requirements.title}
                      onChange={e =>
                        handleInputChange('requirements.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Input
                      value={formData.requirements.subtitle}
                      onChange={e =>
                        handleInputChange(
                          'requirements.subtitle',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Requirements Items</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('requirements.items', {
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.requirements.items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Label>Title</Label>
                              <Input
                                value={item.title}
                                onChange={e =>
                                  updateArrayItem('requirements.items', index, {
                                    ...item,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('requirements.items', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={e =>
                                updateArrayItem('requirements.items', index, {
                                  ...item,
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents Required Section</CardTitle>
                <CardDescription>
                  Configure the documents needed for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={formData.documentsSection?.title}
                    onChange={e =>
                      handleInputChange(
                        'documentsSection.title',
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Document Steps</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('documentsSection.steps', {
                          title: '',
                          description: '',
                          subtext: '',
                          commonDocs: { title: 'Common Documents', items: [] },
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document Step
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {formData.documentsSection?.steps.map((step, sIdx) => (
                      <Card key={sIdx} className="bg-slate-50/50">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between">
                            <Label className="font-bold">Step {sIdx + 1}</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('documentsSection.steps', sIdx)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={step.title}
                                onChange={e =>
                                  updateArrayItem(
                                    'documentsSection.steps',
                                    sIdx,
                                    { title: e.target.value }
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Subtext (Optional)</Label>
                              <Input
                                value={step.subtext}
                                onChange={e =>
                                  updateArrayItem(
                                    'documentsSection.steps',
                                    sIdx,
                                    { subtext: e.target.value }
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={step.description}
                              onChange={e =>
                                updateArrayItem(
                                  'documentsSection.steps',
                                  sIdx,
                                  { description: e.target.value }
                                )
                              }
                              rows={2}
                            />
                          </div>

                          {/* Common Docs Sub-section */}
                          <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm font-semibold">
                                Common Documents List
                              </Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const items = [
                                    ...(step.commonDocs?.items || []),
                                    { label: '', icon: 'FileText' },
                                  ]
                                  updateArrayItem(
                                    'documentsSection.steps',
                                    sIdx,
                                    {
                                      commonDocs: {
                                        ...(step.commonDocs || {
                                          title: 'Common Documents',
                                        }),
                                        items,
                                      },
                                    }
                                  )
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Doc Item
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {step.commonDocs?.items.map((doc, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex gap-2 items-end bg-white p-2 rounded border"
                                >
                                  <div className="flex-1">
                                    <Label className="text-[10px]">Label</Label>
                                    <Input
                                      className="h-8 text-sm"
                                      value={doc.label}
                                      onChange={e => {
                                        const items = [
                                          ...(step.commonDocs?.items || []),
                                        ]
                                        items[dIdx] = {
                                          ...items[dIdx],
                                          label: e.target.value,
                                        }
                                        updateArrayItem(
                                          'documentsSection.steps',
                                          sIdx,
                                          {
                                            commonDocs: {
                                              ...step.commonDocs!,
                                              items,
                                            },
                                          }
                                        )
                                      }}
                                    />
                                  </div>
                                  <div className="w-24">
                                    <Label className="text-[10px]">Icon</Label>
                                    <Select
                                      value={doc.icon}
                                      onValueChange={value => {
                                        const items = [
                                          ...(step.commonDocs?.items || []),
                                        ]
                                        items[dIdx] = {
                                          ...items[dIdx],
                                          icon: value,
                                        }
                                        updateArrayItem(
                                          'documentsSection.steps',
                                          sIdx,
                                          {
                                            commonDocs: {
                                              ...step.commonDocs!,
                                              items,
                                            },
                                          }
                                        )
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {iconOptions.map(icon => (
                                          <SelectItem key={icon} value={icon}>
                                            {icon}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500"
                                    onClick={() => {
                                      const items =
                                        step.commonDocs!.items.filter(
                                          (_, i) => i !== dIdx
                                        )
                                      updateArrayItem(
                                        'documentsSection.steps',
                                        sIdx,
                                        {
                                          commonDocs: {
                                            ...step.commonDocs!,
                                            items,
                                          },
                                        }
                                      )
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Process Section</CardTitle>
                <CardDescription>
                  Configure the process steps for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.process.title}
                      onChange={e =>
                        handleInputChange('process.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Input
                      value={formData.process.subtitle}
                      onChange={e =>
                        handleInputChange('process.subtitle', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Process Steps</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('process.steps', {
                          number: '',
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.process.steps.map((step, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex gap-2 items-center">
                            <div className="w-20">
                              <Label>Number</Label>
                              <Input
                                value={step.number}
                                onChange={e =>
                                  updateArrayItem('process.steps', index, {
                                    ...step,
                                    number: e.target.value,
                                  })
                                }
                                placeholder={String(index + 1)}
                              />
                            </div>
                            <div className="flex-1">
                              <Label>Title</Label>
                              <Input
                                value={step.title}
                                onChange={e =>
                                  updateArrayItem('process.steps', index, {
                                    ...step,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('process.steps', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={step.description}
                              onChange={e =>
                                updateArrayItem('process.steps', index, {
                                  ...step,
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Comparison Statistics</CardTitle>
                <CardDescription>
                  Configure the success rate comparison section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.comparison?.title}
                      onChange={e =>
                        handleInputChange('comparison.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Visa 4 Success Rate</Label>
                    <Input
                      value={formData.comparison?.atlysRate}
                      onChange={e =>
                        handleInputChange(
                          'comparison.atlysRate',
                          e.target.value
                        )
                      }
                      placeholder="e.g. 99%"
                    />
                  </div>
                  <div>
                    <Label>Overall Industry Rate</Label>
                    <Input
                      value={formData.comparison?.overallRate}
                      onChange={e =>
                        handleInputChange(
                          'comparison.overallRate',
                          e.target.value
                        )
                      }
                      placeholder="e.g. 75%"
                    />
                  </div>
                </div>
                <div>
                  <Label>Section Description</Label>
                  <Textarea
                    value={formData.comparison?.description}
                    onChange={e =>
                      handleInputChange(
                        'comparison.description',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Comparison Table Rows</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('comparison.table', {
                          title: '',
                          good: '',
                          bad: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Row
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.comparison?.table.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border"
                      >
                        <div className="flex-1">
                          <Label>Feature</Label>
                          <Input
                            value={row.title}
                            onChange={e =>
                              updateArrayItem('comparison.table', idx, {
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Visa 4 Benefit</Label>
                          <Input
                            value={row.good}
                            onChange={e =>
                              updateArrayItem('comparison.table', idx, {
                                good: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Others Disadvantage</Label>
                          <Input
                            value={row.bad}
                            onChange={e =>
                              updateArrayItem('comparison.table', idx, {
                                bad: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeArrayItem('comparison.table', idx)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Video Content</CardTitle>
                <CardDescription>
                  Add a featured video for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Video Title</Label>
                    <Input
                      value={formData.video?.title}
                      onChange={e =>
                        handleInputChange('video.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Video Subtitle</Label>
                    <Input
                      value={formData.video?.subtitle}
                      onChange={e =>
                        handleInputChange('video.subtitle', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Video URL (Direct MP4 or YouTube/Vimeo embed)</Label>
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={formData.video?.url}
                      onChange={e =>
                        handleInputChange('video.url', e.target.value)
                      }
                      placeholder="Video URL or upload"
                    />
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file)
                          handleFileUpload(file, url =>
                            handleInputChange('video.url', url)
                          )
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('video-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Poster Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={formData.video?.poster}
                      onChange={e =>
                        handleInputChange('video.poster', e.target.value)
                      }
                      placeholder="Poster image URL or upload"
                    />
                    <input
                      id="poster-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file)
                          handleFileUpload(file, url =>
                            handleInputChange('video.poster', url)
                          )
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('poster-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>FAQs Section</CardTitle>
                <CardDescription>
                  Configure frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.faqs.title}
                      onChange={e =>
                        handleInputChange('faqs.title', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Input
                      value={formData.faqs.subtitle}
                      onChange={e =>
                        handleInputChange('faqs.subtitle', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>FAQ Items</Label>
                    <Button
                      onClick={() =>
                        addArrayItem('faqs.items', { question: '', answer: '' })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.faqs.items.map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label>Question</Label>
                                <Input
                                  value={faq.question}
                                  onChange={e =>
                                    updateArrayItem('faqs.items', index, {
                                      ...faq,
                                      question: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Answer</Label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={e =>
                                    updateArrayItem('faqs.items', index, {
                                      ...faq,
                                      answer: e.target.value,
                                    })
                                  }
                                  rows={3}
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeArrayItem('faqs.items', index)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Packet Tab */}
          <TabsContent value="app-packet">
            <Card>
              <CardHeader>
                <CardTitle>Application Packet Carousel</CardTitle>
                <CardDescription>
                  Configure the images for the application packet preview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={formData.applicationPacketTitle}
                      onChange={e =>
                        handleInputChange(
                          'applicationPacketTitle',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Section Description</Label>
                    <Textarea
                      value={formData.applicationPacketDescription}
                      onChange={e =>
                        handleInputChange(
                          'applicationPacketDescription',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Preview Title</Label>
                    <Input
                      value={formData.applicationPacketPreviewTitle}
                      onChange={e =>
                        handleInputChange(
                          'applicationPacketPreviewTitle',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Preview Subtitle</Label>
                    <Input
                      value={formData.applicationPacketPreviewSubtitle}
                      onChange={e =>
                        handleInputChange(
                          'applicationPacketPreviewSubtitle',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Disclaimer Text</Label>
                    <Input
                      value={formData.applicationPacketDisclaimer}
                      onChange={e =>
                        handleInputChange(
                          'applicationPacketDisclaimer',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Label>Carousel Slides</Label>
                  <Button
                    onClick={() =>
                      addArrayItem('applicationPacket', { src: '', label: '' })
                    }
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Slide
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.applicationPacket?.map((slide, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">
                            Slide {idx + 1}
                          </Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeArrayItem('applicationPacket', idx)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Label / Caption</Label>
                          <Input
                            value={slide.label}
                            onChange={e =>
                              updateArrayItem('applicationPacket', idx, {
                                label: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              className="flex-1"
                              value={slide.src}
                              onChange={e =>
                                updateArrayItem('applicationPacket', idx, {
                                  src: e.target.value,
                                })
                              }
                              placeholder="Image URL or upload"
                            />
                            <input
                              id={`packet-upload-${idx}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file)
                                  handleFileUpload(file, url =>
                                    updateArrayItem('applicationPacket', idx, {
                                      src: url,
                                    })
                                  )
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById(`packet-upload-${idx}`)
                                  ?.click()
                              }
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {slide.src && (
                          <img
                            src={
                              slide.src.startsWith('http')
                                ? slide.src
                                : `https://media.atlys.com/b2c/schengen/Images/clp/carousel/${slide.src}`
                            }
                            className="h-24 w-full object-contain bg-slate-100 rounded"
                            alt="Preview"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Fees</CardTitle>
                <CardDescription>
                  Configure costs and guarantee information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Government Fee</Label>
                    <Input
                      value={formData.pricing?.govFee}
                      onChange={e =>
                        handleInputChange('pricing.govFee', e.target.value)
                      }
                      placeholder="e.g. ₹2,047"
                    />
                  </div>
                  <div>
                    <Label>Visa 4 Service Fee</Label>
                    <Input
                      value={formData.pricing?.atlysFee}
                      onChange={e =>
                        handleInputChange('pricing.atlysFee', e.target.value)
                      }
                      placeholder="e.g. ₹3,990"
                    />
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <Input
                      value={formData.pricing?.totalFee}
                      onChange={e =>
                        handleInputChange('pricing.totalFee', e.target.value)
                      }
                      placeholder="e.g. ₹6,037"
                    />
                  </div>
                </div>
                <div>
                  <Label>Button Text (CTA)</Label>
                  <Input
                    value={formData.pricing?.ctaText}
                    onChange={e =>
                      handleInputChange('pricing.ctaText', e.target.value)
                    }
                    placeholder="Get Your Visa Or Full Refund"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Guarantee Header</Label>
                    <Input
                      value={formData.pricing?.guaranteeText}
                      onChange={e =>
                        handleInputChange(
                          'pricing.guaranteeText',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Guarantee Subtext</Label>
                    <Textarea
                      value={formData.pricing?.guaranteeSubtext}
                      onChange={e =>
                        handleInputChange(
                          'pricing.guaranteeSubtext',
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  Manage verified reviews for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Overall Rating</Label>
                    <Input
                      value={formData.reviews?.rating}
                      onChange={e =>
                        handleInputChange('reviews.rating', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Total Reviews Count</Label>
                    <Input
                      value={formData.reviews?.totalCount}
                      onChange={e =>
                        handleInputChange('reviews.totalCount', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Label>Review Items</Label>
                  <Button
                    onClick={() =>
                      addArrayItem('reviews.items', {
                        name: '',
                        location: '',
                        rating: 5,
                        title: '',
                        comment: '',
                        initials: '',
                        color: 'bg-blue-500',
                        travelerType: 'Traveler',
                        date: new Date().toISOString(),
                      })
                    }
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Review
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.reviews?.items.map((review, idx) => (
                    <Card key={idx} className="bg-slate-50">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="w-1/3">
                              <Label>User Name</Label>
                              <Input
                                value={review.name}
                                onChange={e =>
                                  updateArrayItem('reviews.items', idx, {
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="w-1/3">
                              <Label>Location</Label>
                              <Input
                                value={review.location}
                                onChange={e =>
                                  updateArrayItem('reviews.items', idx, {
                                    location: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="w-1/3">
                              <Label>Initials</Label>
                              <Input
                                value={review.initials}
                                onChange={e =>
                                  updateArrayItem('reviews.items', idx, {
                                    initials: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeArrayItem('reviews.items', idx)
                            }
                            className="ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Rating (1-5)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={review.rating}
                              onChange={e =>
                                updateArrayItem('reviews.items', idx, {
                                  rating: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Traveler Type</Label>
                            <Input
                              value={review.travelerType}
                              onChange={e =>
                                updateArrayItem('reviews.items', idx, {
                                  travelerType: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Avatar Color (e.g. bg-blue-500)</Label>
                            <Input
                              value={review.color}
                              onChange={e =>
                                updateArrayItem('reviews.items', idx, {
                                  color: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Review Title</Label>
                          <Input
                            value={review.title}
                            onChange={e =>
                              updateArrayItem('reviews.items', idx, {
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Review Comment</Label>
                          <Textarea
                            value={review.comment}
                            onChange={e =>
                              updateArrayItem('reviews.items', idx, {
                                comment: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Profile Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              className="flex-1"
                              value={review.image}
                              onChange={e =>
                                updateArrayItem('reviews.items', idx, {
                                  image: e.target.value,
                                })
                              }
                              placeholder="Image URL or upload"
                            />
                            <input
                              id={`review-upload-${idx}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file)
                                  handleFileUpload(file, url =>
                                    updateArrayItem('reviews.items', idx, {
                                      image: url,
                                    })
                                  )
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById(`review-upload-${idx}`)
                                  ?.click()
                              }
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Configure SEO metadata for this service page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={formData.seo.title}
                    onChange={e =>
                      handleInputChange('seo.title', e.target.value)
                    }
                    placeholder="Leave empty to use service title"
                  />
                </div>
                <div>
                  <Label>SEO Description</Label>
                  <Textarea
                    value={formData.seo.description}
                    onChange={e =>
                      handleInputChange('seo.description', e.target.value)
                    }
                    placeholder="Meta description for search engines"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={formData.seo.keywords.join(', ')}
                    onChange={e =>
                      handleInputChange(
                        'seo.keywords',
                        e.target.value
                          .split(',')
                          .map(k => k.trim())
                          .filter(k => k)
                      )
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
