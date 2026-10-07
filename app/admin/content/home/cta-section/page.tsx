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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Upload, Plus, Trash2, Save, Eye, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'

interface CTAStatCard {
  _id?: string
  title: string
  value: string
  description: string
  backgroundColor: string
  textColor?: string
  order: number
  status: 'active' | 'inactive'
}

interface CTASection {
  _id?: string
  iconPath: string
  badgeText: string
  title: string
  subtitle?: string
  backgroundImagePath: string
  backgroundColor?: string
  stats: CTAStatCard[]
  status: 'active' | 'inactive'
  order: number
}

export default function CTASectionAdmin() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<CTASection>({
    iconPath: '/visa/Frame.png',
    badgeText: 'Process Overview',
    title: 'We Trust The Process do you?',
    subtitle: '',
    backgroundImagePath: '/visa/trustbg.png',
    backgroundColor: '#F8F7FA',
    stats: [],
    status: 'active',
    order: 0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCTASection()
  }, [])

  const fetchCTASection = async () => {
    try {
      const response = await fetch('/api/admin/home/cta-section')
      const data = await response.json()

      if (data.success && data.ctaSection) {
        setFormData(data.ctaSection)
      }
    } catch (error) {
      console.error('Error fetching CTA section:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch CTA section data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/home/cta-section', {
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
          description: 'CTA section saved successfully!',
          variant: 'default',
        })
        setFormData(data.ctaSection)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save CTA section',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving CTA section:', error)
      toast({
        title: 'Error',
        description: 'Failed to save CTA section',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CTASection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addStat = () => {
    const newStat: CTAStatCard = {
      title: '',
      value: '',
      description: '',
      backgroundColor: '#EC3237',
      textColor: 'white',
      order: formData.stats.length,
      status: 'active',
    }

    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }))
  }

  const updateStat = (index: number, field: keyof CTAStatCard, value: any) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      ),
    }))
  }

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (file: File, type: 'icon' | 'background') => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'cta-section')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        if (type === 'icon') {
          handleInputChange('iconPath', data.secure_url)
        } else {
          handleInputChange('backgroundImagePath', data.secure_url)
        }
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
          <p className="mt-4 text-gray-600">Loading CTA section...</p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold">CTA Section Management</h1>
          <p className="text-gray-600">
            Manage the Call-to-Action section content and statistics
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
            Preview how the CTA section will appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <section className="w-full flex flex-col items-center justify-center py-8">
              <div
                className="w-full rounded-2xl shadow-sm bg-[#F8F7FA] flex flex-col items-center gap-4 py-8 px-4"
                style={{
                  backgroundImage: formData.backgroundImagePath
                    ? `url('${formData.backgroundImagePath}')`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top center',
                  minHeight: '300px',
                  backgroundColor: formData.backgroundColor || '#F8F7FA',
                }}
              >
                {/* Section Header */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {formData.iconPath && (
                      <img
                        src={formData.iconPath}
                        alt="Process Icon"
                        className="h-4 w-4"
                      />
                    )}
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-600">
                      {formData.badgeText}
                    </p>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {formData.title}
                  </h2>
                  {formData.subtitle && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.subtitle}
                    </p>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  {formData.stats
                    .filter(stat => stat.status === 'active')
                    .map((stat, index) => (
                      <div
                        key={index}
                        className="flex flex-col justify-center rounded-xl p-8 bg-white shadow-sm"
                      >
                        <h4 className="text-xs font-bold text-green-600 uppercase mb-3 tracking-wider">
                          {stat.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-5xl font-bold text-gray-900 tracking-tight">
                            {stat.value}
                          </h3>
                          {(stat.title.toLowerCase().includes('rating') ||
                            stat.value.includes('4.')) && (
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          {stat.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        {/* Basic Content */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Content</CardTitle>
            <CardDescription>
              Configure the main content and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="badgeText">Badge Text</Label>
              <Input
                id="badgeText"
                value={formData.badgeText}
                onChange={e => handleInputChange('badgeText', e.target.value)}
                placeholder="Process Overview"
              />
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Textarea
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="We Trust The Process do you?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={e => handleInputChange('subtitle', e.target.value)}
                placeholder="Additional subtitle text"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={formData.backgroundColor || '#F8F7FA'}
                onChange={e =>
                  handleInputChange('backgroundColor', e.target.value)
                }
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

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload and manage section images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Icon Image</Label>
              <div className="flex items-center gap-4">
                {formData.iconPath && (
                  <img
                    src={formData.iconPath}
                    alt="Icon"
                    className="w-8 h-8 object-contain"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'icon')
                  }}
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <Label>Background Image</Label>
              <div className="flex items-center gap-4">
                {formData.backgroundImagePath && (
                  <img
                    src={formData.backgroundImagePath}
                    alt="Background"
                    className="w-16 h-10 object-cover rounded"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'background')
                  }}
                  disabled={uploading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Management */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics Cards</CardTitle>
          <CardDescription>
            Manage the statistics cards displayed in the CTA section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={addStat} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Statistic Card
            </Button>

            <div className="space-y-4">
              {formData.stats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={stat.title}
                        onChange={e =>
                          updateStat(index, 'title', e.target.value)
                        }
                        placeholder="Google Rating"
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={stat.value}
                        onChange={e =>
                          updateStat(index, 'value', e.target.value)
                        }
                        placeholder="4.8"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={stat.description}
                        onChange={e =>
                          updateStat(index, 'description', e.target.value)
                        }
                        placeholder="Google Rating"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="flex gap-2">
                        <Select
                          value={stat.status}
                          onValueChange={(value: 'active' | 'inactive') =>
                            updateStat(index, 'status', value)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeStat(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
