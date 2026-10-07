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

interface CareerPageData {
  _id?: string
  heroTitle: string
  heroSubtitle: string
  heroPrimaryButtonText: string
  heroPrimaryButtonLink: string
  heroSecondaryButtonText: string
  heroSecondaryButtonLink: string
  companyStats: Array<{ number: string; label: string }>
  openPositionsTitle: string
  openPositionsSubtitle: string
  openPositionsDescription: string
  openPositions: Array<{
    title: string
    department: string
    location: string
    type: string
    description: string
  }>
  benefitsTitle: string
  benefitsSubtitle: string
  benefits: Array<{ icon: string; title: string; description: string }>
  valuesTitle: string
  valuesSubtitle: string
  companyValues: Array<{ icon: string; title: string; description: string }>
  cultureTitle: string
  cultureSubtitle: string
  cultureDescription: string
  cultureFeatures: string[]
  applicationProcessTitle: string
  applicationProcessSubtitle: string
  applicationSteps: Array<{
    number: string
    title: string
    description: string
  }>
  ctaTitle: string
  ctaSubtitle: string
  ctaPrimaryButtonText: string
  ctaSecondaryButtonText: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  status: 'draft' | 'published'
}

export default function CareerPageManagement() {
  const [data, setData] = useState<CareerPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/pages/career')
      const result = await response.json()

      if (result.success) {
        // Ensure openPositions array is always initialized
        const dataWithDefaults = {
          ...result.data,
          openPositions: result.data.openPositions || [],
        }
        setData(dataWithDefaults)
      } else {
        toast.error('Failed to fetch career page data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error fetching career page data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/pages/career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Career page updated successfully!')
      } else {
        toast.error('Failed to update career page')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      toast.error('Error saving career page')
    } finally {
      setSaving(false)
    }
  }

  const updateData = (field: string, value: any) => {
    if (!data) return
    setData({ ...data, [field]: value })
  }

  const addArrayItem = (field: keyof CareerPageData, item: any) => {
    if (!data) return
    const currentArray = data[field] as any[]
    updateData(field, [...currentArray, item])
  }

  const updateArrayItem = (
    field: keyof CareerPageData,
    index: number,
    item: any
  ) => {
    if (!data) return
    const currentArray = data[field] as any[]
    const newArray = [...currentArray]
    newArray[index] = { ...newArray[index], ...item }
    updateData(field, newArray)
  }

  const removeArrayItem = (field: keyof CareerPageData, index: number) => {
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading career page data...</p>
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
            <p className="text-red-600">Failed to load career page data</p>
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
              <Link href="/admin/content">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Content
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Career Page Management
                </h1>
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
                onClick={() => window.open('/career', '_blank')}
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
              See how your Career page will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[800px]">
              {/* Hero Section */}
              <section className="relative min-h-[400px] flex items-center justify-center bg-[#07034f] px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-white text-balance">
                        {data.heroTitle}
                      </h1>
                      <p className="text-sm text-white/90 leading-relaxed max-w-2xl mx-auto">
                        {data.heroSubtitle}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                      <button className="bg-white text-red-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg text-sm">
                        {data.heroPrimaryButtonText}
                      </button>
                      <button className="border-white text-white hover:bg-white/10 bg-transparent border px-4 py-2 rounded-lg text-sm">
                        {data.heroSecondaryButtonText}
                      </button>
                    </div>

                    {/* Company Stats */}
                    <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                      {data.companyStats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <p className="text-lg font-bold">{stat.number}</p>
                          <p className="text-xs text-white/80">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Open Positions */}
              <section className="py-8 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.openPositionsTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.openPositionsSubtitle}
                    </p>
                  </div>

                  {data.openPositionsDescription && (
                    <div className="text-center mb-8">
                      <p className="text-sm text-gray-700 max-w-2xl mx-auto">
                        {data.openPositionsDescription}
                      </p>
                    </div>
                  )}

                  {!data.openPositions || data.openPositions.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg">💼</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        No open positions at the moment
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Check back soon for new opportunities
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.openPositions?.map((position, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {position.title}
                            </h3>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              {position.type}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Department:</span>{' '}
                              {position.department}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Location:</span>{' '}
                              {position.location}
                            </p>
                          </div>
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {position.description}
                          </p>
                          <button className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium">
                            Apply Now →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Benefits */}
              <section className="py-8 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.benefitsTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.benefitsSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                          <span className="text-lg">{benefit.icon}</span>
                        </div>
                        <h3 className="text-sm font-semibold mb-2 text-gray-900">
                          {benefit.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Company Values */}
              <section className="py-8 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.valuesTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.valuesSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.companyValues.map((value, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-500 transition-colors"
                      >
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold mb-1 text-gray-900">
                            {value.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Company Culture */}
              <section className="py-8 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.cultureTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.cultureSubtitle}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {data.cultureDescription}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {data.cultureFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Application Process */}
              <section className="py-8 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      {data.applicationProcessTitle}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {data.applicationProcessSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {data.applicationSteps.map((step, index) => (
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
                        {index < data.applicationSteps.length - 1 && (
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
                      {data.ctaSecondaryButtonText}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Configure the main hero section of your career page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      onChange={e => updateData('heroSubtitle', e.target.value)}
                      placeholder="Enter hero subtitle"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                  <div className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Stats Section */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Company Statistics</CardTitle>
                <CardDescription>
                  Configure the company statistics section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Company Stats</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('companyStats', { number: '', label: '' })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stat
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.companyStats.map((stat, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <Input
                          value={stat.number}
                          onChange={e =>
                            updateArrayItem('companyStats', index, {
                              ...stat,
                              number: e.target.value,
                            })
                          }
                          placeholder="Number (e.g., 200+)"
                          className="w-32"
                        />
                        <Input
                          value={stat.label}
                          onChange={e =>
                            updateArrayItem('companyStats', index, {
                              ...stat,
                              label: e.target.value,
                            })
                          }
                          placeholder="Label (e.g., Team Members)"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeArrayItem('companyStats', index)}
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

          {/* Open Positions Section */}
          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>
                  Manage the open positions section content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.openPositionsTitle}
                      onChange={e =>
                        updateData('openPositionsTitle', e.target.value)
                      }
                      placeholder="Open Positions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.openPositionsSubtitle}
                      onChange={e =>
                        updateData('openPositionsSubtitle', e.target.value)
                      }
                      placeholder="Join our team and grow with us"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={data.openPositionsDescription}
                    onChange={e =>
                      updateData('openPositionsDescription', e.target.value)
                    }
                    placeholder="At Visa4, every role matters. From visa consultants to support staff, our team helps travelers reach their dreams. Grow your skills, collaborate with passionate people, and make a real impact."
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Job Positions</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('openPositions', {
                          title: '',
                          department: '',
                          location: '',
                          type: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Position
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.openPositions?.map((position, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Position #{index + 1}</h4>
                          <Button
                            onClick={() =>
                              removeArrayItem('openPositions', index)
                            }
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Job Title
                            </label>
                            <Input
                              value={position.title}
                              onChange={e =>
                                updateArrayItem('openPositions', index, {
                                  title: e.target.value,
                                })
                              }
                              placeholder="e.g., Senior Visa Consultant"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Department
                            </label>
                            <Input
                              value={position.department}
                              onChange={e =>
                                updateArrayItem('openPositions', index, {
                                  department: e.target.value,
                                })
                              }
                              placeholder="e.g., Operations"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Location
                            </label>
                            <Input
                              value={position.location}
                              onChange={e =>
                                updateArrayItem('openPositions', index, {
                                  location: e.target.value,
                                })
                              }
                              placeholder="e.g., New Delhi, India"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Job Type
                            </label>
                            <Input
                              value={position.type}
                              onChange={e =>
                                updateArrayItem('openPositions', index, {
                                  type: e.target.value,
                                })
                              }
                              placeholder="e.g., Full-time, Remote"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Job Description
                          </label>
                          <Textarea
                            value={position.description}
                            onChange={e =>
                              updateArrayItem('openPositions', index, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Describe the role, responsibilities, and requirements..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Section */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Section</CardTitle>
                <CardDescription>
                  Configure the employee benefits section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.benefitsTitle}
                      onChange={e =>
                        updateData('benefitsTitle', e.target.value)
                      }
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.benefitsSubtitle}
                      onChange={e =>
                        updateData('benefitsSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Benefits</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('benefits', {
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
                    {data.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={benefit.icon}
                            onChange={e =>
                              updateArrayItem('benefits', index, {
                                ...benefit,
                                icon: e.target.value,
                              })
                            }
                            placeholder="Icon name (e.g., Heart)"
                          />
                          <Input
                            value={benefit.title}
                            onChange={e =>
                              updateArrayItem('benefits', index, {
                                ...benefit,
                                title: e.target.value,
                              })
                            }
                            placeholder="Benefit title"
                          />
                          <Button
                            onClick={() => removeArrayItem('benefits', index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={benefit.description}
                          onChange={e =>
                            updateArrayItem('benefits', index, {
                              ...benefit,
                              description: e.target.value,
                            })
                          }
                          placeholder="Benefit description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Values Section */}
          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle>Company Values Section</CardTitle>
                <CardDescription>
                  Configure the company values section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.valuesTitle}
                      onChange={e => updateData('valuesTitle', e.target.value)}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.valuesSubtitle}
                      onChange={e =>
                        updateData('valuesSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Company Values</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('companyValues', {
                          icon: '',
                          title: '',
                          description: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Value
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {data.companyValues.map((value, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={value.icon}
                            onChange={e =>
                              updateArrayItem('companyValues', index, {
                                ...value,
                                icon: e.target.value,
                              })
                            }
                            placeholder="Icon name (e.g., Target)"
                          />
                          <Input
                            value={value.title}
                            onChange={e =>
                              updateArrayItem('companyValues', index, {
                                ...value,
                                title: e.target.value,
                              })
                            }
                            placeholder="Value title"
                          />
                          <Button
                            onClick={() =>
                              removeArrayItem('companyValues', index)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={value.description}
                          onChange={e =>
                            updateArrayItem('companyValues', index, {
                              ...value,
                              description: e.target.value,
                            })
                          }
                          placeholder="Value description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Culture Section */}
          <TabsContent value="culture">
            <Card>
              <CardHeader>
                <CardTitle>Culture Section</CardTitle>
                <CardDescription>
                  Configure the company culture section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.cultureTitle}
                      onChange={e => updateData('cultureTitle', e.target.value)}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.cultureSubtitle}
                      onChange={e =>
                        updateData('cultureSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Culture Description
                  </label>
                  <Textarea
                    value={data.cultureDescription}
                    onChange={e =>
                      updateData('cultureDescription', e.target.value)
                    }
                    placeholder="Enter culture description"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Culture Features</h3>
                    <Button
                      onClick={() => addArrayItem('cultureFeatures', '')}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.cultureFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <Input
                          value={feature}
                          onChange={e => {
                            const newFeatures = [...data.cultureFeatures]
                            newFeatures[index] = e.target.value
                            updateData('cultureFeatures', newFeatures)
                          }}
                          placeholder="Culture feature"
                          className="flex-1"
                        />
                        <Button
                          onClick={() =>
                            removeArrayItem('cultureFeatures', index)
                          }
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

          {/* Application Process Section */}
          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Application Process Section</CardTitle>
                <CardDescription>
                  Configure the application process steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Title
                    </label>
                    <Input
                      value={data.applicationProcessTitle}
                      onChange={e =>
                        updateData('applicationProcessTitle', e.target.value)
                      }
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Subtitle
                    </label>
                    <Input
                      value={data.applicationProcessSubtitle}
                      onChange={e =>
                        updateData('applicationProcessSubtitle', e.target.value)
                      }
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Application Steps</h3>
                    <Button
                      onClick={() =>
                        addArrayItem('applicationSteps', {
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
                    {data.applicationSteps.map((step, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Input
                            value={step.number}
                            onChange={e =>
                              updateArrayItem('applicationSteps', index, {
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
                              updateArrayItem('applicationSteps', index, {
                                ...step,
                                title: e.target.value,
                              })
                            }
                            placeholder="Step title"
                            className="flex-1"
                          />
                          <Button
                            onClick={() =>
                              removeArrayItem('applicationSteps', index)
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
                            updateArrayItem('applicationSteps', index, {
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

          {/* SEO Section */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Configure SEO metadata for the career page
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
