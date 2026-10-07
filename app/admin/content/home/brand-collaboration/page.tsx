'use client'

import React, { useState, useEffect } from 'react'
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
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  GripVertical,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
// Removed direct Cloudinary import - using API endpoint instead

interface BrandLogo {
  _id?: string
  name: string
  imagePath: string // Stores Cloudinary URL for PNG images
  website?: string
  status: 'active' | 'inactive'
  order: number
  previewUrl?: string // For immediate preview of uploaded files
}

interface BrandCollaborationSection {
  _id?: string
  title: string
  subtitle?: string
  description?: string
  logos: BrandLogo[]
  status: 'active' | 'inactive'
  order: number
}

export default function BrandCollaborationEditor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null) // Track which logo is being uploaded
  const [formData, setFormData] = useState<BrandCollaborationSection>({
    title: 'Ascending To greater heights With Our Partnerships',
    subtitle: '',
    description: '',
    logos: [],
    status: 'active',
    order: 0,
  })

  useEffect(() => {
    fetchBrandCollaboration()
  }, [])

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      formData.logos.forEach(logo => {
        if (logo.previewUrl) {
          URL.revokeObjectURL(logo.previewUrl)
        }
      })
    }
  }, [])

  const fetchBrandCollaboration = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/home/brand-collaboration')
      const data = await response.json()

      if (data.success) {
        setFormData(data.brandCollaboration)
      } else {
        toast.error(data.error || 'Failed to fetch brand collaboration section')
      }
    } catch (error) {
      console.error('Error fetching brand collaboration section:', error)
      toast.error('Failed to fetch brand collaboration section')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof BrandCollaborationSection,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoChange = (
    index: number,
    field: keyof BrandLogo,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      logos: prev.logos.map((logo, i) =>
        i === index ? { ...logo, [field]: value } : logo
      ),
    }))
  }

  const addLogo = () => {
    const newLogo: BrandLogo = {
      name: `Company ${formData.logos.length + 1}`,
      imagePath: '',
      website: '',
      status: 'active',
      order: formData.logos.length,
    }

    setFormData(prev => ({
      ...prev,
      logos: [...prev.logos, newLogo],
    }))

    // Auto-scroll to the newly added logo
    scrollToLogo(formData.logos.length)
  }

  const removeLogo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      logos: prev.logos.filter((_, i) => i !== index),
    }))
  }

  const moveLogo = (index: number, direction: 'up' | 'down') => {
    const newLogos = [...formData.logos]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newLogos.length) {
      ;[newLogos[index], newLogos[targetIndex]] = [
        newLogos[targetIndex],
        newLogos[index],
      ]

      // Update order values
      newLogos.forEach((logo, i) => {
        logo.order = i
      })

      setFormData(prev => ({
        ...prev,
        logos: newLogos,
      }))
    }
  }

  const handleLogoImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - PNG only
    if (!file.type.startsWith('image/png')) {
      toast.error('Please select a PNG file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(index) // Set loading state for this specific logo

    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)

      // Upload using the existing API endpoint
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'brand-logos')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()

      // Update the logo with the Cloudinary URL and preview URL
      setFormData(prev => {
        const updatedLogos = prev.logos.map((logo, i) =>
          i === index
            ? {
                ...logo,
                imagePath: result.image.url, // Use API response URL
                previewUrl: previewUrl, // Add preview URL for immediate display
              }
            : logo
        )
        return {
          ...prev,
          logos: updatedLogos,
        }
      })

      toast.success('Logo image updated successfully!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error(
        `Failed to upload logo image: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setUploading(null) // Clear loading state
    }
  }

  // Auto-scroll to newly added logo
  const scrollToLogo = (index: number) => {
    setTimeout(() => {
      const element = document.getElementById(`logo-${index}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please fill in the title')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/admin/home/brand-collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Brand collaboration section saved successfully!')
        router.push('/admin/content/home')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save brand collaboration section')
      }
    } catch (error) {
      console.error('Error saving brand collaboration section:', error)
      toast.error('Error saving brand collaboration section. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Loading brand collaboration section...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/content/home">
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
            <h1 className="text-3xl font-bold">Brand Collaboration Editor</h1>
            <p className="text-gray-600">
              Manage brand collaboration section content
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            Preview how the brand collaboration section will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-6">
            <section className="py-1 bg-white flex flex-col items-center max-[600px]:px-5">
              <h1 className="py-5 text-lg md:text-2xl font-bold">
                {formData.title}
              </h1>
              {formData.subtitle && (
                <h2 className="text-lg text-gray-600 mb-4">
                  {formData.subtitle}
                </h2>
              )}
              {formData.description && (
                <p className="text-gray-600 text-center mb-6">
                  {formData.description}
                </p>
              )}
              <div className="w-4/5 max-[600px]:w-full grid gap-4 max-[600px]:p-0 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {formData.logos
                  .filter(logo => logo.status === 'active')
                  .map((logo, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-lg transition-transform duration-300 hover:-translate-y-1"
                    >
                      {logo.previewUrl || logo.imagePath ? (
                        <img
                          src={logo.previewUrl || logo.imagePath}
                          alt={logo.name}
                          className="max-w-full h-auto max-h-12 object-contain"
                          onError={e => {
                            // If image fails to load, show a placeholder
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove(
                              'hidden'
                            )
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-12 w-24 bg-gray-200 rounded text-gray-500 text-xs">
                          No image uploaded
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Form */}

        {/* Basic Content */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Content</CardTitle>
            <CardDescription>
              Configure the main content for the brand collaboration section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter section title"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={e => handleInputChange('subtitle', e.target.value)}
                placeholder="Enter subtitle (optional)"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Enter description (optional)"
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
                <SelectTrigger>
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

        {/* Logos Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Brand Logos</CardTitle>
                <CardDescription>
                  Manage the brand logos displayed in the section
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addLogo} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Logo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.logos.map((logo, index) => (
                <div
                  key={index}
                  id={`logo-${index}`}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Logo {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveLogo(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveLogo(index, 'down')}
                        disabled={index === formData.logos.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLogo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={logo.name}
                        onChange={e =>
                          handleLogoChange(index, 'name', e.target.value)
                        }
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <Label>Website URL</Label>
                      <Input
                        value={logo.website || ''}
                        onChange={e =>
                          handleLogoChange(index, 'website', e.target.value)
                        }
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Logo Image (PNG only)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".png"
                        onChange={e => handleLogoImageUpload(e, index)}
                        disabled={uploading === index}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      />
                      {uploading === index && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Uploading...
                        </div>
                      )}
                      <span className="text-sm text-gray-500">or</span>
                      <Input
                        value={logo.imagePath || ''}
                        onChange={e =>
                          handleLogoChange(index, 'imagePath', e.target.value)
                        }
                        placeholder="Enter Cloudinary URL (e.g., https://res.cloudinary.com/...)"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a PNG file or enter the file path
                    </p>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={logo.status}
                      onValueChange={(value: 'active' | 'inactive') =>
                        handleLogoChange(index, 'status', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Logo Preview */}
                  <div className="border rounded p-2 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-12 w-24 flex items-center justify-center bg-gray-200 rounded">
                        {logo.previewUrl || logo.imagePath ? (
                          <img
                            src={logo.previewUrl || logo.imagePath}
                            alt={logo.name}
                            className="max-w-full h-auto max-h-12 object-contain"
                            onLoad={() => {}}
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.classList.remove('hidden')
                                fallback.textContent = `Failed to load: ${logo.name}`
                              }
                            }}
                          />
                        ) : (
                          <div className="text-gray-500 text-xs">
                            No image uploaded
                          </div>
                        )}
                        <div className="hidden text-gray-500 text-xs">
                          Loading...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formData.logos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No logos added yet. Click "Add Logo" to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
