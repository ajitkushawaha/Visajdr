'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Trash2,
  Loader2,
  Users,
  Target,
  Award,
  Zap,
  Globe,
  Shield,
  Heart,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { IAboutUsPage } from '@/models/AboutUsPage'

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Users,
  Target,
  Award,
  Zap,
  Globe,
  Shield,
  Heart,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
}

const AboutUsAdminPage: React.FC = () => {
  const [formData, setFormData] = useState<IAboutUsPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

  const fetchAboutUsContent = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/pages/about-us')
      if (!response.ok) {
        throw new Error('Failed to fetch About Us content')
      }
      const data = await response.json()
      // Ensure comprehensive fields have default values if missing
      const pageData = {
        ...data.aboutUsPage,
        comprehensiveTitle:
          data.aboutUsPage?.comprehensiveTitle || 'Comprehensive Solutions',
        comprehensiveDescription:
          data.aboutUsPage?.comprehensiveDescription ||
          'Everything you need for international travel in one place',
      }
      setFormData(pageData)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load About Us content.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAboutUsContent()
  }, [fetchAboutUsContent])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => (prev ? { ...prev, [name]: value } : null))
  }

  const handleNestedChange = (
    section: keyof IAboutUsPage,
    index: number,
    field: string,
    value: any
  ) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSection = [...(prev[section] as any[])]
      updatedSection[index] = { ...updatedSection[index], [field]: value }
      return { ...prev, [section]: updatedSection } as IAboutUsPage
    })
  }

  const handleAddNestedItem = (section: keyof IAboutUsPage, newItem: any) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSection = [
        ...(prev[section] as any[]),
        {
          ...newItem,
          order: (prev[section] as any[]).length,
          status: 'active',
        },
      ]
      return { ...prev, [section]: updatedSection } as IAboutUsPage
    })
  }

  const handleRemoveNestedItem = (
    section: keyof IAboutUsPage,
    index: number
  ) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSection = (prev[section] as any[]).filter(
        (_, i) => i !== index
      )
      return { ...prev, [section]: updatedSection } as IAboutUsPage
    })
  }

  const handleSave = async () => {
    if (!formData) return
    setSaving(true)
    try {
      // Ensure comprehensive fields are included in the save - explicitly set them
      const dataToSave: any = {
        ...formData,
      }
      // Explicitly set comprehensive fields to ensure they're in the payload
      dataToSave.comprehensiveTitle =
        formData.comprehensiveTitle || 'Comprehensive Solutions'
      dataToSave.comprehensiveDescription =
        formData.comprehensiveDescription ||
        'Everything you need for international travel in one place'

      console.log('Saving data with comprehensive fields:', {
        comprehensiveTitle: dataToSave.comprehensiveTitle,
        comprehensiveDescription: dataToSave.comprehensiveDescription,
      })

      const response = await fetch('/api/admin/pages/about-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })
      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`Validation failed: ${data.details.join(', ')}`)
        }
        throw new Error(data.error || 'Failed to save About Us content')
      }

      setFormData(data.aboutUsPage)
      toast.success('About Us content saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save About Us content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-70">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!formData) {
    return <div className="text-center py-10">No About Us content found.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/content">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-900 bg-white hover:bg-gray-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-brand-primary">
          Manage About Us Page
        </h1>
      </div>

      <div className="space-y-8">
        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your About Us page will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] bg-gray-100 p-4 rounded-md">
            <div className="w-full h-full bg-white rounded-lg shadow-md overflow-y-auto max-h-[800px]">
              {/* Hero Section */}
              <section className="relative py-8 overflow-hidden bg-gradient-to-r from-[#07034f] to-blue-900">
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
                <div className="relative px-4">
                  <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold tracking-tight mb-4 text-white">
                      {formData.heroTitle}
                    </h1>
                    <p className="text-base text-blue-100 leading-relaxed mb-6">
                      {formData.heroSubtitle}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
                      >
                        Start Your Journey
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-white text-gray-900 hover:bg-white hover:text-[#07034f] px-4 py-2 text-sm"
                      >
                        contact us
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              <section className="py-8 bg-white">
                <div className="px-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {formData.stats
                      .filter(stat => stat.status === 'active')
                      .map((stat, index) => {
                        const IconComponent = iconMap[stat.icon]
                        return (
                          <div key={index} className="text-center group">
                            <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-2xl flex items-center justify-center group-hover:bg-red-200 transition-all duration-300">
                              {IconComponent && (
                                <IconComponent className="h-6 w-6 text-red-600" />
                              )}
                            </div>
                            <p className="text-lg font-bold mb-1 text-gray-900 group-hover:text-red-600 transition-colors">
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
                              {stat.label}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </section>

              {/* Company Overview */}
              <section className="py-8 bg-gray-50">
                <div className="px-4">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      Our Story
                    </h2>
                    <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
                      {formData.companyDescription}
                    </p>
                  </div>
                </div>
              </section>

              {/* Problem & Solution */}
              <section className="py-8 bg-white">
                <div className="px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-5 h-5 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-red-800">
                            {formData.problemTitle}
                          </h3>
                        </div>
                        <p className="text-sm text-red-700 leading-relaxed">
                          {formData.problemDescription}
                        </p>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-green-800">
                            {formData.solutionTitle}
                          </h3>
                        </div>
                        <p className="text-sm text-green-700 leading-relaxed">
                          {formData.solutionDescription}
                        </p>
                      </div>
                    </div>

                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#07034f] to-red-600 p-6 shadow-2xl">
                      <div className="h-full w-full rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white">
                          <h4 className="text-xl font-bold mb-4">
                            {formData.comprehensiveTitle ||
                              'Comprehensive Solutions'}
                          </h4>
                          <p className="text-sm text-white/90 leading-relaxed">
                            {formData.comprehensiveDescription ||
                              'Everything you need for international travel in one place'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* B2B Platform */}
              <section className="py-8 bg-[#07034f]">
                <div className="px-4 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {formData.b2bTitle}
                  </h3>
                  <p className="text-base text-blue-100 leading-relaxed max-w-4xl mx-auto">
                    {formData.b2bDescription}
                  </p>
                </div>
              </section>

              {/* Services Section */}
              <section className="py-8 bg-white">
                <div className="px-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {formData.servicesTitle}
                    </h3>
                    <p className="text-base text-gray-600 max-w-3xl mx-auto">
                      Comprehensive visa and travel services designed to make
                      your journey seamless
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.services
                      .filter(service => service.status === 'active')
                      .map((service, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-red-300 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <CheckCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                              {service.name}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>

              {/* Client Testimonials */}
              <section className="py-8 bg-gray-50">
                <div className="px-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {formData.testimonialsTitle}
                    </h3>
                    <p className="text-base text-gray-600 max-w-3xl mx-auto">
                      {formData.testimonialsDescription}
                    </p>
                  </div>
                </div>
              </section>

              {/* Destinations */}
              <section className="py-8 bg-gradient-to-br from-[#07034f] to-blue-900">
                <div className="px-4 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {formData.destinationsTitle}
                  </h3>
                  <p className="text-base text-blue-100 max-w-3xl mx-auto">
                    {formData.destinationsDescription}
                  </p>
                </div>
              </section>

              {/* Technology Platform */}
              <section className="py-8 bg-white">
                <div className="px-4">
                  <div className="bg-gradient-to-r from-[#07034f] to-red-600 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">
                      {formData.technologyTitle}
                    </h3>
                    <p className="text-base text-blue-100 leading-relaxed max-w-4xl mx-auto">
                      {formData.technologyDescription}
                    </p>
                  </div>
                </div>
              </section>

              {/* Team Section */}
              <section className="py-8 bg-gray-50">
                <div className="px-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {formData.teamTitle}
                    </h3>
                    <p className="text-base text-gray-600 max-w-3xl mx-auto">
                      {formData.teamDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.teamMembers
                      .filter(member => member.status === 'active')
                      .map((member, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:border-red-300 group"
                        >
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-[#07034f]/10 rounded-full flex items-center justify-center group-hover:from-red-200 group-hover:to-[#07034f]/20 transition-all duration-300">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-red-600">
                                {member.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-red-600 transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-sm text-red-600 font-semibold mb-2">
                            {member.position}
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            {member.experience}
                          </p>
                          {member.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {member.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-8 px-4">
                <div className="w-full mx-auto py-8 max-w-4xl text-center bg-gradient-to-r from-[#07034f] via-red-600 to-[#07034f] border-2 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-4 text-white px-4">
                    {formData.ctaTitle}
                  </h3>
                  <p className="text-base text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                    {formData.ctaDescription}
                  </p>
                  <div className="flex gap-4 justify-center px-4">
                    <Button
                      size="sm"
                      className="bg-white text-[#07034f] hover:bg-gray-100 px-6 py-2 text-sm font-semibold"
                    >
                      Get Started Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-white text-gray-900 hover:bg-white hover:text-[#07034f] px-6 py-2 text-sm font-semibold"
                    >
                      Contact Our Team
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit About Us Content</CardTitle>
            <CardDescription>
              Update the various sections of your About Us page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex w-full overflow-x-auto h-auto p-1 bg-gray-100 rounded-lg">
                <TabsTrigger value="hero" className="text-xs px-3 py-2">
                  Hero
                </TabsTrigger>
                <TabsTrigger value="company" className="text-xs px-3 py-2">
                  Company
                </TabsTrigger>
                <TabsTrigger value="b2b" className="text-xs px-3 py-2">
                  B2B Platform
                </TabsTrigger>
                <TabsTrigger value="clients" className="text-xs px-3 py-2">
                  Clients
                </TabsTrigger>
                <TabsTrigger
                  value="google-reviews"
                  className="text-xs px-3 py-2"
                >
                  Google Reviews
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs px-3 py-2">
                  Services
                </TabsTrigger>
                <TabsTrigger value="reach" className="text-xs px-3 py-2">
                  Global Reach
                </TabsTrigger>
                <TabsTrigger value="technology" className="text-xs px-3 py-2">
                  Technology
                </TabsTrigger>
                <TabsTrigger value="team" className="text-xs px-3 py-2">
                  Leadership
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs px-3 py-2">
                  Stats
                </TabsTrigger>
              </TabsList>

              {/* Hero Section */}
              <TabsContent value="hero" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    name="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>

              {/* Company Info Section */}
              <TabsContent value="company" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="companyDescription">
                    Company Description
                  </Label>
                  <Textarea
                    id="companyDescription"
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="problemTitle">Problem Title</Label>
                  <Input
                    id="problemTitle"
                    name="problemTitle"
                    value={formData.problemTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="problemDescription">
                    Problem Description
                  </Label>
                  <Textarea
                    id="problemDescription"
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="solutionTitle">Solution Title</Label>
                  <Input
                    id="solutionTitle"
                    name="solutionTitle"
                    value={formData.solutionTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="solutionDescription">
                    Solution Description
                  </Label>
                  <Textarea
                    id="solutionDescription"
                    name="solutionDescription"
                    value={formData.solutionDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="comprehensiveTitle">
                    Comprehensive Solutions Title
                  </Label>
                  <Input
                    id="comprehensiveTitle"
                    name="comprehensiveTitle"
                    value={formData.comprehensiveTitle || ''}
                    onChange={handleChange}
                    placeholder="Comprehensive Solutions"
                  />
                </div>
                <div>
                  <Label htmlFor="comprehensiveDescription">
                    Comprehensive Solutions Description
                  </Label>
                  <Textarea
                    id="comprehensiveDescription"
                    name="comprehensiveDescription"
                    value={formData.comprehensiveDescription || ''}
                    onChange={handleChange}
                    placeholder="Everything you need for international travel in one place"
                  />
                </div>
                <div>
                  <Label htmlFor="b2bTitle">B2B Platform Title</Label>
                  <Input
                    id="b2bTitle"
                    name="b2bTitle"
                    value={formData.b2bTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="b2bDescription">
                    B2B Platform Description
                  </Label>
                  <Textarea
                    id="b2bDescription"
                    name="b2bDescription"
                    value={formData.b2bDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonialsTitle">Testimonials Title</Label>
                  <Input
                    id="testimonialsTitle"
                    name="testimonialsTitle"
                    value={formData.testimonialsTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonialsDescription">
                    Testimonials Description
                  </Label>
                  <Textarea
                    id="testimonialsDescription"
                    name="testimonialsDescription"
                    value={formData.testimonialsDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationsTitle">Destinations Title</Label>
                  <Input
                    id="destinationsTitle"
                    name="destinationsTitle"
                    value={formData.destinationsTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationsDescription">
                    Destinations Description
                  </Label>
                  <Textarea
                    id="destinationsDescription"
                    name="destinationsDescription"
                    value={formData.destinationsDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="technologyTitle">
                    Technology Platform Title
                  </Label>
                  <Input
                    id="technologyTitle"
                    name="technologyTitle"
                    value={formData.technologyTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="technologyDescription">
                    Technology Platform Description
                  </Label>
                  <Textarea
                    id="technologyDescription"
                    name="technologyDescription"
                    value={formData.technologyDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaTitle">CTA Title</Label>
                  <Input
                    id="ctaTitle"
                    name="ctaTitle"
                    value={formData.ctaTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaDescription">CTA Description</Label>
                  <Textarea
                    id="ctaDescription"
                    name="ctaDescription"
                    value={formData.ctaDescription}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaEmail">CTA Email</Label>
                  <Input
                    id="ctaEmail"
                    name="ctaEmail"
                    value={formData.ctaEmail || ''}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>

              {/* B2B Platform Section */}
              <TabsContent value="b2b" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="b2bTitle">B2B Platform Title</Label>
                  <Input
                    id="b2bTitle"
                    name="b2bTitle"
                    value={formData.b2bTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="b2bDescription">
                    B2B Platform Description
                  </Label>
                  <Textarea
                    id="b2bDescription"
                    name="b2bDescription"
                    value={formData.b2bDescription}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </TabsContent>

              {/* Clients Section */}
              <TabsContent value="clients" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="testimonialsTitle">
                    What Our Clients Say Title
                  </Label>
                  <Input
                    id="testimonialsTitle"
                    name="testimonialsTitle"
                    value={formData.testimonialsTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonialsDescription">
                    What Our Clients Say Description
                  </Label>
                  <Textarea
                    id="testimonialsDescription"
                    name="testimonialsDescription"
                    value={formData.testimonialsDescription}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </TabsContent>

              {/* Google Reviews Section */}
              <TabsContent value="google-reviews" className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showGoogleReviews"
                    checked={formData.showGoogleReviews || false}
                    onCheckedChange={checked =>
                      handleChange({
                        target: { name: 'showGoogleReviews', value: checked },
                      })
                    }
                  />
                  <Label htmlFor="showGoogleReviews">
                    Show Google Reviews Section
                  </Label>
                </div>
                <div>
                  <Label htmlFor="googleReviewsTitle">
                    Google Reviews Title
                  </Label>
                  <Input
                    id="googleReviewsTitle"
                    name="googleReviewsTitle"
                    value={formData.googleReviewsTitle || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="googleReviewsDescription">
                    Google Reviews Description
                  </Label>
                  <Textarea
                    id="googleReviewsDescription"
                    name="googleReviewsDescription"
                    value={formData.googleReviewsDescription || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Google Reviews Preview
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    This section will display real Google reviews fetched from
                    your Google My Business account.
                  </p>
                  <p className="text-sm text-blue-700">
                    Configure your Google My Business API credentials in
                    Settings → Google Reviews to sync reviews.
                  </p>
                </div>
              </TabsContent>

              {/* Global Reach Section */}
              <TabsContent value="reach" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="destinationsTitle">Global Reach Title</Label>
                  <Input
                    id="destinationsTitle"
                    name="destinationsTitle"
                    value={formData.destinationsTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationsDescription">
                    Global Reach Description
                  </Label>
                  <Textarea
                    id="destinationsDescription"
                    name="destinationsDescription"
                    value={formData.destinationsDescription}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </TabsContent>

              {/* Technology Section */}
              <TabsContent value="technology" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="technologyTitle">Our Technology Title</Label>
                  <Input
                    id="technologyTitle"
                    name="technologyTitle"
                    value={formData.technologyTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="technologyDescription">
                    Our Technology Description
                  </Label>
                  <Textarea
                    id="technologyDescription"
                    name="technologyDescription"
                    value={formData.technologyDescription}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </TabsContent>

              {/* Team Section */}
              <TabsContent value="team" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="teamTitle">Team Section Title</Label>
                  <Input
                    id="teamTitle"
                    name="teamTitle"
                    value={formData.teamTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">
                    Team Section Description
                  </Label>
                  <Textarea
                    id="teamDescription"
                    name="teamDescription"
                    value={formData.teamDescription}
                    onChange={handleChange}
                  />
                </div>
                <h4 className="font-semibold mt-6">Team Members</h4>
                {formData.teamMembers.map((member, index) => (
                  <Card key={member._id || index} className="p-4 space-y-2">
                    <div>
                      <Label htmlFor={`team-name-${index}`}>Name</Label>
                      <Input
                        id={`team-name-${index}`}
                        value={member.name}
                        onChange={e =>
                          handleNestedChange(
                            'teamMembers',
                            index,
                            'name',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`team-position-${index}`}>Position</Label>
                      <Input
                        id={`team-position-${index}`}
                        value={member.position}
                        onChange={e =>
                          handleNestedChange(
                            'teamMembers',
                            index,
                            'position',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`team-experience-${index}`}>
                        Experience
                      </Label>
                      <Input
                        id={`team-experience-${index}`}
                        value={member.experience}
                        onChange={e =>
                          handleNestedChange(
                            'teamMembers',
                            index,
                            'experience',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`team-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`team-description-${index}`}
                        value={member.description || ''}
                        onChange={e =>
                          handleNestedChange(
                            'teamMembers',
                            index,
                            'description',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`team-status-${index}`}
                        checked={member.status === 'active'}
                        onCheckedChange={checked =>
                          handleNestedChange(
                            'teamMembers',
                            index,
                            'status',
                            checked ? 'active' : 'inactive'
                          )
                        }
                      />
                      <Label htmlFor={`team-status-${index}`}>Active</Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleRemoveNestedItem('teamMembers', index)
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    handleAddNestedItem('teamMembers', {
                      name: '',
                      position: '',
                      experience: '',
                      description: '',
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Team Member
                </Button>
              </TabsContent>

              {/* Stats Section */}
              <TabsContent value="stats" className="mt-4 space-y-4">
                <h4 className="font-semibold">Company Statistics</h4>
                {formData.stats.map((stat, index) => (
                  <Card key={stat._id || index} className="p-4 space-y-2">
                    <div>
                      <Label htmlFor={`stat-icon-${index}`}>
                        Icon (Lucide Name)
                      </Label>
                      <Input
                        id={`stat-icon-${index}`}
                        value={stat.icon}
                        onChange={e =>
                          handleNestedChange(
                            'stats',
                            index,
                            'icon',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stat-label-${index}`}>Label</Label>
                      <Input
                        id={`stat-label-${index}`}
                        value={stat.label}
                        onChange={e =>
                          handleNestedChange(
                            'stats',
                            index,
                            'label',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stat-value-${index}`}>Value</Label>
                      <Input
                        id={`stat-value-${index}`}
                        value={stat.value}
                        onChange={e =>
                          handleNestedChange(
                            'stats',
                            index,
                            'value',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`stat-status-${index}`}
                        checked={stat.status === 'active'}
                        onCheckedChange={checked =>
                          handleNestedChange(
                            'stats',
                            index,
                            'status',
                            checked ? 'active' : 'inactive'
                          )
                        }
                      />
                      <Label htmlFor={`stat-status-${index}`}>Active</Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveNestedItem('stats', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    handleAddNestedItem('stats', {
                      icon: 'Users',
                      label: '',
                      value: '',
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Statistic
                </Button>
              </TabsContent>

              {/* Services Section */}
              <TabsContent value="services" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="servicesTitle">Services Section Title</Label>
                  <Input
                    id="servicesTitle"
                    name="servicesTitle"
                    value={formData.servicesTitle}
                    onChange={handleChange}
                  />
                </div>
                <h4 className="font-semibold mt-6">Services List</h4>
                {formData.services.map((service, index) => (
                  <Card key={service._id || index} className="p-4 space-y-2">
                    <div>
                      <Label htmlFor={`service-name-${index}`}>
                        Service Name
                      </Label>
                      <Input
                        id={`service-name-${index}`}
                        value={service.name}
                        onChange={e =>
                          handleNestedChange(
                            'services',
                            index,
                            'name',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-status-${index}`}
                        checked={service.status === 'active'}
                        onCheckedChange={checked =>
                          handleNestedChange(
                            'services',
                            index,
                            'status',
                            checked ? 'active' : 'inactive'
                          )
                        }
                      />
                      <Label htmlFor={`service-status-${index}`}>Active</Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveNestedItem('services', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </Card>
                ))}
                <Button
                  onClick={() => handleAddNestedItem('services', { name: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Service
                </Button>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSave}
              className="w-full mt-6"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save About Us Content
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AboutUsAdminPage
