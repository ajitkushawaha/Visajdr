'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, Upload, FileText, X, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface AddTravelerModalProps {
  onSuccess: () => void
  traveler?: any
  trigger?: React.ReactNode
}

export function AddTravelerModal({
  onSuccess,
  traveler,
  trigger,
}: AddTravelerModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const initialFormState = {
    relation: 'Friend',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      occupation: '',
      gender: 'male',
    },
    documents: {
      passportFront: null as any,
      passportBack: null as any,
      photo: null as any,
    },
  }

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    if (open && traveler) {
      setFormData({
        relation: traveler.relation || 'Friend',
        personalInfo: {
          firstName: traveler.personalInfo?.firstName || '',
          lastName: traveler.personalInfo?.lastName || '',
          email: traveler.personalInfo?.email || '',
          phone: traveler.personalInfo?.phone || '',
          nationality: traveler.personalInfo?.nationality || '',
          passportNumber: traveler.personalInfo?.passportNumber || '',
          passportExpiry: traveler.personalInfo?.passportExpiry
            ? new Date(traveler.personalInfo.passportExpiry)
                .toISOString()
                .split('T')[0]
            : '',
          occupation: traveler.personalInfo?.occupation || '',
          gender: traveler.personalInfo?.gender || 'male',
        },
        documents: {
          passportFront: traveler.documents?.passportFront || null,
          passportBack: traveler.documents?.passportBack || null,
          photo: traveler.documents?.photo || null,
        },
      })
    } else if (open && !traveler) {
      setFormData(initialFormState)
    }
  }, [open, traveler])

  const handleChange = (field: string, value: string) => {
    if (field === 'relation') {
      setFormData(prev => ({ ...prev, relation: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value },
      }))
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'passportFront' | 'passportBack' | 'photo'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })
      const result = await res.json()

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [field]: result.file,
          },
        }))
        toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} uploaded`)
      } else {
        toast.error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload error')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (field: 'passportFront' | 'passportBack' | 'photo') => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: null,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = traveler
        ? `/api/user/travelers/${traveler._id}`
        : '/api/user/travelers'

      const method = traveler ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          traveler
            ? 'Traveler updated successfully'
            : 'Traveler added successfully'
        )
        setOpen(false)
        onSuccess()
        if (!traveler) {
          setFormData(initialFormState)
        }
      } else {
        toast.error(
          data.error ||
            (traveler ? 'Failed to update traveler' : 'Failed to add traveler')
        )
      }
    } catch (error) {
      console.error('Error saving traveler:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderFilePreview = (
    file: any,
    field: 'passportFront' | 'passportBack' | 'photo'
  ) => {
    if (!file) return null

    // Handle both string paths and file objects
    const fileName =
      typeof file === 'string'
        ? file.split('/').pop()
        : file.originalName || 'Document'

    return (
      <div className="relative group">
        <div className="flex items-center gap-2 text-sm text-green-600 justify-center">
          <FileText className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{fileName}</span>
        </div>
        <button
          type="button"
          onClick={() => removeFile(field)}
          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Traveler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {traveler ? 'Edit Traveler' : 'Add New Traveler'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">
              Personal Information
            </h4>
            <div className="space-y-2">
              <Label>Relation to You</Label>
              <Select
                value={formData.relation}
                onValueChange={val => handleChange('relation', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  required
                  placeholder="Given name"
                  value={formData.personalInfo.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  required
                  placeholder="Surname"
                  value={formData.personalInfo.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.personalInfo.gender}
                  onValueChange={val => handleChange('gender', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input
                  placeholder="e.g. Indian"
                  value={formData.personalInfo.nationality}
                  onChange={e => handleChange('nationality', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input
                placeholder="Occupation"
                value={formData.personalInfo.occupation}
                onChange={e => handleChange('occupation', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passport Number</Label>
                <Input
                  required
                  placeholder="Passport Number"
                  value={formData.personalInfo.passportNumber}
                  onChange={e => handleChange('passportNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Passport Expiry</Label>
                <Input
                  required
                  type="date"
                  placeholder="Expiry Date"
                  value={formData.personalInfo.passportExpiry}
                  onChange={e => handleChange('passportExpiry', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  placeholder="Email address"
                  value={formData.personalInfo.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={formData.personalInfo.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">
              Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Passport Front */}
              <div className="space-y-2">
                <Label>Passport Front</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                  {formData.documents.passportFront ? (
                    renderFilePreview(
                      formData.documents.passportFront,
                      'passportFront'
                    )
                  ) : (
                    <label className="cursor-pointer block">
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={e => handleFileUpload(e, 'passportFront')}
                        disabled={uploading}
                      />
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">
                        Click to upload
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Passport Back */}
              <div className="space-y-2">
                <Label>Passport Back</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                  {formData.documents.passportBack ? (
                    renderFilePreview(
                      formData.documents.passportBack,
                      'passportBack'
                    )
                  ) : (
                    <label className="cursor-pointer block">
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={e => handleFileUpload(e, 'passportBack')}
                        disabled={uploading}
                      />
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">
                        Click to upload
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Passport Size Photo */}
              <div className="space-y-2">
                <Label>Passport Size Photo</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                  {formData.documents.photo ? (
                    renderFilePreview(formData.documents.photo, 'photo')
                  ) : (
                    <label className="cursor-pointer block">
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'photo')}
                        disabled={uploading}
                      />
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">
                        Click to upload
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="bg-brand-primary"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {traveler ? 'Update Traveler' : 'Save Traveler'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
