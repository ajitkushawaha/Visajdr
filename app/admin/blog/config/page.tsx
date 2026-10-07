'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'

interface BlogAuthor {
  _id?: string
  name: string
  email?: string
  bio?: string
  profileImage?: string
  order?: number
  isActive: boolean
}
interface BlogCategory {
  _id?: string
  name: string
  slug: string
  order?: number
  isActive: boolean
}

interface BlogCTA {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  travelersText?: string
  trustText?: string
  travelerImages?: string[]
  isActive: boolean
}

interface BlogVisaPlan {
  badgeText?: string
  title: string
  description?: string
  processingTime?: string
  price?: string
  buttonText: string
  buttonLink: string
  isActive: boolean
}

interface BlogConfig {
  _id?: string
  authors: BlogAuthor[]
  categories: BlogCategory[]
  headerCTA?: BlogCTA
  visaPlanCTA?: BlogVisaPlan
  footerCTA?: BlogCTA
  sidebarCTA?: BlogCTA
}

export default function BlogConfigPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogConfigContent />
    </Suspense>
  )
}

function BlogConfigContent() {
  const [config, setConfig] = useState<BlogConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')

  const [activeTab, setActiveTab] = useState(tabParam || 'authors')
  const [expandedAuthors, setExpandedAuthors] = useState<Set<number>>(new Set())
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blog-config', {
        cache: 'no-store',
      })
      const data = await response.json()

      if (data.success) {
        const configData = data.data || {}
        setConfig({
          authors: configData.authors || [],
          categories: configData.categories || [],
          headerCTA: configData.headerCTA || {
            title: '',
            buttonText: '',
            buttonLink: '',
            isActive: false,
          },
          footerCTA: configData.footerCTA || {
            title: '',
            buttonText: '',
            buttonLink: '',
            isActive: false,
          },
          sidebarCTA: configData.sidebarCTA || {
            title: 'Secure Your Visa in 4 Quick Steps',
            buttonText: 'View Prices',
            buttonLink: '/select-plan',
            isActive: true,
          },
          visaPlanCTA: configData.visaPlanCTA || {
            badgeText: 'Popular',
            title: 'Choose Your Visa Plan',
            processingTime: '3-5 Days',
            price: 'Starting at ₹99',
            buttonText: 'Apply Now',
            buttonLink: '/select-plan',
            isActive: true,
          },
        })
      } else {
        toast.error(data.error || 'Failed to fetch blog configuration')
      }
    } catch (error) {
      console.error('Error fetching blog config:', error)
      toast.error('Failed to fetch blog configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)

      const saveData = {
        authors: config.authors || [],
        categories: config.categories || [],
        headerCTA: config.headerCTA,
        visaPlanCTA: config.visaPlanCTA,
        footerCTA: config.footerCTA,
        sidebarCTA: config.sidebarCTA,
      }

      const response = await fetch('/api/admin/blog-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Blog configuration saved successfully!')
        const configData = data.data || {}
        setConfig({
          authors: configData.authors || [],
          categories: configData.categories || [],
        })
      } else {
        toast.error(data.error || 'Failed to save blog configuration')
      }
    } catch (error) {
      console.error('Error saving blog config:', error)
      toast.error('Failed to save blog configuration')
    } finally {
      setSaving(false)
    }
  }

  // Authors management
  const addAuthor = () => {
    if (!config) return
    setConfig({
      ...config,
      authors: [
        {
          name: '',
          email: '',
          bio: '',
          profileImage: '',
          order: 0,
          isActive: true,
        },
        ...config.authors.map((author, index) => ({
          ...author,
          order: index + 1,
        })),
      ],
    })
    setExpandedAuthors(new Set([0]))
  }

  const updateAuthor = (index: number, field: string, value: any) => {
    if (!config) return
    const updatedAuthors = [...config.authors]
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value }
    setConfig({ ...config, authors: updatedAuthors })
  }

  const removeAuthor = (index: number) => {
    if (!config) return
    if (confirm('Are you sure you want to remove this author?')) {
      const updatedAuthors = config.authors.filter((_, i) => i !== index)
      setConfig({ ...config, authors: updatedAuthors })
      const newExpanded = new Set(expandedAuthors)
      newExpanded.delete(index)
      setExpandedAuthors(newExpanded)
    }
  }

  // Categories management
  const addCategory = () => {
    if (!config) return
    const newCategory: BlogCategory = {
      name: '',
      slug: '',
      order: config.categories?.length || 0,
      isActive: true,
    }
    setConfig({
      ...config,
      categories: [...(config.categories || []), newCategory],
    })
  }

  const updateCategory = (index: number, field: string, value: any) => {
    if (!config || !config.categories) return
    const updatedCategories = [...config.categories]
    updatedCategories[index] = { ...updatedCategories[index], [field]: value }

    if (field === 'name') {
      updatedCategories[index].slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    setConfig({ ...config, categories: updatedCategories })
  }

  const removeCategory = (index: number) => {
    if (!config) return
    if (confirm('Are you sure you want to remove this category?')) {
      const updatedCategories = (config.categories || []).filter(
        (_, i) => i !== index
      )
      setConfig({ ...config, categories: updatedCategories })
    }
  }

  const handleFileUpload = (index: number) => {
    setUploadingIndex(index)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const processFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setUploadingIndex(null)
      return
    }
    if (uploadingIndex === null) return

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        'Please select a valid image file (PNG, JPEG, JPG, GIF, or WebP)'
      )
      return
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 2MB')
      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'author-profiles')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const imageUrl = result.image?.url
        updateAuthor(uploadingIndex, 'profileImage', imageUrl)
        toast.success('Profile image uploaded successfully')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setSaving(false)
      setUploadingIndex(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeProfileImage = (index: number) => {
    updateAuthor(index, 'profileImage', '')
  }

  const toggleAuthorExpanded = (index: number) => {
    const newExpanded = new Set(expandedAuthors)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedAuthors(newExpanded)
  }

  const updateCTA = (
    ctaType: 'headerCTA' | 'footerCTA' | 'sidebarCTA' | 'visaPlanCTA',
    field: string,
    value: any
  ) => {
    if (!config) return
    const currentCTA = config[ctaType] || {
      title: '',
      buttonText: '',
      buttonLink: '',
      isActive: false,
    }
    setConfig({
      ...config,
      [ctaType]: { ...currentCTA, [field]: value },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Failed to load configuration</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Blog Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage blog authors and categories
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blog"
            className="text-gray-600 hover:text-gray-900"
          >
            <Button variant="outline">Back to Blogs</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="ctas">CTAs & Sidebar</TabsTrigger>
        </TabsList>

        {/* Authors Tab */}
        <TabsContent value="authors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Blog Authors ({(config.authors || []).length})
                </CardTitle>
                <Button onClick={addAuthor} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(config.authors || []).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No authors added yet.</p>
                  <Button onClick={addAuthor} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Author
                  </Button>
                </div>
              ) : (
                (config.authors || []).map((author, index) => {
                  const isExpanded = expandedAuthors.has(index)
                  return (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {/* Compact View - Always Visible */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Profile Image */}
                            {author.profileImage ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                <img
                                  src={author.profileImage}
                                  alt={author.name || 'Author'}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.currentTarget.src = '/placeholder.svg'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg font-bold">
                                  {(author.name || 'A').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                            {/* Author Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {author.name || 'Unnamed Author'}
                                </h3>
                                {author.isActive ? (
                                  <Badge
                                    variant="default"
                                    className="bg-green-500"
                                  >
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </div>
                              {author.email && (
                                <p className="text-sm text-gray-600 truncate">
                                  {author.email}
                                </p>
                              )}
                              {author.bio && (
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {author.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAuthorExpanded(index)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeAuthor(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded View - Edit Form */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Name *</Label>
                              <Input
                                value={author.name}
                                onChange={e =>
                                  updateAuthor(index, 'name', e.target.value)
                                }
                                placeholder="Author name"
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={author.email || ''}
                                onChange={e =>
                                  updateAuthor(index, 'email', e.target.value)
                                }
                                placeholder="author@example.com"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Profile Image</Label>
                            <div className="mt-2 space-y-4">
                              {author.profileImage ? (
                                <div className="relative w-32 h-32">
                                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200">
                                    <img
                                      src={author.profileImage}
                                      alt={author.name || 'Author'}
                                      className="w-full h-full object-cover"
                                      onError={e => {
                                        e.currentTarget.src = '/placeholder.svg'
                                      }}
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeProfileImage(index)}
                                    className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-md"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white">
                                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                  <span className="text-xs text-gray-500">
                                    No Image
                                  </span>
                                </div>
                              )}

                              <div>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={processFileUpload}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFileUpload(index)}
                                  disabled={uploadingIndex === index || saving}
                                  className="flex items-center gap-2"
                                >
                                  {uploadingIndex === index ? (
                                    <>
                                      <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      {author.profileImage
                                        ? 'Change Image'
                                        : 'Upload Image'}
                                    </>
                                  )}
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">
                                  Recommended: Square image, max 2MB (JPG, PNG,
                                  WebP)
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Bio</Label>
                            <Textarea
                              value={author.bio || ''}
                              onChange={e =>
                                updateAuthor(index, 'bio', e.target.value)
                              }
                              placeholder="Author bio..."
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`active-${index}`}
                              checked={author.isActive}
                              onChange={e =>
                                updateAuthor(
                                  index,
                                  'isActive',
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <Label
                              htmlFor={`active-${index}`}
                              className="cursor-pointer"
                            >
                              Active
                            </Label>
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Blog Categories ({(config.categories || []).length})
                </CardTitle>
                <Button onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.categories || []).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No categories added yet.</p>
                  <Button onClick={addCategory} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Category
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(config.categories || []).map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs uppercase text-gray-500">
                            Category Name
                          </Label>
                          <Input
                            value={category.name}
                            onChange={e =>
                              updateCategory(index, 'name', e.target.value)
                            }
                            placeholder="e.g. Visa Guides"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs uppercase text-gray-500">
                            Slug
                          </Label>
                          <Input
                            value={category.slug}
                            onChange={e =>
                              updateCategory(index, 'slug', e.target.value)
                            }
                            placeholder="visa-guides"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            role="checkbox"
                            id={`cat-active-${index}`}
                            checked={category.isActive}
                            onChange={e =>
                              updateCategory(
                                index,
                                'isActive',
                                e.target.checked
                              )
                            }
                            className="rounded h-4 w-4"
                          />
                          <Label
                            htmlFor={`cat-active-${index}`}
                            className="text-sm cursor-pointer whitespace-nowrap"
                          >
                            Active
                          </Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCategory(index)}
                          className="h-9 w-9 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          {/* Sidebar CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar CTA (Blog Content Page)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Sidebar CTA</Label>
                  <p className="text-sm text-gray-500">
                    This CTA appears in the sidebar of individual blog posts.
                  </p>
                </div>
                <Switch
                  checked={config.sidebarCTA?.isActive}
                  onCheckedChange={checked =>
                    updateCTA('sidebarCTA', 'isActive', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-title">CTA Title</Label>
                    <Input
                      id="sidebar-title"
                      value={config.sidebarCTA?.title || ''}
                      onChange={e =>
                        updateCTA('sidebarCTA', 'title', e.target.value)
                      }
                      placeholder="e.g. Secure Your Visa in 4 Quick Steps"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-btn-text">Button Text</Label>
                    <Input
                      id="sidebar-btn-text"
                      value={config.sidebarCTA?.buttonText || ''}
                      onChange={e =>
                        updateCTA('sidebarCTA', 'buttonText', e.target.value)
                      }
                      placeholder="e.g. View Prices"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-btn-link">Button Link</Label>
                    <Input
                      id="sidebar-btn-link"
                      value={config.sidebarCTA?.buttonLink || ''}
                      onChange={e =>
                        updateCTA('sidebarCTA', 'buttonLink', e.target.value)
                      }
                      placeholder="e.g. /select-plan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-desc">Description (Optional)</Label>
                    <Input
                      id="sidebar-desc"
                      value={config.sidebarCTA?.description || ''}
                      onChange={e =>
                        updateCTA('sidebarCTA', 'description', e.target.value)
                      }
                      placeholder="e.g. Simple and fast process"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Header CTA (Default)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Header CTA</Label>
                  <p className="text-sm text-gray-500">
                    Default fallback if post-specific CTA is not set.
                  </p>
                </div>
                <Switch
                  checked={config.headerCTA?.isActive}
                  onCheckedChange={checked =>
                    updateCTA('headerCTA', 'isActive', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={config.headerCTA?.title || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'title', e.target.value)
                    }
                    placeholder="e.g. Ready to Start Your Visa Application?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={config.headerCTA?.buttonText || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'buttonText', e.target.value)
                    }
                    placeholder="e.g. Start Visa Application"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={config.headerCTA?.buttonLink || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'buttonLink', e.target.value)
                    }
                    placeholder="e.g. /select-plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Travelers Text</Label>
                  <Input
                    value={config.headerCTA?.travelersText || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'travelersText', e.target.value)
                    }
                    placeholder="e.g. Join 1,50,000+ Travelers"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trust Text</Label>
                  <Input
                    value={config.headerCTA?.trustText || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'trustText', e.target.value)
                    }
                    placeholder="e.g. who trust our guide."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={config.headerCTA?.description || ''}
                    onChange={e =>
                      updateCTA('headerCTA', 'description', e.target.value)
                    }
                    placeholder="Brief description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visa Plan CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Visa Plan CTA (Default)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Visa Plan CTA</Label>
                  <p className="text-sm text-gray-500">
                    Default fallback for the visa plan comparison card.
                  </p>
                </div>
                <Switch
                  checked={config.visaPlanCTA?.isActive}
                  onCheckedChange={checked =>
                    updateCTA('visaPlanCTA', 'isActive', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input
                    value={config.visaPlanCTA?.badgeText || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'badgeText', e.target.value)
                    }
                    placeholder="e.g. Popular"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={config.visaPlanCTA?.title || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'title', e.target.value)
                    }
                    placeholder="e.g. Choose Your Visa Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Processing Time</Label>
                  <Input
                    value={config.visaPlanCTA?.processingTime || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'processingTime', e.target.value)
                    }
                    placeholder="e.g. 3-5 Days"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    value={config.visaPlanCTA?.price || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'price', e.target.value)
                    }
                    placeholder="e.g. Starting at ₹99"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={config.visaPlanCTA?.buttonText || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'buttonText', e.target.value)
                    }
                    placeholder="e.g. Apply Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={config.visaPlanCTA?.buttonLink || ''}
                    onChange={e =>
                      updateCTA('visaPlanCTA', 'buttonLink', e.target.value)
                    }
                    placeholder="e.g. /select-plan"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Footer CTA (Default)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Footer CTA</Label>
                  <p className="text-sm text-gray-500">
                    Default fallback if post-specific CTA is not set.
                  </p>
                </div>
                <Switch
                  checked={config.footerCTA?.isActive}
                  onCheckedChange={checked =>
                    updateCTA('footerCTA', 'isActive', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={config.footerCTA?.title || ''}
                    onChange={e =>
                      updateCTA('footerCTA', 'title', e.target.value)
                    }
                    placeholder="e.g. Ready to Apply for Your Visa?"
                  />
                </div>
                <div className="space-y-2 text-wrap">
                  <Label>Description</Label>
                  <Textarea
                    value={config.footerCTA?.description || ''}
                    onChange={e =>
                      updateCTA('footerCTA', 'description', e.target.value)
                    }
                    placeholder="e.g. Get expert assistance with your visa application."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={config.footerCTA?.buttonText || ''}
                    onChange={e =>
                      updateCTA('footerCTA', 'buttonText', e.target.value)
                    }
                    placeholder="e.g. Start Application"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={config.footerCTA?.buttonLink || ''}
                    onChange={e =>
                      updateCTA('footerCTA', 'buttonLink', e.target.value)
                    }
                    placeholder="e.g. /select-plan"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
