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
import { Plus, Trash2, Save, Eye, Star } from 'lucide-react'

interface Testimonial {
  _id?: string
  text: string
  name: string
  date: string
  rating?: number
  avatar?: string
  order: number
  status: 'active' | 'inactive'
}

interface TestimonialsSection {
  _id?: string
  badgeText: string
  title: string
  description: string
  backgroundImagePath: string
  backgroundColor?: string
  stats: {
    title: string
    value: string
    description: string
    backgroundColor: string
    textColor?: string
    position: 'left' | 'right' | 'center'
    order: number
    status: 'active' | 'inactive'
  }[]
  testimonials: Testimonial[]
  status: 'active' | 'inactive'
  order: number
}

export default function TestimonialsAdmin() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<TestimonialsSection>({
    badgeText: 'Client Testimonials',
    title: 'what people say about us',
    description:
      "Don't just take our word for it. Hear it straight from the jet-setters themselves.",
    backgroundImagePath: '/visa/map.png',
    backgroundColor: '#ffffff',
    stats: [],
    testimonials: [],
    status: 'active',
    order: 0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTestimonialsSection()
  }, [])

  const fetchTestimonialsSection = async () => {
    try {
      const response = await fetch('/api/admin/home/testimonials')
      const data = await response.json()

      if (data.success && data.testimonialsSection) {
        setFormData(data.testimonialsSection)
      }
    } catch (error) {
      console.error('Error fetching testimonials section:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch testimonials section data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/home/testimonials', {
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
          description: 'Testimonials section saved successfully!',
          variant: 'default',
        })
        setFormData(data.testimonialsSection)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save testimonials section',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving testimonials section:', error)
      toast({
        title: 'Error',
        description: 'Failed to save testimonials section',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof TestimonialsSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      text: '',
      name: '',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      rating: 5,
      order: formData.testimonials.length,
      status: 'active',
    }

    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }))
  }

  const updateTestimonial = (
    index: number,
    field: keyof Testimonial,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) =>
        i === index ? { ...testimonial, [field]: value } : testimonial
      ),
    }))
  }

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading testimonials section...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Testimonials Section Management
          </h1>
          <p className="text-gray-600">
            Manage testimonials, stats, and section content
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
            Preview how the testimonials section will appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-gray-50 overflow-hidden">
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                  <span className="text-red-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
                    {formData.badgeText}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-900">
                    {formData.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                    {formData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {formData.testimonials
                    .filter(t => t.status === 'active')
                    .map((testimonial, index) => (
                      <div
                        key={index}
                        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
                      >
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 sm:w-5 sm:h-5 fill-red-600 text-red-600"
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed italic flex-grow text-sm sm:text-base">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg sm:text-xl">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              {testimonial.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {testimonial.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

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
              placeholder="Client Testimonials"
            />
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="what people say about us"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Don't just take our word for it..."
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

      {/* Testimonials Management */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Manage customer testimonials and reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={addTestimonial}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>

            <div className="space-y-4">
              {formData.testimonials.map((testimonial, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Testimonial Text</Label>
                        <Textarea
                          value={testimonial.text}
                          onChange={e =>
                            updateTestimonial(index, 'text', e.target.value)
                          }
                          placeholder="Enter testimonial text..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={testimonial.name}
                            onChange={e =>
                              updateTestimonial(index, 'name', e.target.value)
                            }
                            placeholder="Customer Name"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            value={testimonial.date}
                            onChange={e =>
                              updateTestimonial(index, 'date', e.target.value)
                            }
                            placeholder="15 Jul 2024"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <Select
                          value={testimonial.rating?.toString() || '5'}
                          onValueChange={value =>
                            updateTestimonial(index, 'rating', parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex gap-2">
                          <Select
                            value={testimonial.status}
                            onValueChange={(value: 'active' | 'inactive') =>
                              updateTestimonial(index, 'status', value)
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
                            onClick={() => removeTestimonial(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
