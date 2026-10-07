'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () =>
    import('@/components/ui/rich-text-editor').then(mod => mod.RichTextEditor),
  { ssr: false }
)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Trash2,
  Upload,
  X,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/hooks/useCurrency'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface BlogCTA {
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  travelersCount?: string
  travelersText?: string
  trustText?: string
  travelerImages?: string[]
  selectedVisaId?: string
  selectedVisaName?: string
  isActive?: boolean
}

interface BlogVisaPlan {
  badgeText?: string
  title?: string
  description?: string
  processingTime?: string
  price?: string
  buttonText?: string
  buttonLink?: string
  whatsappLink?: string
  phoneLink?: string
  selectedVisaId?: string
  selectedVisaName?: string
  purpose?: string
  isActive?: boolean
}

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  featuredImageAlt: string
  author: string
  status: 'draft' | 'published'
  category: string
  tags: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  headerCTA?: BlogCTA
  visaPlanCTA?: BlogVisaPlan
  footerCTA?: BlogCTA
}

// Categories are now fetched from config

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const { symbol: currencySymbol } = useCurrency()
  const blogId = params?.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [originalData, setOriginalData] = useState<any>(null)
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>(
    'url'
  )
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    author: '',
    status: 'draft',
    category: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    headerCTA: {
      isActive: false,
    },
    visaPlanCTA: {
      isActive: false,
    },
    footerCTA: {
      isActive: false,
    },
  })

  const [visas, setVisas] = useState<any[]>([])
  const [loadingVisas, setLoadingVisas] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [loadingAuthors, setLoadingAuthors] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Fetch authors and categories from blog config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingAuthors(true)
      setLoadingCategories(true)
      try {
        const response = await fetch('/api/admin/blog-config', {
          cache: 'no-store',
        })
        const data = await response.json()
        if (data.success && data.data) {
          // Only show active authors
          if (data.data.authors) {
            const activeAuthors = data.data.authors.filter(
              (a: any) => a.isActive !== false
            )
            setAuthors(activeAuthors)
          }
          // Only show active categories
          if (data.data.categories) {
            const activeCategories = data.data.categories.filter(
              (c: any) => c.isActive !== false
            )
            setCategories(activeCategories)
          }
        }
      } catch (error) {
        console.error('Error fetching config:', error)
      } finally {
        setLoadingAuthors(false)
        setLoadingCategories(false)
      }
    }
    fetchConfig()
  }, [])

  // Load existing blog data
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${blogId}`)
        if (response.ok) {
          const data = await response.json()

          setOriginalData(data)

          // Convert tags array back to string
          const tagsString = Array.isArray(data.tags)
            ? data.tags.join(', ')
            : data.tags || ''

          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            featuredImage: data.featuredImage || '',
            featuredImageAlt: data.featuredImageAlt || '',
            author: data.author || '',
            status: data.status || 'draft',
            category: data.category || '',
            tags: tagsString,
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            metaKeywords: data.metaKeywords || '',
            headerCTA: data.headerCTA || { isActive: false },
            visaPlanCTA: data.visaPlanCTA || { isActive: false },
            footerCTA: data.footerCTA || { isActive: false },
          })
          // Set image preview when loading existing data
          if (data.featuredImage) {
            setImagePreview(data.featuredImage)
          }
        } else {
          throw new Error('Failed to load blog data')
        }
      } catch (error) {
        console.error('Error loading blog:', error)
        alert('Error loading blog data. Please try again.')
        router.push('/admin/blog')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (blogId) {
      loadBlogData()
    }
  }, [blogId, router])

  // Fetch visas on mount
  useEffect(() => {
    const fetchVisas = async () => {
      setLoadingVisas(true)
      try {
        const response = await fetch('/api/admin/create-visa')
        const data = await response.json()
        if (data.visas) {
          setVisas(data.visas)
        }
      } catch (error) {
        console.error('Error fetching visas:', error)
      } finally {
        setLoadingVisas(false)
      }
    }
    fetchVisas()
  }, [])

  // Function to get visa details by ID
  const getVisaDetails = (visaId: string) => {
    return visas.find(v => v._id === visaId)
  }

  // Function to extract purpose from visaType
  const extractPurposeFromVisaType = (visaType: string): string => {
    if (!visaType) return 'business'

    const visaTypeLower = visaType.toLowerCase()

    // Check for different purposes in visaType
    if (
      visaTypeLower.includes('tourist') ||
      visaTypeLower.includes('tourism') ||
      visaTypeLower.includes('visit')
    ) {
      return 'tourist'
    }
    if (visaTypeLower.includes('business')) {
      return 'business'
    }
    if (visaTypeLower.includes('transit')) {
      return 'transit'
    }
    if (
      visaTypeLower.includes('student') ||
      visaTypeLower.includes('education')
    ) {
      return 'student'
    }
    if (
      visaTypeLower.includes('work') ||
      visaTypeLower.includes('employment')
    ) {
      return 'work'
    }
    if (visaTypeLower.includes('medical') || visaTypeLower.includes('health')) {
      return 'medical'
    }

    // Default to business if no match found
    return 'business'
  }

  // Function to generate visa URL for Visa Plan CTA (quotation link)
  const generateVisaPlanUrl = (
    visaId: string,
    countryName?: string,
    purpose?: string
  ) => {
    // URL format: /quotation/{country}-{visaId}?purpose={purpose}
    if (countryName && visaId) {
      const countrySlug = countryName.toLowerCase().replace(/\s+/g, '-')
      const purposeParam = purpose
        ? `?purpose=${encodeURIComponent(purpose)}`
        : ''
      return `/quotation/${countrySlug}-${visaId}${purposeParam}`
    }
    return '/select-plan'
  }

  // Function to generate visa URL using country name (for other CTAs)
  const generateVisaUrl = (visaId: string, countryName?: string) => {
    // URL format: /select-plan?country={CountryName}
    if (countryName) {
      // Capitalize first letter of each word
      const formattedCountry = countryName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      return `/select-plan?country=${encodeURIComponent(formattedCountry)}`
    }
    return '/select-plan'
  }

  // Handle visa selection for Header CTA
  const handleHeaderCTAVisaSelect = (visaId: string) => {
    const visa = getVisaDetails(visaId)
    if (!visa) return

    setFormData(prev => ({
      ...prev,
      headerCTA: {
        ...prev.headerCTA,
        selectedVisaId: visaId,
        selectedVisaName: visa.country || visa.name,
        buttonLink: generateVisaUrl(visaId, visa.country || visa.name),
        title:
          prev.headerCTA?.title ||
          `Ready to Start Your ${visa.country || visa.name} Visa Application?`,
        buttonText: prev.headerCTA?.buttonText || 'Start Visa Application',
        isActive: prev.headerCTA?.isActive ?? true,
      },
    }))
  }

  // Handle visa selection for Visa Plan CTA
  const handleVisaPlanCTAVisaSelect = (visaId: string) => {
    const visa = getVisaDetails(visaId)
    if (!visa) return

    const countryName = visa.country || visa.name
    // Auto-detect purpose from visaType, or use existing purpose if already set
    const autoDetectedPurpose = extractPurposeFromVisaType(visa.visaType || '')
    const purpose = formData.visaPlanCTA?.purpose || autoDetectedPurpose

    setFormData(prev => ({
      ...prev,
      visaPlanCTA: {
        ...prev.visaPlanCTA,
        selectedVisaId: visaId,
        selectedVisaName: countryName,
        purpose: purpose, // Use auto-detected purpose
        buttonLink: generateVisaPlanUrl(visaId, countryName, purpose),
        title:
          prev.visaPlanCTA?.title || `Choose Your ${countryName} Visa Plan`,
        description:
          prev.visaPlanCTA?.description ||
          'Get your visa processed quickly and efficiently',
        processingTime:
          visa.processingTimeValue || visa.processingTimeDays
            ? `${visa.processingTimeDays || visa.processingTimeValue} Days`
            : '3-5 Days',
        price: visa.adultPrice
          ? `Starting at ${currencySymbol}${visa.adultPrice}`
          : `Starting at ${currencySymbol}99`,
        buttonText: prev.visaPlanCTA?.buttonText || 'Apply Now',
        badgeText: prev.visaPlanCTA?.badgeText || 'Popular',
        isActive: prev.visaPlanCTA?.isActive ?? true,
      },
      footerCTA: {
        ...prev.footerCTA,
        selectedVisaId: visaId,
        selectedVisaName: visa.country || visa.name,
        buttonLink: generateVisaUrl(visaId, visa.country || visa.name),
        title:
          prev.footerCTA?.title ||
          `Ready to Apply for Your ${visa.country || visa.name} Visa?`,
        description:
          prev.footerCTA?.description ||
          'Get expert assistance with your visa application. Our team is here to help you every step of the way.',
        buttonText: prev.footerCTA?.buttonText || 'Start Application',
        isActive: prev.footerCTA?.isActive ?? true,
      },
    }))
  }

  // Handle visa selection for Footer CTA
  const handleFooterCTAVisaSelect = (visaId: string) => {
    const visa = getVisaDetails(visaId)
    if (!visa) return

    setFormData(prev => ({
      ...prev,
      footerCTA: {
        ...prev.footerCTA,
        selectedVisaId: visaId,
        selectedVisaName: visa.country || visa.name,
        buttonLink: generateVisaUrl(visaId, visa.country || visa.name),
        title:
          prev.footerCTA?.title ||
          `Ready to Apply for Your ${visa.country || visa.name} Visa?`,
        description:
          prev.footerCTA?.description ||
          'Get expert assistance with your visa application. Our team is here to help you every step of the way.',
        buttonText: prev.footerCTA?.buttonText || 'Start Application',
        isActive: prev.footerCTA?.isActive ?? true,
      },
    }))
  }

  const handleInputChange = (field: keyof BlogFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // File upload handlers
  const handleFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Directly trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      console.error('File input ref is not available')
    }
  }

  // Shared function to process file upload
  const processFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPEG, JPG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    setUploadedFile(file)

    try {
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'blog-images')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Handle both response formats: result.image.url or result.data.url
      const imageUrl = result.image?.url || result.data?.url

      if (result.success && imageUrl) {
        // Clear blob URL
        URL.revokeObjectURL(previewUrl)

        // Set the Cloudinary URL
        setFormData(prev => ({ ...prev, featuredImage: imageUrl }))
        setImagePreview(imageUrl)
        alert('Image uploaded successfully!')
      } else {
        throw new Error(result.error || 'Upload failed - no image URL received')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setUploadedFile(null)
      setImagePreview('')
    } finally {
      setIsUploadingImage(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFileUpload(file)
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    await processFileUpload(file)
  }

  const handleImageUrlChange = (url: string) => {
    // Clear previous blob URL if exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    const trimmedUrl = url.trim()
    setFormData(prev => ({ ...prev, featuredImage: trimmedUrl }))
    setImagePreview(trimmedUrl)
  }

  const clearImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setUploadedFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, featuredImage: '' }))
  }

  const handleSave = async (status?: 'draft' | 'published') => {
    setIsLoading(true)

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.content ||
        !formData.excerpt ||
        !formData.author
      ) {
        alert('Please fill in title, excerpt, content, and author fields')
        return
      }

      const blogData = {
        ...formData,
        status: status || formData.status,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
      }

      const response = await fetch(`/api/admin/blog/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (response.ok) {
        alert(
          `Blog ${status || formData.status === 'published' ? 'published' : 'updated'} successfully!`
        )
        router.push('/admin/blog')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog')
      }
    } catch (error: any) {
      console.error('Error updating blog:', error)
      alert(error.message || 'Error updating blog. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/blog/${blogId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Blog deleted successfully!')
        router.push('/admin/blog')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog')
      }
    } catch (error: any) {
      console.error('Error deleting blog:', error)
      alert(error.message || 'Error deleting blog. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blog">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Blog Post</h1>
              <p className="text-blue-100 mt-2">Update your blog content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white/10 border-white/20 text-white"
            >
              {originalData?.status || 'draft'}
            </Badge>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-600/10 border-red-400/20 text-red-100 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the blog post "{originalData?.title}" and remove all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete Blog'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={isLoading}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Update & Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Blog Post Editor
            </CardTitle>
            <CardDescription>
              Update your blog content and settings
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="ctas">CTAs</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Blog Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter blog title..."
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="blog-url-slug"
                      value={formData.slug}
                      onChange={e => handleInputChange('slug', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description of your blog post..."
                    rows={3}
                    value={formData.excerpt}
                    onChange={e => handleInputChange('excerpt', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={content => handleInputChange('content', content)}
                    placeholder="Start writing your blog content..."
                    className="min-h-[400px]"
                  />
                  <p className="text-sm text-gray-500">
                    Use the toolbar above to format your content. No need to
                    write HTML tags manually!
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                {/* Featured Image Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Featured Image
                  </Label>

                  {/* Input Method Toggle */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        imageInputMethod === 'url' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setImageInputMethod('url')}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={
                        imageInputMethod === 'upload' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setImageInputMethod('upload')}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>

                  {/* URL Input */}
                  {imageInputMethod === 'url' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/image.jpg or /placeholder.svg?height=400&width=600&text=Blog+Image"
                        value={formData.featuredImage}
                        onChange={e => handleImageUrlChange(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        Enter the URL of your featured image or use placeholder
                        format
                      </p>
                    </div>
                  )}

                  {/* Alt Tag Input */}
                  <div className="space-y-2">
                    <Label htmlFor="featuredImageAlt">Alt Tag Content</Label>
                    <Input
                      id="featuredImageAlt"
                      placeholder="e.g. Someone applying for a visa at an embassy"
                      value={formData.featuredImageAlt}
                      onChange={e =>
                        handleInputChange('featuredImageAlt', e.target.value)
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Describe the image for accessibility and SEO
                    </p>
                  </div>

                  {/* File Upload */}
                  {imageInputMethod === 'upload' && (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        tabIndex={-1}
                      />
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={e => {
                          // Only trigger file picker if clicking on the drop zone itself, not on buttons
                          if (
                            e.target === e.currentTarget ||
                            (e.target as HTMLElement).closest(
                              '.drop-zone-click'
                            )
                          ) {
                            handleFileUpload(e as any)
                          }
                        }}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        } ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-600">
                              Uploading image...
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {isDragging
                                ? 'Drop your image here'
                                : 'Drag and drop an image here'}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">or</p>
                            {/* <Button
                              type="button"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileUpload(e)
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Choose Image File
                            </Button> */}
                            <p className="text-xs text-gray-500 mt-4">
                              PNG, JPEG, JPG, GIF, WebP - Max 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {(formData.featuredImage || imagePreview) && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Preview</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearImage}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          key={imagePreview || formData.featuredImage}
                          src={
                            imagePreview ||
                            formData.featuredImage ||
                            '/placeholder.svg'
                          }
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                          onError={e => {
                            const target = e.currentTarget
                            const currentSrc = target.src
                            // Only show error placeholder if it's not already the error placeholder
                            if (
                              !currentSrc.includes('placeholder.svg') &&
                              !currentSrc.includes('Image+Not+Found')
                            ) {
                              target.src =
                                '/placeholder.svg?height=400&width=600&text=Image+Not+Found'
                            }
                          }}
                          onLoad={() => {
                            console.log(
                              'Image preview loaded successfully:',
                              imagePreview || formData.featuredImage
                            )
                          }}
                        />
                      </div>
                      {uploadedFile && (
                        <p className="text-xs text-gray-500 mt-2">
                          File: {uploadedFile.name} (
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {!uploadedFile &&
                        (imagePreview || formData.featuredImage) && (
                          <p className="text-xs text-gray-500 mt-2">
                            Image URL: {imagePreview || formData.featuredImage}
                          </p>
                        )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Select
                    value={formData.author}
                    onValueChange={value => {
                      if (value === 'add-new') {
                        router.push('/admin/blog/config')
                      } else {
                        handleInputChange('author', value)
                      }
                    }}
                    disabled={loadingAuthors}
                  >
                    <SelectTrigger id="author">
                      <SelectValue
                        placeholder={
                          loadingAuthors
                            ? 'Loading authors...'
                            : 'Select an author'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.length > 0 ? (
                        authors.map(author => (
                          <SelectItem
                            key={author._id || author.name}
                            value={author.name}
                          >
                            <div className="flex items-center gap-2">
                              {author.profileImage && (
                                <img
                                  src={author.profileImage}
                                  alt={author.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={e => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              <span>{author.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="add-new">
                          <div className="flex items-center gap-2 text-blue-600">
                            <span>+</span>
                            <span>Add New Author</span>
                          </div>
                        </SelectItem>
                      )}
                      <SelectItem value="add-new">
                        <div className="flex items-center gap-2 text-blue-600">
                          <span>+</span>
                          <span>Add New Author</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.author &&
                    authors.find(a => a.name === formData.author) && (
                      <p className="text-sm text-gray-500 mt-1">
                        Selected: {formData.author}
                      </p>
                    )}
                  {authors.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No authors configured.{' '}
                      <Link
                        href="/admin/blog/config"
                        className="text-blue-600 hover:underline"
                      >
                        Add authors in Blog Configuration
                      </Link>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(
                        value: 'draft' | 'published' | 'archived'
                      ) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value => {
                        if (value === 'add-new') {
                          router.push('/admin/blog/config?tab=categories')
                        } else {
                          handleInputChange('category', value)
                        }
                      }}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingCategories
                              ? 'Loading categories...'
                              : 'Select category'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories || []).length > 0 ? (
                          categories.map(category => (
                            <SelectItem
                              key={category._id || category.slug}
                              value={category.name}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="add-new">
                            <div className="flex items-center gap-2 text-blue-600">
                              <span>+</span>
                              <span>Add New Category</span>
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="add-new">
                          <div className="flex items-center gap-2 text-blue-600">
                            <span>+</span>
                            <span>Add New Category</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={formData.tags}
                      onChange={e => handleInputChange('tags', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ctas" className="space-y-6 mt-6">
                <div className="space-y-6">
                  {/* Header CTA Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Header CTA</CardTitle>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.headerCTA?.isActive || false}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                headerCTA: {
                                  ...prev.headerCTA,
                                  isActive: e.target.checked,
                                },
                              }))
                            }
                            className="rounded"
                          />
                          <Label>Enable</Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Select Visa (Optional)</Label>
                        <Select
                          value={formData.headerCTA?.selectedVisaId || ''}
                          onValueChange={handleHeaderCTAVisaSelect}
                          disabled={loadingVisas}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingVisas
                                  ? 'Loading visas...'
                                  : 'Choose a visa to auto-fill details'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {visas.map(visa => (
                              <SelectItem key={visa._id} value={visa._id}>
                                {visa.country} - {visa.visaType || 'Visa'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.headerCTA?.selectedVisaName && (
                          <p className="text-sm text-green-600 mt-1">
                            Selected: {formData.headerCTA.selectedVisaName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={formData.headerCTA?.title || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              headerCTA: {
                                ...prev.headerCTA,
                                title: e.target.value,
                              },
                            }))
                          }
                          placeholder="Ready to Start Your Visa Application?"
                        />
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={formData.headerCTA?.buttonText || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              headerCTA: {
                                ...prev.headerCTA,
                                buttonText: e.target.value,
                              },
                            }))
                          }
                          placeholder="Start Visa Application"
                        />
                      </div>
                      <div>
                        <Label>Button Link</Label>
                        <Input
                          value={formData.headerCTA?.buttonLink || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              headerCTA: {
                                ...prev.headerCTA,
                                buttonLink: e.target.value,
                              },
                            }))
                          }
                          placeholder="/select-plan?country=France"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated when visa is selected
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Travelers Text</Label>
                          <Input
                            value={formData.headerCTA?.travelersText || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                headerCTA: {
                                  ...prev.headerCTA,
                                  travelersText: e.target.value,
                                },
                              }))
                            }
                            placeholder="Join 1,50,000+ Travelers"
                          />
                        </div>
                        <div>
                          <Label>Trust Text</Label>
                          <Input
                            value={formData.headerCTA?.trustText || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                headerCTA: {
                                  ...prev.headerCTA,
                                  trustText: e.target.value,
                                },
                              }))
                            }
                            placeholder="who trust our guide."
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Traveler Images (3 URLs, one per line)</Label>
                        <Textarea
                          value={(
                            formData.headerCTA?.travelerImages || []
                          ).join('\n')}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              headerCTA: {
                                ...prev.headerCTA,
                                travelerImages: e.target.value
                                  .split('\n')
                                  .filter(url => url.trim()),
                              },
                            }))
                          }
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visa Plan CTA Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Visa Plan CTA</CardTitle>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.visaPlanCTA?.isActive || false}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  isActive: e.target.checked,
                                },
                              }))
                            }
                            className="rounded"
                          />
                          <Label>Enable</Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>
                          Select Visa (Optional - Auto-fills plan details)
                        </Label>
                        <Select
                          value={formData.visaPlanCTA?.selectedVisaId || ''}
                          onValueChange={handleVisaPlanCTAVisaSelect}
                          disabled={loadingVisas}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingVisas
                                  ? 'Loading visas...'
                                  : 'Choose a visa to auto-fill details'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {visas.map(visa => (
                              <SelectItem key={visa._id} value={visa._id}>
                                {visa.country} - {visa.visaType || 'Visa'} (
                                {currencySymbol}
                                {visa.adultPrice || 'N/A'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.visaPlanCTA?.selectedVisaName && (
                          <p className="text-sm text-green-600 mt-1">
                            Selected: {formData.visaPlanCTA.selectedVisaName} -
                            Purpose:{' '}
                            {formData.visaPlanCTA.purpose || 'business'}{' '}
                            (auto-detected from visa type) - Details auto-filled
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Badge Text</Label>
                          <Input
                            value={formData.visaPlanCTA?.badgeText || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  badgeText: e.target.value,
                                },
                              }))
                            }
                            placeholder="Popular"
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={formData.visaPlanCTA?.title || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  title: e.target.value,
                                },
                              }))
                            }
                            placeholder="Choose Your Visa Plan"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.visaPlanCTA?.description || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              visaPlanCTA: {
                                ...prev.visaPlanCTA,
                                description: e.target.value,
                              },
                            }))
                          }
                          placeholder="Get your visa processed quickly and efficiently"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Processing Time</Label>
                          <Input
                            value={formData.visaPlanCTA?.processingTime || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  processingTime: e.target.value,
                                },
                              }))
                            }
                            placeholder="3-5 Days"
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            value={formData.visaPlanCTA?.price || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  price: e.target.value,
                                },
                              }))
                            }
                            placeholder={`Starting at ${currencySymbol}99`}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={formData.visaPlanCTA?.buttonText || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              visaPlanCTA: {
                                ...prev.visaPlanCTA,
                                buttonText: e.target.value,
                              },
                            }))
                          }
                          placeholder="Apply Now"
                        />
                      </div>
                      <div>
                        <Label>Button Link</Label>
                        <Input
                          value={formData.visaPlanCTA?.buttonLink || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              visaPlanCTA: {
                                ...prev.visaPlanCTA,
                                buttonLink: e.target.value,
                              },
                            }))
                          }
                          placeholder="/quotation/france-{visaId}?purpose=business"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated when visa and purpose are selected.
                          Format: /quotation/{'{country}'}-{'{visaId}'}?purpose=
                          {'{purpose}'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>WhatsApp Link</Label>
                          <Input
                            value={formData.visaPlanCTA?.whatsappLink || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  whatsappLink: e.target.value,
                                },
                              }))
                            }
                            placeholder="https://wa.me/1234567890"
                          />
                        </div>
                        <div>
                          <Label>Phone Link</Label>
                          <Input
                            value={formData.visaPlanCTA?.phoneLink || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                visaPlanCTA: {
                                  ...prev.visaPlanCTA,
                                  phoneLink: e.target.value,
                                },
                              }))
                            }
                            placeholder="tel:+1234567890"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Footer CTA Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Footer CTA</CardTitle>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.footerCTA?.isActive || false}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                footerCTA: {
                                  ...prev.footerCTA,
                                  isActive: e.target.checked,
                                },
                              }))
                            }
                            className="rounded"
                          />
                          <Label>Enable</Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Select Visa (Optional)</Label>
                        <Select
                          value={formData.footerCTA?.selectedVisaId || ''}
                          onValueChange={handleFooterCTAVisaSelect}
                          disabled={loadingVisas}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingVisas
                                  ? 'Loading visas...'
                                  : 'Choose a visa to auto-fill details'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {visas.map(visa => (
                              <SelectItem key={visa._id} value={visa._id}>
                                {visa.country} - {visa.visaType || 'Visa'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.footerCTA?.selectedVisaName && (
                          <p className="text-sm text-green-600 mt-1">
                            Selected: {formData.footerCTA.selectedVisaName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={formData.footerCTA?.title || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              footerCTA: {
                                ...prev.footerCTA,
                                title: e.target.value,
                              },
                            }))
                          }
                          placeholder="Ready to Apply for Your Visa?"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.footerCTA?.description || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              footerCTA: {
                                ...prev.footerCTA,
                                description: e.target.value,
                              },
                            }))
                          }
                          placeholder="Get expert assistance with your visa application..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={formData.footerCTA?.buttonText || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              footerCTA: {
                                ...prev.footerCTA,
                                buttonText: e.target.value,
                              },
                            }))
                          }
                          placeholder="Start Application"
                        />
                      </div>
                      <div>
                        <Label>Button Link</Label>
                        <Input
                          value={formData.footerCTA?.buttonLink || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              footerCTA: {
                                ...prev.footerCTA,
                                buttonLink: e.target.value,
                              },
                            }))
                          }
                          placeholder="/select-plan?country=France"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated when visa is selected
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO optimized title..."
                    value={formData.metaTitle}
                    onChange={e =>
                      handleInputChange('metaTitle', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search engines..."
                    rows={3}
                    value={formData.metaDescription}
                    onChange={e =>
                      handleInputChange('metaDescription', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.metaKeywords}
                    onChange={e =>
                      handleInputChange('metaKeywords', e.target.value)
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
