'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ServicesPageData {
  _id?: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  heroImageAlt: string
  heroPrimaryButtonText: string
  heroPrimaryButtonLink: string
  heroSecondaryButtonText: string
  heroSecondaryButtonLink: string
  heroStats: Array<{ number: string; label: string }>
  definitionTitle: string
  definitionContent: string
  whyChooseUsTitle: string
  whyChooseUsSubtitle: string
  whyChooseUsItems: Array<{ title: string; description: string }>
  servicesTitle: string
  servicesSubtitle: string
  services: Array<{ icon: string; title: string; description: string }>
  processTitle: string
  processSubtitle: string
  processSteps: Array<{ number: string; title: string; description: string }>
  useCasesTitle: string
  useCasesSubtitle: string
  useCases: Array<{ icon: string; title: string; description: string }>
  testimonialsTitle: string
  testimonialsSubtitle: string
  testimonials: Array<{
    name: string
    destination: string
    text: string
    rating: number
  }>
  differentiatorTitle: string
  differentiatorSubtitle: string
  differentiatorItems: string[]
  countryServicesTitle: string
  countryServicesSubtitle: string
  countryServices: Array<{ name: string; service: string }>
  faqTitle: string
  faqSubtitle: string
  faqs: Array<{ question: string; answer: string }>
  ctaTitle: string
  ctaSubtitle: string
  ctaPrimaryButtonText: string
  ctaSecondaryButtonText: string
  ctaStats: Array<{ number: string; label: string }>
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  status: 'draft' | 'published'
}

export default function ServicesPageManagement() {
  const [data, setData] = useState<ServicesPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/pages/services')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to fetch services page data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error fetching services page data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/pages/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Services page updated successfully!')
      } else {
        toast.error('Failed to update services page')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      toast.error('Error saving services page')
    } finally {
      setSaving(false)
    }
  }

  const updateData = (field: string, value: any) => {
    if (!data) return
    setData({ ...data, [field]: value })
  }

  const addArrayItem = (field: keyof ServicesPageData, item: any) => {
    if (!data) return
    const currentArray = data[field] as any[]
    updateData(field, [...currentArray, item])
  }

  const updateArrayItem = (
    field: keyof ServicesPageData,
    index: number,
    item: any
  ) => {
    if (!data) return
    const currentArray = data[field] as any[]
    const newArray = [...currentArray]
    newArray[index] = { ...newArray[index], ...item }
    updateData(field, newArray)
  }

  const removeArrayItem = (field: keyof ServicesPageData, index: number) => {
    if (!data) return
    const currentArray = data[field] as any[]
    const newArray = currentArray.filter((_, i) => i !== index)
    updateData(field, newArray)
  }

  if (loading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services page data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="text-center">
            <p className="text-red-600">Failed to load services page data</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
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
              <Link href="/admin/content/pages/services">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Services Page Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Edit the main services page content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={data.status === 'published' ? 'default' : 'secondary'}
              >
                {data.status}
              </Badge>
              <Button
                variant="outline"
                onClick={() => window.open('/services', '_blank')}
                className="flex items-center gap-2 text-gray-900 bg-white hover:bg-gray-200"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
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
        </div>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your Services page will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[800px]">
              {/* Hero Section */}
              <section className="relative min-h-[400px] flex items-center justify-center bg-[#07034f] px-4 py-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left side - Image placeholder */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs h-48 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                      {data.heroImage ? (
                        <img
                          src={data.heroImage}
                          alt={data.heroImageAlt}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-white/60 text-center">
                          <div className="text-2xl mb-1">🌍</div>
                          <p className="text-xs">Travel Image</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="text-white space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-balance">
                        {data.heroTitle}
                      </h1>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {data.heroSubtitle}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button className="bg-white text-red-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg text-sm">
                        {data.heroPrimaryButtonText}
                      </button>
                      <button className="border-white text-white hover:bg-white/10 bg-transparent border px-4 py-2 rounded-lg text-sm">
                        {data.heroSecondaryButtonText}
                      </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="pt-4 grid grid-cols-3 gap-2 text-xs">
                      {data.heroStats.map((stat, index) => (
                        <div key={index}>
                          <p className="text-lg font-bold">{stat.number}</p>
                          <p className="text-white/80">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Definition Box */}
              <section className="py-8 px-4 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-3 text-gray-900">
                      {data.definitionTitle}
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {data.definitionContent}
                    </p>
                  </div>
                </div>
              </section>

              {/* Why Choose Us */}
              <section className="py-8 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.whyChooseUsTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.whyChooseUsSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.whyChooseUsItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-500 transition-colors"
                      >
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold mb-1 text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Services Grid */}
              <section className="py-8 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.servicesTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.servicesSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.services.map((service, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                          <span className="text-lg">{service.icon}</span>
                        </div>
                        <h3 className="text-sm font-semibold mb-2 text-gray-900">
                          {service.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Process Steps */}
              <section className="py-8 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.processTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.processSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {data.processSteps.map((step, index) => (
                      <div key={index} className="relative">
                        <div className="p-4 text-center h-full bg-gray-50 rounded-lg border border-gray-200 hover:border-red-500 transition-colors">
                          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">
                            {step.number}
                          </div>
                          <h3 className="text-xs font-semibold text-gray-900 mb-1">
                            {step.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {step.description}
                          </p>
                        </div>
                        {index < data.processSteps.length - 1 && (
                          <div className="hidden md:block absolute top-1/2 -right-1 w-2 h-0.5 bg-red-300 transform -translate-y-1/2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-12 px-4 bg-[#07034f]">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight text-balance">
                    {data.ctaTitle}
                  </h2>
                  <p className="text-sm text-white/90 mb-4 leading-relaxed">
                    {data.ctaSubtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button className="bg-white text-red-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg text-sm">
                      {data.ctaPrimaryButtonText}
                    </button>
                    <button className="border-white text-white hover:bg-white/10 bg-transparent border px-4 py-2 rounded-lg text-sm">
                      Contact Us
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                    {data.ctaStats.map((stat, index) => (
                      <div key={index}>
                        <p className="text-lg font-bold mb-1">{stat.number}</p>
                        <p className="text-xs text-white/80">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="definition">Definition</TabsTrigger>
            <TabsTrigger value="why-choose">Why Choose Us</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Configure the main hero section of your services page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hero Title
                      </label>
                      <Input
                        value={data.heroTitle}
                        onChange={e => updateData('heroTitle', e.target.value)}
                        placeholder="Enter hero title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hero Subtitle
                      </label>
                      <Textarea
                        value={data.heroSubtitle}
                        onChange={e =>
                          updateData('heroSubtitle', e.target.value)
                        }
                        placeholder="Enter hero subtitle"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hero Image URL
                      </label>
                      <Input
                        value={data.heroImage}
                        onChange={e => updateData('heroImage', e.target.value)}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hero Image Alt Text
                      </label>
                      <Input
                        value={data.heroImageAlt}
                        onChange={e =>
                          updateData('heroImageAlt', e.target.value)
                        }
                        placeholder="Enter alt text"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Button Text
                      </label>
                      <Input
                        value={data.heroPrimaryButtonText}
                        onChange={e =>
                          updateData('heroPrimaryButtonText', e.target.value)
                        }
                        placeholder="Enter button text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Button Link
                      </label>
                      <Input
                        value={data.heroPrimaryButtonLink}
                        onChange={e =>
                          updateData('heroPrimaryButtonLink', e.target.value)
                        }
                        placeholder="Enter button link"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Button Text
                      </label>
                      <Input
                        value={data.heroSecondaryButtonText}
                        onChange={e =>
                          updateData('heroSecondaryButtonText', e.target.value)
                        }
                        placeholder="Enter button text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Button Link
                      </label>
                      <Input
                        value={data.heroSecondaryButtonLink}
                        onChange={e =>
                          updateData('heroSecondaryButtonLink', e.target.value)
                        }
                        placeholder="Enter button link"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Stats */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Hero Statistics</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('heroStats', { number: '', label: '' })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stat
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.heroStats.map((stat, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <Input
                          value={stat.number}
                          onChange={e =>
                            updateArrayItem('heroStats', index, {
                              ...stat,
                              number: e.target.value,
                            })
                          }
                          placeholder="Number (e.g., 50K+)"
                          className="w-32"
                        />
                        <Input
                          value={stat.label}
                          onChange={e =>
                            updateArrayItem('heroStats', index, {
                              ...stat,
                              label: e.target.value,
                            })
                          }
                          placeholder="Label (e.g., Successful Cases)"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeArrayItem('heroStats', index)}
                          variant="outline"
                          size="sm"
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

          {/* Definition Section */}
          <TabsContent value="definition">
            <Card>
              <CardHeader>
                <CardTitle>Definition Section</CardTitle>
                <CardDescription>
                  Configure the "What is a Visa Consultancy Service?" section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Definition Title
                  </label>
                  <Input
                    value={data.definitionTitle}
                    onChange={e =>
                      updateData('definitionTitle', e.target.value)
                    }
                    placeholder="Enter definition title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Definition Content
                  </label>
                  <Textarea
                    value={data.definitionContent}
                    onChange={e =>
                      updateData('definitionContent', e.target.value)
                    }
                    placeholder="Enter definition content"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Why Choose Us Section */}
          <TabsContent value="why-choose">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us Section</CardTitle>
                <CardDescription>
                  Configure the why choose us section with features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.whyChooseUsTitle}
                      onChange={e =>
                        updateData('whyChooseUsTitle', e.target.value)
                      }
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.whyChooseUsSubtitle}
                      onChange={e =>
                        updateData('whyChooseUsSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Why Choose Us Items
                    </h3>
                    <Button
                      onClick={() =>
                        addArrayItem('whyChooseUsItems', {
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.whyChooseUsItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex gap-3 items-center">
                          <Input
                            value={item.title}
                            onChange={e =>
                              updateArrayItem('whyChooseUsItems', index, {
                                ...item,
                                title: e.target.value,
                              })
                            }
                            placeholder="Item title"
                            className="flex-1"
                          />
                          <Button
                            onClick={() =>
                              removeArrayItem('whyChooseUsItems', index)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={item.description}
                          onChange={e =>
                            updateArrayItem('whyChooseUsItems', index, {
                              ...item,
                              description: e.target.value,
                            })
                          }
                          placeholder="Item description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Section */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Section</CardTitle>
                <CardDescription>
                  Configure the services grid section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.servicesTitle}
                      onChange={e =>
                        updateData('servicesTitle', e.target.value)
                      }
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.servicesSubtitle}
                      onChange={e =>
                        updateData('servicesSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Services</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('services', {
                          icon: '',
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.services.map((service, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={service.icon}
                            onChange={e =>
                              updateArrayItem('services', index, {
                                ...service,
                                icon: e.target.value,
                              })
                            }
                            placeholder="Icon name (e.g., GraduationCap)"
                          />
                          <Input
                            value={service.title}
                            onChange={e =>
                              updateArrayItem('services', index, {
                                ...service,
                                title: e.target.value,
                              })
                            }
                            placeholder="Service title"
                          />
                          <Button
                            onClick={() => removeArrayItem('services', index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={service.description}
                          onChange={e =>
                            updateArrayItem('services', index, {
                              ...service,
                              description: e.target.value,
                            })
                          }
                          placeholder="Service description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Section */}
          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Process Section</CardTitle>
                <CardDescription>
                  Configure the step-by-step process section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.processTitle}
                      onChange={e => updateData('processTitle', e.target.value)}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.processSubtitle}
                      onChange={e =>
                        updateData('processSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Process Steps</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('processSteps', {
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
                    {data.processSteps.map((step, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Input
                            value={step.number}
                            onChange={e =>
                              updateArrayItem('processSteps', index, {
                                ...step,
                                number: e.target.value,
                              })
                            }
                            placeholder="Step number"
                            className="w-20"
                          />
                          <Input
                            value={step.title}
                            onChange={e =>
                              updateArrayItem('processSteps', index, {
                                ...step,
                                title: e.target.value,
                              })
                            }
                            placeholder="Step title"
                            className="flex-1"
                          />
                          <Button
                            onClick={() =>
                              removeArrayItem('processSteps', index)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={step.description}
                          onChange={e =>
                            updateArrayItem('processSteps', index, {
                              ...step,
                              description: e.target.value,
                            })
                          }
                          placeholder="Step description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Section */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>Testimonials Section</CardTitle>
                <CardDescription>
                  Configure customer testimonials and reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.testimonialsTitle}
                      onChange={e =>
                        updateData('testimonialsTitle', e.target.value)
                      }
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.testimonialsSubtitle}
                      onChange={e =>
                        updateData('testimonialsSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Testimonials</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('testimonials', {
                          name: '',
                          destination: '',
                          text: '',
                          rating: 5,
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.testimonials.map((testimonial, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Input
                            value={testimonial.name}
                            onChange={e =>
                              updateArrayItem('testimonials', index, {
                                ...testimonial,
                                name: e.target.value,
                              })
                            }
                            placeholder="Customer name"
                          />
                          <Input
                            value={testimonial.destination}
                            onChange={e =>
                              updateArrayItem('testimonials', index, {
                                ...testimonial,
                                destination: e.target.value,
                              })
                            }
                            placeholder="Destination"
                          />
                          <Input
                            value={testimonial.rating}
                            onChange={e =>
                              updateArrayItem('testimonials', index, {
                                ...testimonial,
                                rating: parseInt(e.target.value) || 5,
                              })
                            }
                            placeholder="Rating (1-5)"
                            type="number"
                            min="1"
                            max="5"
                          />
                          <Button
                            onClick={() =>
                              removeArrayItem('testimonials', index)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={testimonial.text}
                          onChange={e =>
                            updateArrayItem('testimonials', index, {
                              ...testimonial,
                              text: e.target.value,
                            })
                          }
                          placeholder="Testimonial text"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Section */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>FAQ Section</CardTitle>
                <CardDescription>
                  Configure frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.faqTitle}
                      onChange={e => updateData('faqTitle', e.target.value)}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.faqSubtitle}
                      onChange={e => updateData('faqSubtitle', e.target.value)}
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">FAQs</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('faqs', { question: '', answer: '' })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="flex-1 space-y-3">
                            <Input
                              value={faq.question}
                              onChange={e =>
                                updateArrayItem('faqs', index, {
                                  ...faq,
                                  question: e.target.value,
                                })
                              }
                              placeholder="FAQ question"
                            />
                            <Textarea
                              value={faq.answer}
                              onChange={e =>
                                updateArrayItem('faqs', index, {
                                  ...faq,
                                  answer: e.target.value,
                                })
                              }
                              placeholder="FAQ answer"
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={() => removeArrayItem('faqs', index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Section */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Configure SEO metadata for the services page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Page Title
                  </label>
                  <Input
                    value={data.seoTitle}
                    onChange={e => updateData('seoTitle', e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Description
                  </label>
                  <Textarea
                    value={data.seoDescription}
                    onChange={e => updateData('seoDescription', e.target.value)}
                    placeholder="Enter meta description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    value={data.seoKeywords.join(', ')}
                    onChange={e =>
                      updateData(
                        'seoKeywords',
                        e.target.value
                          .split(',')
                          .map(k => k.trim())
                          .filter(k => k)
                      )
                    }
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={data.status === 'published'}
                      onChange={() => updateData('status', 'published')}
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={data.status === 'draft'}
                      onChange={() => updateData('status', 'draft')}
                    />
                    Draft
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
