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
import { Loader2, Upload, FileText, X } from 'lucide-react'
import { toast } from 'sonner'

interface EditProfileModalProps {
  user: any
  type: 'personal' | 'address'
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function EditProfileModal({
  user,
  type,
  onSuccess,
  trigger,
}: EditProfileModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: '',
    nationality: '',
    occupation: '',
    passportDetails: {
      passportNumber: '',
      passportExpiry: '',
    },
    documents: {
      passportFront: null as any,
      passportBack: null as any,
      photo: null as any,
    },
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  })

  // Update form data when user prop changes or modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        occupation: user.occupation || '',
        passportDetails: {
          passportNumber: user.passportDetails?.passportNumber || '',
          passportExpiry: user.passportDetails?.passportExpiry
            ? new Date(user.passportDetails.passportExpiry)
                .toISOString()
                .split('T')[0]
            : '',
        },
        documents: {
          passportFront: user.documents?.passportFront || null,
          passportBack: user.documents?.passportBack || null,
          photo: user.documents?.photo || null,
        },
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zip: user.address?.zip || '',
          country: user.address?.country || '',
        },
      })
    }
  }, [user, open])

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
      <div className="relative group mt-2">
        <div className="flex items-center gap-2 text-sm text-green-600 border p-2 rounded-md bg-green-50">
          <FileText className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{fileName}</span>
          <button
            type="button"
            onClick={() => removeFile(field)}
            className="ml-auto text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {}
      if (type === 'personal') {
        payload.name = formData.name
        payload.mobile = formData.mobile
        payload.gender = formData.gender
        payload.nationality = formData.nationality
        payload.occupation = formData.occupation
        payload.passportDetails = formData.passportDetails
        payload.documents = formData.documents
      } else {
        payload.address = formData.address
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        setOpen(false)
        onSuccess()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-full px-6">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {type === 'personal' ? 'Personal' : 'Address'} Details
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {type === 'personal' ? (
            <>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input
                  value={formData.mobile}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, mobile: e.target.value }))
                  }
                  placeholder="+91..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={val =>
                      setFormData(prev => ({ ...prev, gender: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    value={formData.occupation}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        occupation: e.target.value,
                      }))
                    }
                    placeholder="Occupation"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input
                  value={formData.nationality}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      nationality: e.target.value,
                    }))
                  }
                  placeholder="Nationality"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Passport Number</Label>
                  <Input
                    value={formData.passportDetails.passportNumber}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        passportDetails: {
                          ...prev.passportDetails,
                          passportNumber: e.target.value,
                        },
                      }))
                    }
                    placeholder="Passport Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport Expiry</Label>
                  <Input
                    type="date"
                    value={formData.passportDetails.passportExpiry}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        passportDetails: {
                          ...prev.passportDetails,
                          passportExpiry: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm text-gray-900">
                  Passport Documents
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Passport Front</Label>
                    {!formData.documents.passportFront ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={e => handleFileUpload(e, 'passportFront')}
                          disabled={uploading}
                          className="hidden"
                          id="passport-front-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById('passport-front-upload')
                              ?.click()
                          }
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Front
                        </Button>
                      </div>
                    ) : (
                      renderFilePreview(
                        formData.documents.passportFront,
                        'passportFront'
                      )
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Passport Back</Label>
                    {!formData.documents.passportBack ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={e => handleFileUpload(e, 'passportBack')}
                          disabled={uploading}
                          className="hidden"
                          id="passport-back-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById('passport-back-upload')
                              ?.click()
                          }
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Back
                        </Button>
                      </div>
                    ) : (
                      renderFilePreview(
                        formData.documents.passportBack,
                        'passportBack'
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Passport Size Photo</Label>
                  {!formData.documents.photo ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'photo')}
                        disabled={uploading}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById('photo-upload')?.click()
                        }
                        disabled={uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Photo
                      </Button>
                    </div>
                  ) : (
                    renderFilePreview(formData.documents.photo, 'photo')
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={formData.address.street}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  placeholder="House/Flat No, Street Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.address.state}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={formData.address.zip}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zip: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
