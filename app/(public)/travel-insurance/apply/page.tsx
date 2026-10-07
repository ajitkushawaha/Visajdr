'use client'

// Force dynamic rendering to prevent build-time static generation issues
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Shield,
  Plane,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

function ApplyPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)

  // Get data from URL params
  const country = searchParams.get('country') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const residence = searchParams.get('residence') || ''
  const planId = searchParams.get('planId') || ''
  const planType = searchParams.get('planType') || ''
  const totalPremium = searchParams.get('totalPremium') || '0'
  const tripDuration = searchParams.get('tripDuration') || '1'

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    numberOfTravelers: 1,
    purpose: '',
  })

  // File uploads
  const [passport, setPassport] = useState<File | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [visa, setVisa] = useState<File | null>(null)

  // Check if user is logged in
  useEffect(() => {
    if (!session) {
      toast({
        title: 'Login Required',
        description: 'Please login to continue with your application',
        variant: 'destructive',
      })
      router.push('/auth/login')
    }
  }, [session, router, toast])

  // Validate required params
  if (
    !country ||
    !startDate ||
    !endDate ||
    !residence ||
    !planId ||
    !planType
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">
              Missing Information
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Please complete the previous steps first
            </p>
            <Button
              onClick={() => router.push('/travel-insurance')}
              className="w-full"
            >
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFileChange = (field: string, file: File | null) => {
    switch (field) {
      case 'passport':
        setPassport(file)
        break
      case 'photo':
        setPhoto(file)
        break
      case 'visa':
        setVisa(file)
        break
    }
  }

  const validateForm = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.dateOfBirth &&
      formData.nationality &&
      formData.passportNumber &&
      formData.passportExpiry &&
      passport &&
      photo
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please complete all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      // Add trip and plan data
      formDataToSend.append('destination', country)
      formDataToSend.append('startDate', startDate)
      formDataToSend.append('endDate', endDate)
      formDataToSend.append('residence', residence)
      formDataToSend.append('insuranceId', planId)
      formDataToSend.append('planType', planType)
      formDataToSend.append('totalPremium', totalPremium)
      formDataToSend.append('tripDuration', tripDuration)

      // Add files
      formDataToSend.append('passport', passport)
      formDataToSend.append('photo', photo)
      if (visa) {
        formDataToSend.append('visa', visa)
      }

      const response = await fetch('/api/travel-insurance/apply', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Travel insurance application submitted successfully',
        })

        // Redirect to success page
        router.push(`/travel-insurance/success?trackingId=${data.trackingId}`)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit application',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    const params = new URLSearchParams({
      country,
      startDate,
      endDate,
      residence,
    })
    router.push(`/travel-insurance/select-plan?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-theme-light-green py-24">
      <div className="w-4/5 max-[600px]:w-[100%] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-brand-primary mb-4">
            Travel Insurance Application
          </h1>
          <p className="text-sm md:text-lg text-gray-600">
            Complete your application for {planType} coverage
          </p>
        </div>

        {/* Application Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-primary">
              Application Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Destination
                  </div>
                  <div className="font-semibold text-sm md:text-base">
                    {country}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-secondary" />
                <div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Plan Type
                  </div>
                  <div className="font-semibold capitalize text-sm md:text-base">
                    {planType}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-accent" />
                <div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Total Premium
                  </div>
                  <div className="font-semibold text-sm md:text-base">
                    ₹{parseInt(totalPremium).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm md:text-base">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm md:text-base">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm md:text-base">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm md:text-base">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-sm md:text-base">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="nationality" className="text-sm md:text-base">
                  Nationality *
                </Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={e =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="Enter nationality"
                />
              </div>

              <div>
                <Label
                  htmlFor="passportNumber"
                  className="text-sm md:text-base"
                >
                  Passport Number *
                </Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={e =>
                    setFormData({ ...formData, passportNumber: e.target.value })
                  }
                  placeholder="Enter passport number"
                />
              </div>

              <div>
                <Label
                  htmlFor="passportExpiry"
                  className="text-sm md:text-base"
                >
                  Passport Expiry Date *
                </Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={e =>
                    setFormData({ ...formData, passportExpiry: e.target.value })
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="numberOfTravelers"
                  className="text-sm md:text-base"
                >
                  Number of Travelers
                </Label>
                <Select
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      numberOfTravelers: parseInt(value),
                    })
                  }
                  value={formData.numberOfTravelers.toString()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Traveler' : 'Travelers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purpose" className="text-sm md:text-base">
                  Travel Purpose
                </Label>
                <Select
                  onValueChange={value =>
                    setFormData({ ...formData, purpose: value })
                  }
                  value={formData.purpose}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="passport" className="text-sm md:text-base">
                  Passport Copy *
                </Label>
                <Input
                  id="passport"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e =>
                    handleFileChange('passport', e.target.files?.[0] || null)
                  }
                  className="cursor-pointer"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Upload clear copy of your passport
                </p>
              </div>

              <div>
                <Label htmlFor="photo" className="text-sm md:text-base">
                  Passport Size Photo *
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    handleFileChange('photo', e.target.files?.[0] || null)
                  }
                  className="cursor-pointer"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Recent passport size photograph
                </p>
              </div>

              <div>
                <Label htmlFor="visa" className="text-sm md:text-base">
                  Visa Copy (Optional)
                </Label>
                <Input
                  id="visa"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e =>
                    handleFileChange('visa', e.target.files?.[0] || null)
                  }
                  className="cursor-pointer"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Upload visa if already obtained
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-accent/10 rounded-lg border border-brand-accent/20">
              <h3 className="font-semibold text-brand-accent mb-2 text-sm md:text-base">
                Important Notes:
              </h3>
              <ul className="text-xs md:text-sm text-brand-accent space-y-1">
                <li>• All documents must be clear and legible</li>
                <li>
                  • Passport must be valid for at least 6 months beyond your
                  return date
                </li>
                <li>• Photo should be recent and meet passport requirements</li>
                <li>• Maximum file size: 5MB per document</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !validateForm()}
            className="flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Submit Application'}
            <Shield className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Loading travel insurance application...
            </p>
          </div>
        </div>
      }
    >
      <ApplyPageContent />
    </Suspense>
  )
}
