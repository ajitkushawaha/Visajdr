"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Eye, Search, Plus, X } from "lucide-react"

interface SEOData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
  robots: string
  status: 'active' | 'inactive' | 'draft'
}

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'Index, Follow' },
  { value: 'noindex, follow', label: 'No Index, Follow' },
  { value: 'index, nofollow', label: 'Index, No Follow' },
  { value: 'noindex, nofollow', label: 'No Index, No Follow' },
]

export default function EditPageSEO() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState<any>(null)
  const [formData, setFormData] = useState<SEOData>({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonical: '',
    robots: 'index, follow',
    status: 'active'
  })
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchPageData()
    }
  }, [params.id])

  const fetchPageData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/seo/pages/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPageData(data.page)
        setFormData({
          metaTitle: data.page.metaTitle || '',
          metaDescription: data.page.metaDescription || '',
          metaKeywords: data.page.metaKeywords || [],
          ogTitle: data.page.metaTitle || '',
          ogDescription: data.page.metaDescription || '',
          ogImage: data.page.ogImage || '',
          canonical: data.page.canonical || '',
          robots: data.page.robots || 'index, follow',
          status: data.page.status || 'active'
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch page data",
          variant: "destructive"
        })
        router.push('/admin/content/seo')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch page data",
        variant: "destructive"
      })
      router.push('/admin/content/seo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/seo/pages/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "SEO settings saved successfully"
        })
        router.push('/admin/content/seo')
      } else {
        toast({
          title: "Error",
          description: "Failed to save SEO settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.metaKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(k => k !== keyword)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const getCharacterCount = (text: string, max: number) => {
    const count = text.length
    const color = count > max ? 'text-red-500' : count > max * 0.9 ? 'text-yellow-500' : 'text-green-500'
    return <span className={`text-xs ${color}`}>{count}/{max}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Page not found</p>
        <Button onClick={() => router.push('/admin/page-management/seo')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SEO Management
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/admin/page-management/seo')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit SEO Settings</h1>
            <p className="text-gray-600 mt-1">{pageData.title} - {pageData.path}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.open(pageData.path, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Basic SEO</span>
              </CardTitle>
              <CardDescription>
                Essential SEO settings for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Enter meta title"
                  maxLength={60}
                />
                <div className="flex justify-between items-center">
                  {getCharacterCount(formData.metaTitle, 60)}
                  <span className="text-xs text-gray-500">Recommended: 50-60 characters</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Enter meta description"
                  rows={3}
                  maxLength={160}
                />
                <div className="flex justify-between items-center">
                  {getCharacterCount(formData.metaDescription, 160)}
                  <span className="text-xs text-gray-500">Recommended: 150-160 characters</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add keyword"
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metaKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  value={formData.canonical}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonical: e.target.value }))}
                  placeholder="Enter canonical URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Open Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Open Graph (Social Media)</CardTitle>
              <CardDescription>
                Settings for social media sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                  placeholder="Enter Open Graph title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.ogDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                  placeholder="Enter Open Graph description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="Enter Open Graph image URL"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="robots">Robots Directive</Label>
                <Select
                  value={formData.robots}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, robots: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROBOTS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))
                    }
                  />
                  <Label htmlFor="status">
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Search Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="text-blue-600 text-sm hover:underline cursor-pointer">
                    {formData.metaTitle || 'Meta Title Preview'}
                  </div>
                  <div className="text-green-600 text-xs">
                    {formData.canonical || pageData.path}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.metaDescription || 'Meta description preview...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}