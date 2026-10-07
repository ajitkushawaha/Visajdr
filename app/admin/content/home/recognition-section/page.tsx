'use client'

import React, { useState, useEffect } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  GripVertical,
} from 'lucide-react'
import Link from 'next/link'

interface RecognitionPartner {
  _id?: string
  img: string
  alt: string
  text: string
  order: number
  status: 'active' | 'inactive'
}

interface RecognitionSectionData {
  _id?: string
  title: string
  partners: RecognitionPartner[]
  status: 'active' | 'inactive'
}

export default function RecognitionSectionAdmin() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<RecognitionSectionData>({
    title: 'Recognized by global travel and data partners',
    partners: [],
    status: 'active',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchRecognitionSection()
  }, [])

  const fetchRecognitionSection = async () => {
    try {
      const response = await fetch('/api/admin/home/recognition-section')
      const data = await response.json()

      if (data.success && data.recognitionSection) {
        setFormData(data.recognitionSection)
      } else {
        // Initialize with default partners if empty
        setFormData(prev => ({
          ...prev,
          partners: [
            {
              img: '/india.png',
              alt: 'Ministry of Tourism, India',
              text: 'Officially recognised by the Ministry of Tourism, India.',
              order: 0,
              status: 'active',
            },
            {
              img: '/south.png',
              alt: 'Department: Home Affairs Republic of South Africa',
              text: 'Authorised partner for smooth, compliant South Africa visa processing.',
              order: 1,
              status: 'active',
            },
            {
              img: '/aico.png',
              alt: 'AICPA SOC',
              text: 'Your data stays private and secure with global SOC 2 standards.',
              order: 2,
              status: 'active',
            },
          ],
        }))
      }
    } catch (error) {
      console.error('Error fetching Recognition section:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch Recognition section data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (uploading) {
      toast({
        title: 'Please Wait',
        description: 'Image upload in progress. Please wait...',
        variant: 'default',
      })
      return
    }

    // Client-side validation
    const invalidPartners = formData.partners
      .map((p, index) => ({ ...p, index })) // Keep track of original index
      .filter(
        p =>
          p.status === 'active' &&
          (!(p.img || '').trim() ||
            !(p.alt || '').trim() ||
            !(p.text || '').trim())
      )

    if (invalidPartners.length > 0) {
      const errorDetails = invalidPartners
        .map(p => {
          const missing = []
          if (!(p.img || '').trim()) missing.push('Image')
          if (!(p.alt || '').trim()) missing.push('Alt Text')
          if (!(p.text || '').trim()) missing.push('Description')
          return `Partner #${p.index + 1}: Missing ${missing.join(', ')}`
        })
        .join('\n')

      toast({
        title: 'Validation Error',
        description: `Please fix the following errors:\n${errorDetails}`,
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/home/recognition-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Recognition section saved successfully!',
          variant: 'default',
        })
        setFormData(data.recognitionSection)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save Recognition section',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving Recognition section:', error)
      toast({
        title: 'Error',
        description: 'Failed to save Recognition section',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    field: keyof RecognitionSectionData,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addPartner = () => {
    const newPartner: RecognitionPartner = {
      img: '',
      alt: '',
      text: '',
      order: formData.partners.length,
      status: 'active',
    }

    setFormData(prev => ({
      ...prev,
      partners: [...prev.partners, newPartner],
    }))
  }

  const updatePartner = (
    index: number,
    field: keyof RecognitionPartner,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.map((partner, i) =>
        i === index ? { ...partner, [field]: value } : partner
      ),
    }))
  }

  const removePartner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (file: File, index: number) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'recognition-section')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        updatePartner(index, 'img', data.image.url)
        toast({
          title: 'Success',
          description: 'Image uploaded successfully!',
          variant: 'default',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload image',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading Recognition section...</p>
        </div>
      </div>
    )
  }

  // Filter active partners for preview
  const activePartners = formData.partners
    .filter(p => p.status === 'active')
    .sort((a, b) => a.order - b.order)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
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
          <h1 className="text-3xl font-bold">Recognition Section Management</h1>
          <p className="text-gray-600">
            Manage the "Recognized by global travel and data partners" section
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            Preview how the section will appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <section className="w-full py-16 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-[#2D2D2D] mb-12">
                  {formData.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                  {activePartners.map((partner, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8 flex flex-col items-start gap-8 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="w-full flex items-center justify-start min-h-[60px]">
                        {partner.img ? (
                          <img
                            src={partner.img}
                            alt={partner.alt}
                            className="w-auto h-auto max-h-[80px] object-contain object-left"
                          />
                        ) : (
                          <div className="w-full h-[60px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <p className="text-[#2D2D2D] text-[15px] font-semibold leading-relaxed">
                        {partner.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Form - Main Config */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Section Title</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Recognized by global travel and data partners"
                  rows={2}
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
        </div>

        {/* Partners Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Partners</CardTitle>
              <CardDescription>
                Manage the partner cards displayed in the section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Button
                  onClick={addPartner}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Partner
                </Button>

                <div className="space-y-4">
                  {formData.partners.map((partner, index) => (
                    <Card key={index} className="p-4 relative">
                      <div className="absolute right-4 top-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-move"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePartner(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pr-24">
                        {/* Image Upload */}
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                            {partner.img ? (
                              <img
                                src={partner.img}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No Img
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <Label>Partner Logo</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, index)
                              }}
                              disabled={uploading}
                              className="mt-1"
                            />
                            {partner.img && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Current: {partner.img}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Alt Text</Label>
                            <Input
                              value={partner.alt}
                              onChange={e =>
                                updatePartner(index, 'alt', e.target.value)
                              }
                              placeholder="e.g. Ministry of Tourism"
                            />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select
                              value={partner.status}
                              onValueChange={(value: 'active' | 'inactive') =>
                                updatePartner(index, 'status', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Description Text</Label>
                          <Textarea
                            value={partner.text}
                            onChange={e =>
                              updatePartner(index, 'text', e.target.value)
                            }
                            placeholder="e.g. Officially recognised by..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
