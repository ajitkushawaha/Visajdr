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
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ITermsOfServicePage } from '@/models/TermsOfServicePage'

const TermsOfServiceAdminPage: React.FC = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ITermsOfServicePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('meta')

  const fetchTermsOfServiceContent = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/pages/terms-of-service')
      if (!response.ok) {
        throw new Error('Failed to fetch Terms of Service content')
      }
      const data = await response.json()
      setFormData(data.termsOfServicePage)
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to load Terms of Service content.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTermsOfServiceContent()
  }, [fetchTermsOfServiceContent])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => (prev ? { ...prev, [name]: value } : null))
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => (prev ? { ...prev, [name]: new Date(value) } : null))
  }

  const handleSectionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSections = [...prev.sections]
      updatedSections[index] = { ...updatedSections[index], [field]: value }
      return { ...prev, sections: updatedSections }
    })
  }

  const addSection = () => {
    setFormData(prev => {
      if (!prev) return null
      const newSection = {
        title: '',
        content: '',
        order: prev.sections.length,
        status: 'active' as const,
      }
      return { ...prev, sections: [...prev.sections, newSection] }
    })
  }

  const removeSection = (index: number) => {
    setFormData(prev => {
      if (!prev) return null
      const updatedSections = prev.sections.filter((_, i) => i !== index)
      return { ...prev, sections: updatedSections }
    })
  }

  const handleSave = async () => {
    if (!formData) return
    setSaving(true)
    try {
      const response = await fetch('/api/admin/pages/terms-of-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        throw new Error('Failed to save Terms of Service content')
      }
      const data = await response.json()
      setFormData(data.termsOfServicePage)
      toast({
        title: 'Success',
        description: 'Terms of Service content saved successfully!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to save Terms of Service content.',
        variant: 'destructive',
      })
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
        No Terms of Service content found.
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
          Manage Terms of Service Page
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Preview */}
        <Card className="lg:col-span-2 order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your Terms of Service page will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] bg-gray-100 p-4 rounded-md flex items-center justify-center">
            <div className="w-full h-full bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4 text-brand-primary">
                  {formData.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {formData.subtitle}
                </p>
                <div className="flex justify-center gap-4 mb-6">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Updated:{' '}
                    {new Date(formData.lastUpdated).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Effective:{' '}
                    {new Date(formData.effectiveDate).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-lg mb-8">{formData.introduction}</p>

                {formData.sections
                  .filter(section => section.status === 'active')
                  .map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                        {section.title}
                      </h2>
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  ))}

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                    Contact Information
                  </h2>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <strong>Email:</strong> {formData.contactEmail}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <strong>Phone:</strong> {formData.contactPhone}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <strong>Address:</strong> {formData.contactAddress}
                    </p>
                    {formData.legalDepartmentEmail && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <strong>Legal Department:</strong>{' '}
                        {formData.legalDepartmentEmail}
                      </p>
                    )}
                  </div>
                </div>

                {formData.noteText && (
                  <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800">
                      {formData.noteText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="lg:col-span-1 order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Edit Terms of Service Content</CardTitle>
            <CardDescription>
              Update the various sections of your Terms of Service page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="meta">Meta Info</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>

              {/* Meta Information */}
              <TabsContent value="meta" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Page Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastUpdated">Last Updated</Label>
                  <Input
                    id="lastUpdated"
                    type="date"
                    value={
                      new Date(formData.lastUpdated).toISOString().split('T')[0]
                    }
                    onChange={e =>
                      handleDateChange('lastUpdated', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={
                      new Date(formData.effectiveDate)
                        .toISOString()
                        .split('T')[0]
                    }
                    onChange={e =>
                      handleDateChange('effectiveDate', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="introduction">Introduction</Label>
                  <Textarea
                    id="introduction"
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactAddress">Contact Address</Label>
                  <Textarea
                    id="contactAddress"
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="legalDepartmentEmail">
                    Legal Department Email (Optional)
                  </Label>
                  <Input
                    id="legalDepartmentEmail"
                    name="legalDepartmentEmail"
                    value={formData.legalDepartmentEmail || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="noteText">Note Text (Optional)</Label>
                  <Textarea
                    id="noteText"
                    name="noteText"
                    value={formData.noteText || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Sections */}
              <TabsContent value="sections" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Terms Sections</h3>
                  <Button onClick={addSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {formData.sections.map((section, index) => (
                  <Card key={section._id || index} className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Section {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor={`section-title-${index}`}>
                        Section Title
                      </Label>
                      <Input
                        id={`section-title-${index}`}
                        value={section.title}
                        onChange={e =>
                          handleSectionChange(index, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor={`section-content-${index}`}>
                        Section Content
                      </Label>
                      <Textarea
                        id={`section-content-${index}`}
                        value={section.content}
                        onChange={e =>
                          handleSectionChange(index, 'content', e.target.value)
                        }
                        rows={6}
                        placeholder="Use \n for line breaks"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`section-status-${index}`}
                          checked={section.status === 'active'}
                          onCheckedChange={checked =>
                            handleSectionChange(
                              index,
                              'status',
                              checked ? 'active' : 'inactive'
                            )
                          }
                        />
                        <Label htmlFor={`section-status-${index}`}>
                          Active
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`section-order-${index}`}>Order:</Label>
                        <Input
                          id={`section-order-${index}`}
                          type="number"
                          value={section.order}
                          onChange={e =>
                            handleSectionChange(
                              index,
                              'order',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
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
              Save Terms of Service Content
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TermsOfServiceAdminPage
