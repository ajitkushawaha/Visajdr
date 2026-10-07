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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Star,
  Shield,
  Clock,
  Globe,
  Heart,
  Users,
  Award,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ITravelInsurancePage } from '@/models/TravelInsurancePage'

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Shield,
  Clock,
  Globe,
  Heart,
  Users,
  Award,
  CheckCircle,
  Star,
}

const TravelInsuranceAdminPage: React.FC = () => {
  const [formData, setFormData] =
    useState<Partial<ITravelInsurancePage> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

  const fetchTravelInsuranceContent = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/pages/travel-insurance')
      if (!response.ok) {
        throw new Error('Failed to fetch Travel Insurance content')
      }
      const data = await response.json()
      setFormData(data.travelInsurancePage)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load Travel Insurance content.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTravelInsuranceContent()
  }, [fetchTravelInsuranceContent])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => (prev ? { ...prev, [name]: value } : null))
  }

  const handleNestedChange = (
    section: keyof ITravelInsurancePage,
    index: number,
    field: string,
    value: any
  ) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSection = [...(prev[section] as any[])]
      updatedSection[index] = { ...updatedSection[index], [field]: value }
      return { ...prev, [section]: updatedSection } as ITravelInsurancePage
    })
  }

  const handleAddNestedItem = (
    section: keyof ITravelInsurancePage,
    newItem: any
  ) => {
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
      return { ...prev, [section]: updatedSection } as ITravelInsurancePage
    })
  }

  const handleRemoveNestedItem = (
    section: keyof ITravelInsurancePage,
    index: number
  ) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSection = (prev[section] as any[]).filter(
        (_, i) => i !== index
      )
      return { ...prev, [section]: updatedSection } as ITravelInsurancePage
    })
  }

  const handleSave = async () => {
    if (!formData) {
      toast.error('No data to save')
      return
    }

    // Clean up the form data - remove any old field names
    const cleanedData = { ...formData }
    if ('heroPoweredByLogoText' in cleanedData) {
      delete (cleanedData as any).heroPoweredByLogoText
    }

    setSaving(true)
    try {
      console.log('Saving travel insurance content...', cleanedData)

      const response = await fetch('/api/admin/pages/travel-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      let data
      try {
        const text = await response.text()
        console.log('Raw response:', text)
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        toast.error('Invalid response from server. Please check the console.')
        return
      }

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          `Server error: ${response.status} ${response.statusText}`
        console.error('Save error:', errorMessage, data)
        toast.error(errorMessage)
        return
      }

      if (!data.success) {
        const errorMessage =
          data.error ||
          data.message ||
          'Failed to save Travel Insurance content'
        console.error('Save error:', errorMessage, data)
        toast.error(errorMessage)
        return
      }

      if (data.travelInsurancePage) {
        setFormData(data.travelInsurancePage)
        toast.success('Travel Insurance content saved successfully!')
      } else {
        toast.error('Unexpected response format')
        console.error('Unexpected response:', data)
      }
    } catch (error: any) {
      console.error('Save error:', error)
      const errorMessage =
        error.message ||
        'Failed to save Travel Insurance content. Please check the console for details.'
      toast.error(errorMessage)
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
    return (
      <div className="text-center py-10">
        No Travel Insurance content found.
      </div>
    )
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
          Manage Travel Insurance Page
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Preview */}
        <Card className="lg:col-span-2 order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your Travel Insurance page will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] bg-gray-100 p-4 rounded-md flex items-center justify-center">
            <div className="w-full h-full bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4 text-brand-primary">
                  {formData.heroTitle}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {formData.heroSubtitle}
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-sm">{formData.heroPriceText}</span>
                  <span className="text-2xl font-bold text-brand-primary">
                    {formData.heroPriceValue}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-sm">{formData.heroPoweredByText}</span>
                  {formData.heroPoweredByLogoUrl ? (
                    <img
                      src={formData.heroPoweredByLogoUrl}
                      alt="Powered By Logo"
                      className="h-8 md:h-10 object-contain"
                    />
                  ) : (
                    <Badge className="bg-purple-500 text-white">
                      Logo Image
                    </Badge>
                  )}
                </div>
                <div className="bg-brand-primary text-white py-2 px-4 rounded-lg inline-block">
                  <div className="text-xl font-bold">
                    {formData.heroClaimRatioValue}
                  </div>
                  <div className="text-xs opacity-90">
                    {formData.heroClaimRatioDescription}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                {formData.insurancePlansTitle}
              </h2>
              <p className="text-gray-600 mb-6">
                {formData.insurancePlansSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {formData.plans
                  .filter(plan => plan.status === 'active')
                  .map((plan, index) => (
                    <Card
                      key={index}
                      className={`p-4 ${plan.popular ? 'ring-2 ring-brand-primary' : ''}`}
                    >
                      {plan.popular && (
                        <Badge className="mb-2 bg-brand-primary">
                          Most Popular
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <div className="text-2xl font-bold text-brand-primary mb-2">
                        {plan.price}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {plan.duration}
                      </div>
                      <ul className="space-y-1 text-sm">
                        {plan.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
              </div>

              <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                {formData.coverageDetailsTitle}
              </h2>
              <p className="text-gray-600 mb-6">
                {formData.coverageDetailsSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {formData.coverageDetails
                  .filter(detail => detail.status === 'active')
                  .map((detail, index) => {
                    const IconComponent = iconMap[detail.icon]
                    return (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            {IconComponent && (
                              <IconComponent className="h-5 w-5 text-brand-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">
                              {detail.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {detail.description}
                            </p>
                            <Badge variant="outline">{detail.coverage}</Badge>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
              </div>

              <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                {formData.testimonialsTitle}
              </h2>
              <p className="text-gray-600 mb-6">
                {formData.testimonialsSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {formData.testimonials
                  .filter(testimonial => testimonial.status === 'active')
                  .map((testimonial, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-3">"{testimonial.text}"</p>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.location}
                      </div>
                    </Card>
                  ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {formData.stats
                  .filter(stat => stat.status === 'active')
                  .map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-brand-primary">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                  {formData.ctaTitle}
                </h2>
                <p className="text-gray-600 mb-6">{formData.ctaSubtitle}</p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-brand-primary">
                    {formData.ctaButton1Text}
                  </Button>
                  <Button variant="outline">{formData.ctaButton2Text}</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="w-full lg:col-span-2 order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Edit Travel Insurance Content</CardTitle>
            <CardDescription>
              Update the various sections of your Travel Insurance page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hero">Hero & Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              {/* Hero & Basic Info */}
              <TabsContent value="hero" className="mt-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
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
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroDescription">Hero Description</Label>
                      <Textarea
                        id="heroDescription"
                        name="heroDescription"
                        value={formData.heroDescription}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroPriceText">Price Text</Label>
                      <Input
                        id="heroPriceText"
                        name="heroPriceText"
                        value={formData.heroPriceText}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroPriceValue">Price Value</Label>
                      <Input
                        id="heroPriceValue"
                        name="heroPriceValue"
                        value={formData.heroPriceValue}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroPoweredByText">Powered By Text</Label>
                      <Input
                        id="heroPoweredByText"
                        name="heroPoweredByText"
                        value={formData.heroPoweredByText}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroPoweredByLogoUrl">
                        Powered By Logo Image URL
                      </Label>
                      <Input
                        id="heroPoweredByLogoUrl"
                        name="heroPoweredByLogoUrl"
                        type="url"
                        value={formData.heroPoweredByLogoUrl || ''}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                      />
                      {formData.heroPoweredByLogoUrl && (
                        <div className="mt-2">
                          <img
                            src={formData.heroPoweredByLogoUrl}
                            alt="Logo Preview"
                            className="h-12 object-contain border rounded p-2 bg-gray-50"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="heroClaimRatioValue">
                        Claim Ratio Value
                      </Label>
                      <Input
                        id="heroClaimRatioValue"
                        name="heroClaimRatioValue"
                        value={formData.heroClaimRatioValue}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroClaimRatioDescription">
                        Claim Ratio Description
                      </Label>
                      <Textarea
                        id="heroClaimRatioDescription"
                        name="heroClaimRatioDescription"
                        value={formData.heroClaimRatioDescription}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="formTitle">Form Title</Label>
                      <Input
                        id="formTitle"
                        name="formTitle"
                        value={formData.formTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="formSubtitle">Form Subtitle</Label>
                      <Input
                        id="formSubtitle"
                        name="formSubtitle"
                        value={formData.formSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="featuresSectionTitle">
                        Features Section Title
                      </Label>
                      <Input
                        id="featuresSectionTitle"
                        name="featuresSectionTitle"
                        value={formData.featuresSectionTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="featuresSectionSubtitle">
                        Features Section Subtitle
                      </Label>
                      <Input
                        id="featuresSectionSubtitle"
                        name="featuresSectionSubtitle"
                        value={formData.featuresSectionSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurancePlansTitle">
                        Insurance Plans Title
                      </Label>
                      <Input
                        id="insurancePlansTitle"
                        name="insurancePlansTitle"
                        value={formData.insurancePlansTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurancePlansSubtitle">
                        Insurance Plans Subtitle
                      </Label>
                      <Input
                        id="insurancePlansSubtitle"
                        name="insurancePlansSubtitle"
                        value={formData.insurancePlansSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coverageDetailsTitle">
                        Coverage Details Title
                      </Label>
                      <Input
                        id="coverageDetailsTitle"
                        name="coverageDetailsTitle"
                        value={formData.coverageDetailsTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coverageDetailsSubtitle">
                        Coverage Details Subtitle
                      </Label>
                      <Input
                        id="coverageDetailsSubtitle"
                        name="coverageDetailsSubtitle"
                        value={formData.coverageDetailsSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="testimonialsTitle">
                        Testimonials Title
                      </Label>
                      <Input
                        id="testimonialsTitle"
                        name="testimonialsTitle"
                        value={formData.testimonialsTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="testimonialsSubtitle">
                        Testimonials Subtitle
                      </Label>
                      <Input
                        id="testimonialsSubtitle"
                        name="testimonialsSubtitle"
                        value={formData.testimonialsSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statsSectionTitle">
                        Stats Section Title
                      </Label>
                      <Input
                        id="statsSectionTitle"
                        name="statsSectionTitle"
                        value={formData.statsSectionTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statsSectionSubtitle">
                        Stats Section Subtitle
                      </Label>
                      <Input
                        id="statsSectionSubtitle"
                        name="statsSectionSubtitle"
                        value={formData.statsSectionSubtitle}
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
                      <Label htmlFor="ctaSubtitle">CTA Subtitle</Label>
                      <Input
                        id="ctaSubtitle"
                        name="ctaSubtitle"
                        value={formData.ctaSubtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaButton1Text">CTA Button 1 Text</Label>
                      <Input
                        id="ctaButton1Text"
                        name="ctaButton1Text"
                        value={formData.ctaButton1Text}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaButton1Link">CTA Button 1 Link</Label>
                      <Input
                        id="ctaButton1Link"
                        name="ctaButton1Link"
                        value={formData.ctaButton1Link}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaButton2Text">CTA Button 2 Text</Label>
                      <Input
                        id="ctaButton2Text"
                        name="ctaButton2Text"
                        value={formData.ctaButton2Text}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaButton2Link">CTA Button 2 Link</Label>
                      <Input
                        id="ctaButton2Link"
                        name="ctaButton2Link"
                        value={formData.ctaButton2Link}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Content Management */}
              <TabsContent value="content" className="mt-4 space-y-6">
                {/* Insurance Plans */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Insurance Plans</h3>
                    <Button
                      onClick={() =>
                        handleAddNestedItem('plans', {
                          name: '',
                          price: '',
                          duration: '',
                          features: [],
                          popular: false,
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Plan
                    </Button>
                  </div>

                  {formData.plans.map((plan, index) => (
                    <Card
                      key={plan._id || index}
                      className="p-4 space-y-4 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Plan {index + 1}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveNestedItem('plans', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`plan-name-${index}`}>
                            Plan Name
                          </Label>
                          <Input
                            id={`plan-name-${index}`}
                            value={plan.name}
                            onChange={e =>
                              handleNestedChange(
                                'plans',
                                index,
                                'name',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`plan-price-${index}`}>Price</Label>
                          <Input
                            id={`plan-price-${index}`}
                            value={plan.price}
                            onChange={e =>
                              handleNestedChange(
                                'plans',
                                index,
                                'price',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`plan-duration-${index}`}>
                            Duration
                          </Label>
                          <Input
                            id={`plan-duration-${index}`}
                            value={plan.duration}
                            onChange={e =>
                              handleNestedChange(
                                'plans',
                                index,
                                'duration',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`plan-popular-${index}`}
                            checked={plan.popular}
                            onCheckedChange={checked =>
                              handleNestedChange(
                                'plans',
                                index,
                                'popular',
                                checked
                              )
                            }
                          />
                          <Label htmlFor={`plan-popular-${index}`}>
                            Popular
                          </Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`plan-features-${index}`}>
                          Features (one per line)
                        </Label>
                        <Textarea
                          id={`plan-features-${index}`}
                          value={plan.features.join('\n')}
                          onChange={e =>
                            handleNestedChange(
                              'plans',
                              index,
                              'features',
                              e.target.value.split('\n').filter(f => f.trim())
                            )
                          }
                          rows={4}
                          placeholder="Enter each feature on a new line"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`plan-status-${index}`}
                          checked={plan.status === 'active'}
                          onCheckedChange={checked =>
                            handleNestedChange(
                              'plans',
                              index,
                              'status',
                              checked ? 'active' : 'inactive'
                            )
                          }
                        />
                        <Label htmlFor={`plan-status-${index}`}>Active</Label>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Coverage Details */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Coverage Details</h3>
                    <Button
                      onClick={() =>
                        handleAddNestedItem('coverageDetails', {
                          icon: 'Shield',
                          title: '',
                          description: '',
                          coverage: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Coverage
                    </Button>
                  </div>

                  {formData.coverageDetails.map((detail, index) => (
                    <Card
                      key={detail._id || index}
                      className="p-4 space-y-4 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Coverage {index + 1}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleRemoveNestedItem('coverageDetails', index)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`coverage-icon-${index}`}>
                            Icon (Lucide Name)
                          </Label>
                          <Input
                            id={`coverage-icon-${index}`}
                            value={detail.icon}
                            onChange={e =>
                              handleNestedChange(
                                'coverageDetails',
                                index,
                                'icon',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`coverage-title-${index}`}>
                            Title
                          </Label>
                          <Input
                            id={`coverage-title-${index}`}
                            value={detail.title}
                            onChange={e =>
                              handleNestedChange(
                                'coverageDetails',
                                index,
                                'title',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`coverage-description-${index}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`coverage-description-${index}`}
                          value={detail.description}
                          onChange={e =>
                            handleNestedChange(
                              'coverageDetails',
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`coverage-coverage-${index}`}>
                          Coverage Amount
                        </Label>
                        <Input
                          id={`coverage-coverage-${index}`}
                          value={detail.coverage}
                          onChange={e =>
                            handleNestedChange(
                              'coverageDetails',
                              index,
                              'coverage',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`coverage-status-${index}`}
                          checked={detail.status === 'active'}
                          onCheckedChange={checked =>
                            handleNestedChange(
                              'coverageDetails',
                              index,
                              'status',
                              checked ? 'active' : 'inactive'
                            )
                          }
                        />
                        <Label htmlFor={`coverage-status-${index}`}>
                          Active
                        </Label>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Testimonials */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Customer Testimonials
                    </h3>
                    <Button
                      onClick={() =>
                        handleAddNestedItem('testimonials', {
                          name: '',
                          location: '',
                          rating: 5,
                          text: '',
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>

                  {formData.testimonials.map((testimonial, index) => (
                    <Card
                      key={testimonial._id || index}
                      className="p-4 space-y-4 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">
                          Testimonial {index + 1}
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleRemoveNestedItem('testimonials', index)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`testimonial-name-${index}`}>
                            Name
                          </Label>
                          <Input
                            id={`testimonial-name-${index}`}
                            value={testimonial.name}
                            onChange={e =>
                              handleNestedChange(
                                'testimonials',
                                index,
                                'name',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`testimonial-location-${index}`}>
                            Location
                          </Label>
                          <Input
                            id={`testimonial-location-${index}`}
                            value={testimonial.location}
                            onChange={e =>
                              handleNestedChange(
                                'testimonials',
                                index,
                                'location',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`testimonial-rating-${index}`}>
                            Rating (1-5)
                          </Label>
                          <Input
                            id={`testimonial-rating-${index}`}
                            type="number"
                            min="1"
                            max="5"
                            value={testimonial.rating}
                            onChange={e =>
                              handleNestedChange(
                                'testimonials',
                                index,
                                'rating',
                                parseInt(e.target.value) || 5
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`testimonial-text-${index}`}>
                          Testimonial Text
                        </Label>
                        <Textarea
                          id={`testimonial-text-${index}`}
                          value={testimonial.text}
                          onChange={e =>
                            handleNestedChange(
                              'testimonials',
                              index,
                              'text',
                              e.target.value
                            )
                          }
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`testimonial-status-${index}`}
                          checked={testimonial.status === 'active'}
                          onCheckedChange={checked =>
                            handleNestedChange(
                              'testimonials',
                              index,
                              'status',
                              checked ? 'active' : 'inactive'
                            )
                          }
                        />
                        <Label htmlFor={`testimonial-status-${index}`}>
                          Active
                        </Label>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Stats */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Statistics</h3>
                    <Button
                      onClick={() =>
                        handleAddNestedItem('stats', { value: '', label: '' })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stat
                    </Button>
                  </div>

                  {formData.stats.map((stat, index) => (
                    <Card
                      key={stat._id || index}
                      className="p-4 space-y-4 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Stat {index + 1}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveNestedItem('stats', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSave}
              className="w-full mt-6"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Travel Insurance Content
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TravelInsuranceAdminPage
