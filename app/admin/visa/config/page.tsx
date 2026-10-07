// app/admin/visa/config/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface ConfigItem {
  _id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface DocumentType extends ConfigItem {
  displayName: string
  isRequired: boolean
  exampleImage?: string
  exampleLink?: string
}

interface ConfigData {
  visaTypes: ConfigItem[]
  documentTypes: DocumentType[]
  visaCategories: ConfigItem[]
  processingTimeTypes: ConfigItem[]
  occupancyTypes: ConfigItem[]
}

export default function VisaConfigPage() {
  const [configData, setConfigData] = useState<ConfigData>({
    visaTypes: [],
    documentTypes: [],
    visaCategories: [],
    processingTimeTypes: [],
    occupancyTypes: [],
  })
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('visaTypes')
  const [uploadedImages, setUploadedImages] = useState<{
    [key: string]: string
  }>({})
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({})
  const [imageInputType, setImageInputType] = useState<{
    [key: string]: 'url' | 'upload'
  }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exampleImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchConfigData()
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(uploadedImages).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  // Helper function to handle image file selection
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImageFiles(prev => ({ ...prev, [fieldName]: file }))
      setUploadedImages(prev => ({ ...prev, [fieldName]: previewUrl }))
    }
  }

  // Helper function to remove selected image
  const handleImageRemove = (fieldName: string) => {
    setImageFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[fieldName]
      return newFiles
    })
    setUploadedImages(prev => {
      const newImages = { ...prev }
      if (newImages[fieldName]) {
        URL.revokeObjectURL(newImages[fieldName])
        delete newImages[fieldName]
      }
      return newImages
    })
  }

  // Helper function to upload image to Cloudinary
  const uploadImageToServer = async (file: File): Promise<string> => {
    const uploadToast = toast.loading('Uploading image to Cloudinary...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'visa-type-icons') // Folder for visa type images

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Return Cloudinary URL
      const imageUrl = result.image?.url || result.data?.url
      if (result.success && imageUrl) {
        toast.success('Image uploaded successfully!', { id: uploadToast })
        return imageUrl
      } else {
        throw new Error('Upload failed - no image URL received')
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload image. Please try again.',
        { id: uploadToast }
      )
      throw error
    }
  }

  const fetchConfigData = async () => {
    try {
      const response = await fetch('/api/admin/visa-config')
      const result = await response.json()

      if (result.success) {
        setConfigData(result.data)
      } else {
        toast.error('Failed to fetch configuration data')
      }
    } catch (error) {
      console.error('Error fetching config data:', error)
      toast.error('Error fetching configuration data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (type: string, data: any) => {
    try {
      // Handle image upload if user selected upload option and has a file
      if (
        type === 'visaTypes' &&
        imageInputType['create-image'] === 'upload' &&
        imageFiles['create-image']
      ) {
        const imageUrl = await uploadImageToServer(imageFiles['create-image'])
        data.image = imageUrl
        // Clear the uploaded image state
        handleImageRemove('create-image')
      }
      // If user selected URL option, the data.image is already set from the form input

      // Handle example image upload for document types
      if (
        type === 'documentTypes' &&
        imageInputType['create-exampleImage'] === 'upload' &&
        imageFiles['create-exampleImage']
      ) {
        const imageUrl = await uploadImageToServer(
          imageFiles['create-exampleImage']
        )
        data.exampleImage = imageUrl
        // Clear the uploaded image state
        handleImageRemove('create-exampleImage')
      }
      // If user selected URL option for example image, the data.exampleImage is already set from the form input

      const response = await fetch('/api/admin/visa-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${type} created successfully`)
        fetchConfigData()
        setIsCreating(false)
        // Reset image input type
        setImageInputType(prev => ({
          ...prev,
          'create-image': 'url',
          'create-exampleImage': 'url',
        }))
      } else {
        toast.error(result.error || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Error creating item')
    }
  }

  const handleUpdate = async (type: string, id: string, data: any) => {
    try {
      // Handle image upload if user selected upload option and has a file
      if (
        type === 'visaTypes' &&
        imageInputType['edit-image'] === 'upload' &&
        imageFiles['edit-image']
      ) {
        const imageUrl = await uploadImageToServer(imageFiles['edit-image'])
        data.image = imageUrl
        // Clear the uploaded image state
        handleImageRemove('edit-image')
      }
      // If user selected URL option, the data.image is already set from the form input

      // Handle example image upload for document types
      if (
        type === 'documentTypes' &&
        imageInputType['edit-exampleImage'] === 'upload' &&
        imageFiles['edit-exampleImage']
      ) {
        const imageUrl = await uploadImageToServer(
          imageFiles['edit-exampleImage']
        )
        data.exampleImage = imageUrl
        // Clear the uploaded image state
        handleImageRemove('edit-exampleImage')
      }
      // If user selected URL option for example image, the data.exampleImage is already set from the form input

      const response = await fetch(`/api/admin/visa-config/${type}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${type} updated successfully`)
        fetchConfigData()
        setEditingItem(null)
        // Reset image input type
        setImageInputType(prev => ({ ...prev, 'edit-image': 'url' }))
      } else {
        toast.error(result.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Error updating item')
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/visa-config/${type}/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${type} deleted successfully`)
        fetchConfigData()
      } else {
        toast.error(result.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Error deleting item')
    }
  }

  // Reset image input type when opening edit modal
  const openEditModal = (item: ConfigItem) => {
    setEditingItem(item)
    setImageInputType(prev => ({
      ...prev,
      'edit-image': 'url',
      'edit-exampleImage': (item as DocumentType).exampleImage ? 'url' : 'url',
    }))
  }

  const renderConfigList = (items: ConfigItem[], type: string) => (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item._id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{item.name}</h3>
                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {type === 'documentTypes' &&
                  (item as DocumentType).isRequired && (
                    <Badge variant="destructive">Required</Badge>
                  )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Slug: {item.slug}</span>
                <span>Order: {item.order}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(item)}
                className="text-gray-700 hover:text-gray-900"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(type, item._id)}
                className="text-gray-700 hover:text-gray-900"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderEditModal = () => {
    if (!editingItem) return null

    const isDocumentType = activeTab === 'documentTypes'
    const isVisaType = activeTab === 'visaTypes'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>
              Edit{' '}
              {activeTab
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())}
            </CardTitle>
            <CardDescription>
              Update the configuration item details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => {
                e.preventDefault()
                const formData = new FormData(
                  e.currentTarget as HTMLFormElement
                )
                const data = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  isActive: formData.get('isActive') === 'on',
                  order: parseInt(formData.get('order') as string) || 0,
                  ...(isDocumentType && {
                    displayName: formData.get('displayName') as string,
                    isRequired: formData.get('isRequired') === 'on',
                    exampleImage:
                      imageInputType['edit-exampleImage'] === 'upload'
                        ? '' // Will be set from uploaded file in handleUpdate
                        : (formData.get('exampleImage') as string) || '',
                    exampleLink: (formData.get('exampleLink') as string) || '',
                  }),
                  ...(isVisaType && {
                    image:
                      imageInputType['edit-image'] === 'upload'
                        ? '' // Will be set from uploaded file in handleUpdate
                        : (formData.get('image') as string) || '',
                    icon: formData.get('icon') as string,
                  }),
                }
                handleUpdate(activeTab, editingItem._id, data)
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingItem.name}
                    required
                  />
                </div>
                {isDocumentType && (
                  <div>
                    <Label htmlFor="edit-displayName">Display Name *</Label>
                    <Input
                      id="edit-displayName"
                      name="displayName"
                      defaultValue={(editingItem as DocumentType).displayName}
                      required
                    />
                  </div>
                )}
                {isVisaType && (
                  <>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-image">Image</Label>
                      <div className="space-y-3">
                        {/* Input Type Selection */}
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-image-url"
                              name="edit-image-type"
                              value="url"
                              checked={
                                imageInputType['edit-image'] === 'url' ||
                                !imageInputType['edit-image']
                              }
                              onChange={() =>
                                setImageInputType(prev => ({
                                  ...prev,
                                  'edit-image': 'url',
                                }))
                              }
                              className="w-4 h-4"
                            />
                            <Label htmlFor="edit-image-url" className="text-sm">
                              Image URL
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-image-upload"
                              name="edit-image-type"
                              value="upload"
                              checked={
                                imageInputType['edit-image'] === 'upload'
                              }
                              onChange={() =>
                                setImageInputType(prev => ({
                                  ...prev,
                                  'edit-image': 'upload',
                                }))
                              }
                              className="w-4 h-4"
                            />
                            <Label
                              htmlFor="edit-image-upload"
                              className="text-sm"
                            >
                              Upload File
                            </Label>
                          </div>
                        </div>

                        {/* URL Input */}
                        {imageInputType['edit-image'] === 'url' && (
                          <Input
                            id="edit-image"
                            name="image"
                            defaultValue={(editingItem as any).image || ''}
                            placeholder="https://example.com/image.svg"
                            className="w-full"
                          />
                        )}

                        {/* File Upload */}
                        {imageInputType['edit-image'] === 'upload' && (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full text-gray-700 hover:text-gray-900"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image File
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageSelect(e, 'edit-image')}
                            />
                            {uploadedImages['edit-image'] && (
                              <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 flex-1">
                                  Image selected
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleImageRemove('edit-image')
                                  }
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-icon">Icon URL/Class</Label>
                      <Input
                        id="edit-icon"
                        name="icon"
                        defaultValue={(editingItem as any).icon || ''}
                        placeholder="https://example.com/icon.svg or lucide-icon-name"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="edit-order">Order</Label>
                  <Input
                    id="edit-order"
                    name="order"
                    type="number"
                    defaultValue={editingItem.order}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isActive"
                      name="isActive"
                      defaultChecked={editingItem.isActive}
                    />
                    <Label htmlFor="edit-isActive">Active</Label>
                  </div>
                  {isDocumentType && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-isRequired"
                        name="isRequired"
                        defaultChecked={
                          (editingItem as DocumentType).isRequired
                        }
                      />
                      <Label htmlFor="edit-isRequired">Required</Label>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={editingItem.description || ''}
                />
              </div>
              {isDocumentType && (
                <>
                  <div className="mt-4">
                    <Label htmlFor="edit-exampleImage">Example Image</Label>
                    <div className="space-y-3">
                      {/* Input Type Selection */}
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="edit-exampleImage-url"
                            name="edit-exampleImage-type"
                            value="url"
                            checked={
                              imageInputType['edit-exampleImage'] === 'url' ||
                              !imageInputType['edit-exampleImage']
                            }
                            onChange={() =>
                              setImageInputType(prev => ({
                                ...prev,
                                'edit-exampleImage': 'url',
                              }))
                            }
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor="edit-exampleImage-url"
                            className="text-sm"
                          >
                            Image URL
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="edit-exampleImage-upload"
                            name="edit-exampleImage-type"
                            value="upload"
                            checked={
                              imageInputType['edit-exampleImage'] === 'upload'
                            }
                            onChange={() =>
                              setImageInputType(prev => ({
                                ...prev,
                                'edit-exampleImage': 'upload',
                              }))
                            }
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor="edit-exampleImage-upload"
                            className="text-sm"
                          >
                            Upload File
                          </Label>
                        </div>
                      </div>

                      {/* URL Input */}
                      {imageInputType['edit-exampleImage'] === 'url' && (
                        <div>
                          <Input
                            id="edit-exampleImage"
                            name="exampleImage"
                            type="url"
                            defaultValue={
                              (editingItem as DocumentType).exampleImage || ''
                            }
                            placeholder="https://example.com/passport-example.jpg"
                            className="w-full"
                          />
                          {(editingItem as DocumentType).exampleImage &&
                            !uploadedImages['edit-exampleImage'] && (
                              <div className="mt-2">
                                <img
                                  src={
                                    (editingItem as DocumentType).exampleImage
                                  }
                                  alt="Example"
                                  className="max-w-xs h-32 object-contain border rounded-lg p-2 bg-gray-50"
                                  onError={e => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      )}

                      {/* File Upload */}
                      {imageInputType['edit-exampleImage'] === 'upload' && (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              exampleImageInputRef.current?.click()
                            }
                            className="w-full text-gray-700 hover:text-gray-900"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image File
                          </Button>
                          <input
                            ref={exampleImageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e =>
                              handleImageSelect(e, 'edit-exampleImage')
                            }
                          />
                          {uploadedImages['edit-exampleImage'] && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 flex-1">
                                  Image selected
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleImageRemove('edit-exampleImage')
                                  }
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="mt-2">
                                <img
                                  src={uploadedImages['edit-exampleImage']}
                                  alt="Example Preview"
                                  className="max-w-xs h-32 object-contain border rounded-lg p-2 bg-gray-50"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload an example image to show users what this document
                      looks like
                    </p>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="edit-exampleLink">Example Link URL</Label>
                    <Input
                      id="edit-exampleLink"
                      name="exampleLink"
                      type="url"
                      defaultValue={
                        (editingItem as DocumentType).exampleLink || ''
                      }
                      placeholder="https://example.com/passport-guide"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Add a link to a guide or example page for this document
                    </p>
                  </div>
                </>
              )}
              <div className="flex gap-2 mt-4">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCreateForm = (type: string) => {
    const isDocumentType = type === 'documentTypes'
    const isVisaType = type === 'visaTypes'

    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">
          Create New{' '}
          {type
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())}
        </h3>
        <form
          onSubmit={e => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget as HTMLFormElement)
            const data = {
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              isActive: formData.get('isActive') === 'on',
              order: parseInt(formData.get('order') as string) || 0,
              ...(isDocumentType && {
                displayName: formData.get('displayName') as string,
                isRequired: formData.get('isRequired') === 'on',
                exampleImage:
                  imageInputType['create-exampleImage'] === 'upload'
                    ? '' // Will be set from uploaded file in handleCreate
                    : (formData.get('exampleImage') as string) || '',
                exampleLink: (formData.get('exampleLink') as string) || '',
              }),
              ...(isVisaType && {
                image:
                  imageInputType['create-image'] === 'upload'
                    ? '' // Will be set from uploaded file in handleCreate
                    : (formData.get('image') as string) || '',
                icon: formData.get('icon') as string,
              }),
            }
            handleCreate(type, data)
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            {isDocumentType && (
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input id="displayName" name="displayName" required />
              </div>
            )}
            {isVisaType && (
              <>
                <div className="md:col-span-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="space-y-3">
                    {/* Input Type Selection */}
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="create-image-url"
                          name="create-image-type"
                          value="url"
                          checked={
                            imageInputType['create-image'] === 'url' ||
                            !imageInputType['create-image']
                          }
                          onChange={() =>
                            setImageInputType(prev => ({
                              ...prev,
                              'create-image': 'url',
                            }))
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="create-image-url" className="text-sm">
                          Image URL
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="create-image-upload"
                          name="create-image-type"
                          value="upload"
                          checked={imageInputType['create-image'] === 'upload'}
                          onChange={() =>
                            setImageInputType(prev => ({
                              ...prev,
                              'create-image': 'upload',
                            }))
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="create-image-upload"
                          className="text-sm"
                        >
                          Upload File
                        </Label>
                      </div>
                    </div>

                    {/* URL Input */}
                    {imageInputType['create-image'] === 'url' && (
                      <Input
                        id="image"
                        name="image"
                        placeholder="https://example.com/image.svg"
                        className="w-full"
                      />
                    )}

                    {/* File Upload */}
                    {imageInputType['create-image'] === 'upload' && (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full text-gray-700 hover:text-gray-900"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageSelect(e, 'create-image')}
                        />
                        {uploadedImages['create-image'] && (
                          <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 flex-1">
                              Image selected
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleImageRemove('create-image')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="icon">Icon URL/Class</Label>
                  <Input
                    id="icon"
                    name="icon"
                    placeholder="https://example.com/icon.svg or lucide-icon-name"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="order">Order</Label>
              <Input id="order" name="order" type="number" defaultValue="0" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked />
                <Label htmlFor="isActive">Active</Label>
              </div>
              {isDocumentType && (
                <div className="flex items-center space-x-2">
                  <Switch id="isRequired" name="isRequired" />
                  <Label htmlFor="isRequired">Required</Label>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          {isDocumentType && (
            <>
              <div className="mt-4">
                <Label htmlFor="exampleImage">Example Image</Label>
                <div className="space-y-3">
                  {/* Input Type Selection */}
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="create-exampleImage-url"
                        name="create-exampleImage-type"
                        value="url"
                        checked={
                          imageInputType['create-exampleImage'] === 'url' ||
                          !imageInputType['create-exampleImage']
                        }
                        onChange={() =>
                          setImageInputType(prev => ({
                            ...prev,
                            'create-exampleImage': 'url',
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor="create-exampleImage-url"
                        className="text-sm"
                      >
                        Image URL
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="create-exampleImage-upload"
                        name="create-exampleImage-type"
                        value="upload"
                        checked={
                          imageInputType['create-exampleImage'] === 'upload'
                        }
                        onChange={() =>
                          setImageInputType(prev => ({
                            ...prev,
                            'create-exampleImage': 'upload',
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor="create-exampleImage-upload"
                        className="text-sm"
                      >
                        Upload File
                      </Label>
                    </div>
                  </div>

                  {/* URL Input */}
                  {imageInputType['create-exampleImage'] === 'url' && (
                    <Input
                      id="exampleImage"
                      name="exampleImage"
                      type="url"
                      placeholder="https://example.com/passport-example.jpg"
                      className="w-full"
                    />
                  )}

                  {/* File Upload */}
                  {imageInputType['create-exampleImage'] === 'upload' && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => exampleImageInputRef.current?.click()}
                        className="w-full text-gray-700 hover:text-gray-900"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image File
                      </Button>
                      <input
                        ref={exampleImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleImageSelect(e, 'create-exampleImage')
                        }
                      />
                      {uploadedImages['create-exampleImage'] && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 flex-1">
                              Image selected
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleImageRemove('create-exampleImage')
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-2">
                            <img
                              src={uploadedImages['create-exampleImage']}
                              alt="Example Preview"
                              className="max-w-xs h-32 object-contain border rounded-lg p-2 bg-gray-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload an example image to show users what this document looks
                  like
                </p>
              </div>
              <div className="mt-4">
                <Label htmlFor="exampleLink">Example Link URL</Label>
                <Input
                  id="exampleLink"
                  name="exampleLink"
                  type="url"
                  placeholder="https://example.com/passport-guide"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add a link to a guide or example page for this document
                </p>
              </div>
            </>
          )}
          <div className="flex gap-2 mt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Visa Configuration Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage visa types, document requirements, and other configurations
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visaTypes">Visa Types</TabsTrigger>
          <TabsTrigger value="documentTypes">Documents</TabsTrigger>
          <TabsTrigger value="visaCategories">Categories</TabsTrigger>
          <TabsTrigger value="processingTimeTypes">Processing Time</TabsTrigger>
          <TabsTrigger value="occupancyTypes">Occupancy</TabsTrigger>
        </TabsList>

        {Object.entries(configData).map(([key, items]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>

            {isCreating && renderCreateForm(key)}
            {renderConfigList(items, key)}
          </TabsContent>
        ))}
      </Tabs>

      {renderEditModal()}
    </div>
  )
}
