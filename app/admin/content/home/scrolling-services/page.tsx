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
import { Badge } from '@/components/ui/badge'
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface ScrollingServiceItem {
  _id?: string
  name: string
  icon: string
  order: number
  status: 'active' | 'inactive'
}

interface ScrollingServicesData {
  _id?: string
  items: ScrollingServiceItem[]
  status: 'active' | 'inactive'
}

export default function ScrollingServicesAdmin() {
  const [content, setContent] = useState<ScrollingServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/home/scrolling-services')
      const data = await response.json()

      if (data.success) {
        setContent(data.scrollingServices)
      } else {
        toast.error(data.error || 'Failed to fetch scrolling services')
      }
    } catch (error) {
      console.error('Error fetching scrolling services:', error)
      toast.error('Failed to fetch scrolling services')
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (
    index: number,
    field: keyof ScrollingServiceItem,
    value: string | number
  ) => {
    if (!content) return

    const updatedItems = [...content.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    setContent(prev => ({
      ...prev!,
      items: updatedItems,
    }))
  }

  const addItem = () => {
    if (!content) return

    setContent(prev => ({
      ...prev!,
      items: [
        ...prev!.items,
        {
          name: '',
          icon: '',
          order: prev!.items.length,
          status: 'active',
        },
      ],
    }))
  }

  const removeItem = (index: number) => {
    if (!content) return

    const updatedItems = content.items.filter((_, i) => i !== index)
    setContent(prev => ({
      ...prev!,
      items: updatedItems,
    }))
  }

  const toggleItemStatus = (index: number) => {
    if (!content) return

    const updatedItems = [...content.items]
    updatedItems[index] = {
      ...updatedItems[index],
      status: updatedItems[index].status === 'active' ? 'inactive' : 'active',
    }

    setContent(prev => ({
      ...prev!,
      items: updatedItems,
    }))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!content) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= content.items.length) return

    const updatedItems = [...content.items]
    ;[updatedItems[index], updatedItems[newIndex]] = [
      updatedItems[newIndex],
      updatedItems[index],
    ]

    // Update order values
    updatedItems.forEach((item, i) => {
      item.order = i
    })

    setContent(prev => ({
      ...prev!,
      items: updatedItems,
    }))
  }

  const handleSave = async () => {
    if (!content) return

    // Validate items
    for (const item of content.items) {
      if (!item.name.trim()) {
        toast.error('Please fill in all service names')
        return
      }
      if (!item.icon || !item.icon.trim()) {
        toast.error('Please enter an icon name for all services')
        return
      }
    }

    try {
      setSaving(true)

      const response = await fetch('/api/admin/home/scrolling-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        toast.success('Scrolling services updated successfully!')
        await fetchContent()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save scrolling services')
      }
    } catch (error) {
      console.error('Error saving scrolling services:', error)
      toast.error('Failed to save scrolling services')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Content Found
            </h1>
            <p className="text-gray-600">
              Unable to load scrolling services content.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        <div className="mb-6">
          <Link href="/admin/content/home">
            <Button
              variant="ghost"
              className="mb-4 text-brand-primary bg-white hover:bg-gray-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Scrolling Services
              </h1>
              <p className="text-gray-600 mt-2">
                Manage the scrolling services displayed on the homepage
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Services List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    Add, edit, or remove services that scroll on the homepage.
                    Services will be duplicated for seamless scrolling. Enter
                    icon names from{' '}
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Lucide Icons
                      <ExternalLink className="h-3 w-3" />
                    </a>{' '}
                    (e.g., Briefcase, PlaneTakeoff, Globe).
                  </CardDescription>
                </div>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.items.map((item, index) => {
                // Dynamically get icon component for preview
                const IconComponent =
                  (item.icon && (LucideIcons as any)[item.icon]) ||
                  LucideIcons.HelpCircle
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === content.items.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Service Name</Label>
                        <Input
                          value={item.name}
                          onChange={e =>
                            handleItemChange(index, 'name', e.target.value)
                          }
                          placeholder="e.g., Travel Packages"
                        />
                      </div>
                      <div>
                        <Label>Icon Name</Label>
                        <Input
                          value={item.icon}
                          onChange={e =>
                            handleItemChange(index, 'icon', e.target.value)
                          }
                          placeholder="e.g., Briefcase, Plane, Globe"
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter icon name from{' '}
                          <a
                            href="https://lucide.dev/icons"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            lucide.dev/icons
                            <ExternalLink className="h-3 w-3" />
                          </a>{' '}
                          (e.g., Briefcase, PlaneTakeoff, Globe, Users)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.status === 'active' ? 'default' : 'secondary'
                        }
                        className="cursor-pointer"
                        onClick={() => toggleItemStatus(index)}
                      >
                        {item.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {content.items.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No services added. Click "Add Service" to add one.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How the scrolling services will appear on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-[#060342] overflow-hidden py-4 rounded-lg">
                <div className="whitespace-nowrap animate-scroll flex gap-16 items-center text-white text-lg font-semibold">
                  {content.items
                    .filter(item => item.status === 'active')
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => {
                      // Dynamically get icon component
                      const IconComponent =
                        (item.icon && (LucideIcons as any)[item.icon]) ||
                        LucideIcons.HelpCircle
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <IconComponent className="w-6 h-6" />
                          <span className="font-bold">{item.name}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
