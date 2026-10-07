'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

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
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
  order: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    status: 'active' as 'active' | 'inactive',
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/faq')
      const data = await response.json()

      if (data.success) {
        setFaqs(data.faqs)
      } else {
        toast.error(data.error || 'Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      status: 'active',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)

      const url = editingId ? `/api/admin/faq/${editingId}` : '/api/admin/faq'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          editingId ? 'FAQ updated successfully!' : 'FAQ created successfully!'
        )
        await fetchFAQs()
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save FAQ')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      toast.error('Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: faq.status,
    })
    setEditingId(faq._id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('FAQ deleted successfully!')
        await fetchFAQs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('Failed to delete FAQ')
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/admin/content">
              <Button
                variant="ghost"
                className="text-gray-900 bg-white hover:bg-gray-200"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Content Management
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-1">
            Manage frequently asked questions for your website
          </p>
        </div>
        <Button onClick={resetForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New FAQ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</CardTitle>
            <CardDescription>
              {editingId
                ? 'Update the FAQ details below'
                : 'Fill in the details to create a new FAQ'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={e => handleInputChange('question', e.target.value)}
                  placeholder="Enter the question..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={e => handleInputChange('answer', e.target.value)}
                  placeholder="Enter the answer..."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Visa Application, Requirements"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={e =>
                      handleInputChange('order', parseInt(e.target.value) || 0)
                    }
                    className="mt-1"
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
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update FAQ'
                      : 'Create FAQ'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <Card>
          <CardHeader>
            <CardTitle>Current FAQs ({faqs.length})</CardTitle>
            <CardDescription>
              Click on a FAQ to expand and view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {faqs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No FAQs found</p>
              ) : (
                faqs.map(faq => (
                  <div
                    key={faq._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => toggleExpanded(faq._id)}
                            className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-medium text-gray-900">
                              {faq.question}
                            </h3>
                            {expandedItems.has(faq._id) ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>

                        {expandedItems.has(faq._id) && (
                          <div className="mt-2 space-y-2">
                            <p className="text-gray-700 text-sm">
                              {faq.answer}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{faq.category}</Badge>
                              <Badge
                                variant={
                                  faq.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {faq.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Order: {faq.order}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(faq)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(faq._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
