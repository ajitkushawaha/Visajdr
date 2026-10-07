'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  GripVertical,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ServiceSection {
  _id?: string
  title: string
  subtitle?: string
  description?: string
  status: 'active' | 'inactive'
  order: number
}

export default function ServiceSectionEditor() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ServiceSection>({
    title: '',
    subtitle: '',
    description: '',
    status: 'active',
    order: 0,
  })

  useEffect(() => {
    fetchServiceSection()
  }, [])

  const fetchServiceSection = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/home/services')
      if (response.ok) {
        const data = await response.json()
        if (data.serviceSection) {
          setFormData(data.serviceSection)
        }
      }
    } catch (error) {
      console.error('Error fetching service section:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ServiceSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please fill in the title')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/home/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Service section saved successfully!')
        router.push('/admin/content/home')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save service section')
      }
    } catch (error) {
      console.error('Error saving service section:', error)
      toast.error('Error saving service section. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
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
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/admin/content/home">
                  <Button
                    variant="ghost"
                    className="text-gray-900 bg-white hover:bg-gray-200"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home CMS
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚙️ Edit Service Section
              </h1>
              <p className="text-gray-600 mt-2">
                Manage service cards, filters, and featured services
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="text-gray-900 bg-white hover:bg-gray-200"
                onClick={() => window.open('/', '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your service section will look on the website (updates
                in real-time)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Live Preview - Matching the actual ServiceSection component */}
              <div className="bg-white p-8">
                <section className="py-20 relative max-[600px]:px-4 max-[600px]:pb-32">
                  <img
                    className="absolute left-5 bottom-10 w-28"
                    src="/visa/air1.png"
                    alt=""
                  />
                  <img
                    className="absolute right-8 top-10 w-28 rotate-180"
                    src="/visa/air1.png"
                    alt=""
                  />

                  <div className="w-4/5 max-[600px]:w-[90%] mx-auto md:flex-row items-center justify-between py-6 sm:px-6 lg:px-8 gap-10">
                    {/* Section Heading - Admin Configurable */}
                    <div className="text-left mb-10 flex flex-col items-start gap-2">
                      <div className="text-[16px] max-[600px]:text-base max-[600px]:text-bold flex items-center gap-2 font-medium text-gray-500 tracking-widest">
                        {formData.title || 'Our Services'}{' '}
                        <img
                          src="/visa/OBJECTS.png"
                          className="w-10 h-2"
                          alt="image"
                        />
                      </div>
                      {formData.subtitle && (
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                          {formData.subtitle}
                        </h2>
                      )}
                      {formData.description && (
                        <p className="mt-4 w-full text-xs md:text-sm text-gray-600">
                          {formData.description}
                        </p>
                      )}
                    </div>

                    {/* Filter Buttons - Auto-generated from visa data */}
                    <div className="text-left flex flex-wrap gap-4 mb-10 max-[600px]:mb-10">
                      <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium flex items-center gap-2">
                        ☀️ In Days
                      </button>

                      <button className="px-4 py-2 rounded-lg bg-gray-100 text-black text-sm font-medium flex items-center gap-2">
                        🛂 Schengen
                      </button>
                    </div>

                    {/* Content - Matching actual layout */}
                    <div className="grid md:grid-cols-2">
                      {/* Large Card - Left Side */}
                      <div className="relative text-center h-[430px] rounded-xl overflow-hidden cursor-pointer">
                        <div className="h-full flex justify-center max-[600px]:mb-4">
                          <img
                            src="/visa/serviceimg.png"
                            alt="Visa Image"
                            className="w-4/5 h-[380px] object-contain max-[600px]:object-cover rounded-xl"
                          />
                        </div>
                        <div className="absolute bottom-1/2 right-10 z-20 bg-orange-500 text-white px-8 py-2 text-xl font-semibold rounded-md shadow">
                          ₹ 1,500
                        </div>
                        <div className="absolute w-full bottom-16 flex flex-col items-center justify-center text-white text-[11px]">
                          <span className="p-0 text-2xl text-white uppercase font-bold">
                            FRANCE
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-6 w-3/4 h-[380px] rounded-xl overflow-hidden border-4 border-orange-400" />
                      </div>

                      {/* Visa Cards Grid - Right Side */}
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-1 flex items-center gap-2 capitalize">
                          France
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mb-4">
                          Get your visa by <strong>5 days</strong>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Sample Visa Card 1 */}
                          <div
                            className="relative rounded-xl overflow-hidden w-full h-[170px] cursor-pointer"
                            style={{
                              backgroundImage: "url('/visa/serviceimg.png')",
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div className="absolute inset-0 bg-black/30 z-0" />
                            <div className="absolute top-0 right-0 p-2 w-full flex items-center justify-between">
                              <p className="bg-green-500 absolute top-1 right-2 text-white px-2.5 py-0.5 text-sm rounded">
                                ₹ 1,500
                              </p>
                            </div>
                            <div className="absolute w-full bottom-0 flex flex-col items-center justify-center text-white text-[11px]">
                              <span className="p-0 font-semibold text-[12px] text-white capitalize">
                                France
                              </span>
                              <div className="text-xs w-1/2 border-b border-white text-white"></div>
                              <h3 className="text-xs bg-gray-900 text-center">
                                <span className="capitalize">Tourist</span> visa
                                within 5 days
                              </h3>
                            </div>
                            <div className="absolute top-0 left-0 text-white px-2 py-1 text-xl rounded">
                              🔥
                            </div>
                          </div>

                          {/* Sample Visa Card 2 */}
                          <div
                            className="relative rounded-xl overflow-hidden w-full h-[170px] cursor-pointer"
                            style={{
                              backgroundImage: "url('/visa/serviceimg.png')",
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div className="absolute inset-0 bg-black/30 z-0" />
                            <div className="absolute top-0 right-0 p-2 w-full flex items-center justify-between">
                              <p className="bg-green-500 absolute top-1 right-2 text-white px-2.5 py-0.5 text-sm rounded">
                                ₹ 2,000
                              </p>
                            </div>
                            <div className="absolute w-full bottom-0 flex flex-col items-center justify-center text-white text-[11px]">
                              <span className="p-0 font-semibold text-[12px] text-white capitalize">
                                Germany
                              </span>
                              <div className="text-xs w-1/2 border-b border-white text-white"></div>
                              <h3 className="text-xs bg-gray-900 text-center">
                                <span className="capitalize">Business</span>{' '}
                                visa within 7 days
                              </h3>
                            </div>
                            <div className="absolute top-0 left-0 text-white px-2 py-1 text-xl rounded">
                              🔥
                            </div>
                          </div>

                          {/* Sample Visa Card 3 */}
                          <div
                            className="relative rounded-xl overflow-hidden w-full h-[170px] cursor-pointer"
                            style={{
                              backgroundImage: "url('/visa/serviceimg.png')",
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div className="absolute inset-0 bg-black/30 z-0" />
                            <div className="absolute top-0 right-0 p-2 w-full flex items-center justify-between">
                              <p className="bg-green-500 absolute top-1 right-2 text-white px-2.5 py-0.5 text-sm rounded">
                                ₹ 1,800
                              </p>
                            </div>
                            <div className="absolute w-full bottom-0 flex flex-col items-center justify-center text-white text-[11px]">
                              <span className="p-0 font-semibold text-[12px] text-white capitalize">
                                Italy
                              </span>
                              <div className="text-xs w-1/2 border-b border-white text-white"></div>
                              <h3 className="text-xs bg-gray-900 text-center">
                                <span className="capitalize">Tourist</span> visa
                                within 5 days
                              </h3>
                            </div>
                            <div className="absolute top-0 left-0 text-white px-2 py-1 text-xl rounded">
                              🔥
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Section Information</CardTitle>
              <CardDescription>
                Configure the main service section content. Service data comes
                from visa database automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Enter section title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={e => handleInputChange('subtitle', e.target.value)}
                  placeholder="Enter subtitle..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter description..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    handleInputChange('status', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Data Information</CardTitle>
              <CardDescription>
                Service cards, filters, and pricing are automatically generated
                from the visa database to ensure data consistency and proper
                calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  How it works:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Service cards are generated from active visas in the
                    database
                  </li>
                  <li>• Pricing calculations are handled automatically</li>
                  <li>
                    • Filters are based on visa categories and processing times
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  To modify service data:
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Go to Visa Management to add/edit visa types</li>
                  <li>• Update visa categories and processing times</li>
                  <li>• Modify pricing in the visa configuration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Admin Data Indicator */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Admin Configurable Data
            </h4>
            <p className="text-sm text-blue-800 mt-1">
              The section title, subtitle, and description above are managed
              from this admin panel. Service cards, filters, and pricing are
              automatically generated from your visa database.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
