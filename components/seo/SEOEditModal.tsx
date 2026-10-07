"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Save, Eye, Search } from "lucide-react"

interface SEOData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
  robots: string
  status: 'active' | 'inactive'
}

interface SEOEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SEOData) => void
  initialData?: SEOData
  pageTitle?: string
  pagePath?: string
  type?: 'page' | 'visa'
}

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'Index, Follow' },
  { value: 'noindex, follow', label: 'No Index, Follow' },
  { value: 'index, nofollow', label: 'Index, No Follow' },
  { value: 'noindex, nofollow', label: 'No Index, No Follow' },
]

export default function SEOEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  pageTitle = "Page",
  pagePath = "/",
  type = 'page'
}: SEOEditModalProps) {
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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Set default values based on page title
      setFormData({
        metaTitle: pageTitle,
        metaDescription: '',
        metaKeywords: [],
        ogTitle: pageTitle,
        ogDescription: '',
        ogImage: '',
        canonical: pagePath,
        robots: 'index, follow',
        status: 'active'
      })
    }
  }, [initialData, pageTitle, pagePath])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(formData)
      toast({
        title: "Success",
        description: "SEO settings saved successfully"
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Edit SEO Settings</span>
          </DialogTitle>
          <DialogDescription>
            Optimize SEO settings for {type === 'visa' ? 'visa quotation' : 'page'}: {pageTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic SEO</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  value={formData.canonical}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonical: e.target.value }))}
                  placeholder="Enter canonical URL"
                />
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
          </div>

          {/* Open Graph */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Open Graph (Social Media)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="Enter Open Graph image URL"
                />
              </div>
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
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="text-blue-600 text-sm hover:underline cursor-pointer">
                  {formData.metaTitle || 'Meta Title Preview'}
                </div>
                <div className="text-green-600 text-xs">
                  {formData.canonical || pagePath}
                </div>
                <div className="text-gray-600 text-sm">
                  {formData.metaDescription || 'Meta description preview...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save SEO Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
