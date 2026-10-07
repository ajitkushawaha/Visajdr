'use client'

import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Upload, CheckCircle, X, Info, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter, useSearchParams } from 'next/navigation'
import useRoleRedirect from '@/utils/protectedRoute'
import ReviewPage from '@/components/forms/ReviewPage'
import dynamic from 'next/dynamic'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddTravelerModal } from '@/components/dashboard/AddTravelerModal'

// Load payment component client-side only to avoid SSR/runtime issues
const PaymentComponent = dynamic(
  () => import('@/components/payment/PaymentComponent'),
  { ssr: false }
)

type VisaOption = {
  value: string
  label: string
  flag?: string
  price?: number
}
type FormDataState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  occupation: string
  passportNumber: string
  passportExpiry: string
  purpose: string
  startDate: string
  endDate: string
  selectedVisaId: string
}
type ErrorState = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'nationality'
    | 'occupation'
    | 'passportNumber'
    | 'passportExpiry'
    | 'passport'
    | 'photo'
    | 'country',
    string
  >
>

const MAX_FILE_MB = 5
const MB = 1024 * 1024

// Types for document requirements fetched from API
type DocumentSpec = {
  key: string
  label: string
  description?: string
  mandatory: boolean
  formats: string[]
  maxSizeMB: number
  imageSpec?: {
    widthPx?: number
    heightPx?: number
    aspectRatio?: number
  }
  sampleUrl?: string
  exampleImage?: string
}

// Zod schema for Step 1 validation
const objectIdRegex = /^[0-9a-fA-F]{24}$/
const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, 'First name required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(2, 'Last name required')
    .max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number is required')
    .refine(
      v => /^\+?[\d\s-]{10,}$/.test(v.trim()),
      'Invalid phone number format (e.g., +91 XXXXXXXXXX)'
    ),
  occupation: z.string().min(2, 'Occupation is required'),
  passportNumber: z.string().min(5, 'Passport number is required'),
  passportExpiry: z.string().min(1, 'Passport expiry date is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  selectedVisaId: z
    .string()
    .regex(objectIdRegex, 'Please select a valid country'),
  // purpose is optional and managed via query param
  purpose: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

function ApplyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  useRoleRedirect(['user'])
  const [step, setStep] = useState<number>(1)
  const [visaOptions, setVisaOptions] = useState<VisaOption[]>([])
  const [reorderedVisaOptions, setReorderedVisaOptions] = useState<
    VisaOption[]
  >([])
  const [selectedVisaId, setSelectedVisaId] = useState<string>('')
  const [method, setMethod] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [couponDiscount, setCouponDiscount] = useState<any>(null)
  const [trackingId, setTrackingId] = useState<string>('')
  const [requirements, setRequirements] = useState<DocumentSpec[]>([])
  const [requirementsLoading, setRequirementsLoading] = useState<boolean>(false)
  const [initialLoading, setInitialLoading] = useState<boolean>(true) // Initial page load

  const [formData, setFormData] = useState<FormDataState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    occupation: '',
    passportNumber: '',
    passportExpiry: '',
    purpose: '',
    startDate: '',
    endDate: '',
    selectedVisaId: '',
  })

  const [errors, setErrors] = useState<ErrorState>({})
  const [submitting, setSubmitting] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [travelers, setTravelers] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loadingTravelers, setLoadingTravelers] = useState(false)
  const [selectedTravelerId, setSelectedTravelerId] = useState<string>('none')

  // ── Resume Application Logic
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [pendingApp, setPendingApp] = useState<any>(null)
  const [isResuming, setIsResuming] = useState(false)

  // Function to handle resumption
  const handleResumeApplication = async (appId: string) => {
    try {
      setIsResuming(true)
      const res = await fetch(`/api/applications/${appId}`)
      if (!res.ok) throw new Error('Failed to fetch application')
      const data = await res.json()
      const app = data.application

      // Populate State
      setTrackingId(app.trackingId)
      setFormData(prev => ({
        ...prev,
        firstName: app.personalInfo.firstName || '',
        lastName: app.personalInfo.lastName || '',
        email: app.personalInfo.email || '',
        phone: app.personalInfo.phone || '',
        nationality: app.personalInfo.nationality || '',
        occupation: app.personalInfo.occupation || '',
        passportNumber: app.personalInfo.passportNumber || '',
        passportExpiry: app.personalInfo.passportExpiry || '',
        purpose: app.personalInfo.purpose || '',
        startDate: app.personalInfo.startDate || '',
        endDate: app.personalInfo.endDate || '',
        selectedVisaId: app.visaId,
      }))

      setSelectedVisaId(app.visaId)
      if (app.totalAmount) setTotalAmount(app.totalAmount)
      if (app.documents?.additionalInfo)
        setAdditionalInfo(app.documents.additionalInfo)

      // Set Step 3
      setStep(3)
      setResumeModalOpen(false)

      // Update URL to remove resume param so refresh doesn't trigger again?
      // Or keep it? Keeping it is fine.
    } catch (error) {
      toast({ title: 'Error resuming application', variant: 'destructive' })
    } finally {
      setIsResuming(false)
    }
  }

  // Effect to check resume param
  useEffect(() => {
    const resumeId = getParam('resume')
    if (resumeId) {
      handleResumeApplication(resumeId)
    }
  }, [searchParams])

  // Effect to auto-detect pending apps (only on first load and if no resume param)
  useEffect(() => {
    const checkPending = async () => {
      // Avoid checking if we are already resuming
      if (getParam('resume')) return

      try {
        const res = await fetch('/api/applications/user')
        if (res.ok) {
          const data = await res.json()

          if (!data.applications || data.applications.length === 0) return

          // 1. Get explicitly ignored drafts from local storage
          let ignoredDrafts: string[] = []
          try {
            ignoredDrafts = JSON.parse(
              localStorage.getItem('ignoredDrafts') || '[]'
            )
          } catch (e) {}

          // 2. Sort applications so the most recent one is checked first
          const sortedApps = [...data.applications].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )

          // 3. Find the most recent incomplete application
          const pending = sortedApps.find((app: any) => {
            // Ignore if user already clicked "Start New Application" for this draft
            if (ignoredDrafts.includes(app._id)) return false

            // Application is incomplete if status is draft or pending
            const statusMatch = ['draft', 'pending'].includes(
              app.status?.toLowerCase()
            )

            // Payment should not be successful
            const paymentNotSuccess = !['success', 'paid'].includes(
              app.paymentStatus?.toLowerCase()
            )

            return statusMatch && paymentNotSuccess
          })

          if (pending) {
            setPendingApp(pending)
            setResumeModalOpen(true)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (initialLoading === false) {
      checkPending()
    }
  }, [initialLoading])

  // Refs to prevent double submission and manage abort controllers
  const isSubmittingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastSubmitTimeRef = useRef<number>(0)

  // Dynamic files & previews only (no hard-coded passport/photo)
  const [otherFiles, setOtherFiles] = useState<Record<string, File | null>>({})
  const [otherPreviews, setOtherPreviews] = useState<Record<string, string>>({})
  const [docErrors, setDocErrors] = useState<Record<string, string>>({})

  // Refs for hidden inputs (ensures clicking the visible button opens the native picker)
  // No hard-coded passport/photo refs – dynamic inputs handle themselves

  // Safe accessor for search params (handles possible null typing)
  const getParam = (key: string) =>
    searchParams ? searchParams.get(key) : null
  const conId = getParam('country') || undefined
  const purpose = getParam('purpose') || undefined

  // Extract country ID from the URL format: "country-name-objectId"
  let countryFromQuery: string | undefined = undefined
  if (conId) {
    // Split by '-' and get the last part (ObjectId)
    const parts = conId.split('-')
    countryFromQuery = parts[parts.length - 1]
  }

  // ── fetch countries
  useEffect(() => {
    const fetchVisaData = async () => {
      try {
        const res = await fetch('/api/public/visa')
        if (!res.ok) throw new Error('Failed to fetch visas')
        const data = await res.json()
        const normalized = (data.visas || []).map((v: any) => ({
          value: v.id,
          label: v.country,
          flag: v.countryFlag,
          price: v.adultPrice,
        }))
        setVisaOptions(normalized)
      } catch (e) {
        // Error fetching visas
      } finally {
        // Mark initial loading as complete after visa data is loaded
        setInitialLoading(false)
      }
    }
    fetchVisaData()
  }, [])

  // ── fetch travelers
  const fetchTravelers = async () => {
    setLoadingTravelers(true)
    try {
      const [resTravelers, resProfile] = await Promise.all([
        fetch('/api/user/travelers'),
        fetch('/api/user/profile'),
      ])

      if (resTravelers.ok) {
        const data = await resTravelers.json()
        setTravelers(data.travelers || [])
      }

      if (resProfile.ok) {
        const data = await resProfile.json()
        setUserProfile(data.user || null)
      }
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoadingTravelers(false)
    }
  }

  useEffect(() => {
    fetchTravelers()
  }, [])

  const getFileFromUrl = async (
    url: string,
    name: string,
    defaultType: string = 'image/jpeg'
  ): Promise<File | null> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new File([blob], name, { type: blob.type || defaultType })
    } catch (error) {
      console.error('Error converting URL to file:', error)
      return null
    }
  }

  // ── Load form data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedFormData = localStorage.getItem('visaApplicationFormData')
      const savedAdditionalInfo = localStorage.getItem(
        'visaApplicationAdditionalInfo'
      )
      const savedSelectedVisaId = localStorage.getItem(
        'visaApplicationSelectedVisaId'
      )
      const savedStep = localStorage.getItem('visaApplicationStep')

      if (savedFormData) {
        const parsed = JSON.parse(savedFormData)
        setFormData(prev => ({ ...prev, ...parsed }))
      }

      if (savedAdditionalInfo) {
        setAdditionalInfo(savedAdditionalInfo)
      }

      if (savedSelectedVisaId) {
        setSelectedVisaId(savedSelectedVisaId)
      }

      if (savedStep) {
        const stepNum = parseInt(savedStep, 10)
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 3) {
          setStep(stepNum)
        }
      }
    } catch (error) {
      // Error loading form data from localStorage
    }
  }, [])

  // ── Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('visaApplicationFormData', JSON.stringify(formData))
    } catch (error) {
      // Error saving form data to localStorage
    }
  }, [formData])

  // ── Save additional info to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('visaApplicationAdditionalInfo', additionalInfo)
    } catch (error) {
      // Error saving additional info to localStorage
    }
  }, [additionalInfo])

  // ── Save selected visa ID to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (selectedVisaId) {
        localStorage.setItem('visaApplicationSelectedVisaId', selectedVisaId)
      }
    } catch (error) {
      // Error saving selected visa ID to localStorage
    }
  }, [selectedVisaId])

  // ── Save step to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('visaApplicationStep', step.toString())
    } catch (error) {
      // Error saving step to localStorage
    }
  }, [step])

  // ── init selected visa / step from query/localStorage
  useEffect(() => {
    if (!visaOptions.length) return

    let stepFromQuery: number | undefined = undefined
    const stepParam = getParam('step')
    if (stepParam) {
      stepFromQuery = parseInt(stepParam, 10)
    }

    if (!countryFromQuery && typeof window !== 'undefined') {
      const ls = localStorage.getItem('selectedCountry')
      if (ls) countryFromQuery = ls
    }
    if (!stepFromQuery && typeof window !== 'undefined') {
      const ls2 = localStorage.getItem('returnStep')
      if (ls2) stepFromQuery = parseInt(ls2, 10)
    }

    // Don't override step if it was loaded from form data localStorage
    if (stepFromQuery) {
      setStep(stepFromQuery)
    }

    if (countryFromQuery) {
      // countryFromQuery is already the extracted ObjectId
      const actualVisaId = countryFromQuery

      setSelectedVisaId(actualVisaId)
    }
  }, [visaOptions])

  // ── helper functions
  const formatPrice = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0)
  }

  const validateFile = (
    file: File,
    allowedTypes: string[],
    maxSizeMB: number
  ): string | null => {
    if (!allowedTypes.includes(file.type)) return 'Invalid file format'
    if (file.size > maxSizeMB * MB) return `File size exceeds ${maxSizeMB}MB`
    return null
  }

  const formatsToAcceptAttr = (
    formats: string[] = []
  ): { accept: string; types: string[] } => {
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
    }
    const types = formats.map(f => map[f.toLowerCase()] || '').filter(Boolean)
    const accept = types.join(',') || 'image/jpeg,image/png,application/pdf'
    return {
      accept,
      types: types.length
        ? types
        : ['image/jpeg', 'image/png', 'application/pdf'],
    }
  }

  const validatePhotoDimensions = async (
    file: File,
    spec?: { widthPx?: number; heightPx?: number; aspectRatio?: number }
  ): Promise<string | null> => {
    if (!spec || (!spec.widthPx && !spec.heightPx && !spec.aspectRatio)) {
      return null
    }
    return new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        URL.revokeObjectURL(url)
        if (spec.widthPx && w !== spec.widthPx) {
          resolve(`Photo width must be ${spec.widthPx}px`)
          return
        }
        if (spec.heightPx && h !== spec.heightPx) {
          resolve(`Photo height must be ${spec.heightPx}px`)
          return
        }
        if (spec.aspectRatio) {
          const ratio = w / h
          const diff = Math.abs(ratio - spec.aspectRatio)
          if (diff > 0.02) {
            resolve('Photo must match required aspect ratio (35x45mm)')
            return
          }
        }
        resolve(null)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve('Unable to read photo dimensions')
      }
      img.src = url
    })
  }

  const handleAdditionalInfo = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(e.target.value)
  }

  const handleStepChange = (nextStep: number) => {
    setIsTransitioning(true)
    // Scroll to top when changing steps
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Add a small delay to show loading state and ensure smooth transition
    setTimeout(() => {
      setStep(nextStep)
      // Keep loading state a bit longer to ensure smooth transition
      setTimeout(() => {
        setIsTransitioning(false)
        // Ensure scroll to top after step change completes
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)
    }, 300)
  }

  const handleTravelerSelect = (travelerId: string) => {
    setSelectedTravelerId(travelerId)
    if (travelerId === 'none') return

    if (travelerId === 'myself') {
      // Use userProfile if available, otherwise treat as empty to clear form
      const profile = userProfile || {}

      const nameParts = (profile.name || '').trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: profile.email || '',
        phone: profile.mobile || '',
        nationality: profile.nationality || profile.address?.country || '',
        occupation: profile.occupation || '',
        passportNumber: profile.passportDetails?.passportNumber || '',
        passportExpiry: profile.passportDetails?.passportExpiry
          ? new Date(profile.passportDetails.passportExpiry)
              .toISOString()
              .split('T')[0]
          : '',
      }))
      toast({
        title: 'Info Autofilled',
        description: `Filled details for Myself`,
      })
      return
    }

    const traveler = travelers.find(t => t._id === travelerId)
    if (traveler) {
      setFormData(prev => ({
        ...prev,
        firstName: traveler.personalInfo?.firstName || '',
        lastName: traveler.personalInfo?.lastName || '',
        email: traveler.personalInfo?.email || '',
        phone: traveler.personalInfo?.phone || '',
        nationality: traveler.personalInfo?.nationality || '',
        occupation: traveler.personalInfo?.occupation || '',
        passportNumber: traveler.personalInfo?.passportNumber || '',
        passportExpiry: traveler.personalInfo?.passportExpiry
          ? new Date(traveler.personalInfo.passportExpiry)
              .toISOString()
              .split('T')[0]
          : '',
      }))

      // Autofill documents logic moved to useEffect
      toast({
        title: 'Info Autofilled',
        description: `Filled details for ${traveler.personalInfo?.firstName}`,
      })
    }
  }

  // ── Autofill documents when traveler or requirements change
  useEffect(() => {
    const autofillDocuments = async () => {
      if (selectedTravelerId === 'none' || requirements.length === 0) return

      let sourceProfile: any = null

      if (selectedTravelerId === 'myself') {
        sourceProfile = userProfile || {}
      } else {
        sourceProfile = travelers.find(t => t._id === selectedTravelerId)
      }

      if (!sourceProfile) return

      let filledCount = 0
      const newFiles = { ...otherFiles }
      const newPreviews = { ...otherPreviews }
      const newDocErrors = { ...docErrors }
      let hasChanges = false

      for (const req of requirements) {
        let doc: any = null
        const key = req.key.toLowerCase()

        // Map requirements to documents
        if (key.includes('passport') && !key.includes('back')) {
          doc = sourceProfile.documents?.passportFront
        } else if (key.includes('passport') && key.includes('back')) {
          doc = sourceProfile.documents?.passportBack
        } else if (key.includes('photo')) {
          doc = sourceProfile.documents?.photo
        }

        // If we have a matching document in profile
        if (doc && doc.url) {
          try {
            const file = await getFileFromUrl(
              doc.url,
              doc.originalName || `${req.key}.jpg`
            )

            if (file) {
              // Only update if it's different? Hard to say.
              // Revoke old preview if exists and is different (we assume it's new)
              if (newPreviews[req.key]) {
                // If it's a blob url, revoke it.
                // If it was the SAME file, we are just refreshing it.
                if (newPreviews[req.key].startsWith('blob:')) {
                  URL.revokeObjectURL(newPreviews[req.key])
                }
              }

              newFiles[req.key] = file
              newPreviews[req.key] = URL.createObjectURL(file)
              newDocErrors[req.key] = '' // Clear errors
              filledCount++
              hasChanges = true
            }
          } catch (err) {
            console.error(`Failed to autofill ${req.key}`, err)
          }
        } else {
          // Profile does not have this document.
          // If we have a file currently (e.g. from previous traveler), clear it.
          if (newFiles[req.key]) {
            if (newPreviews[req.key]?.startsWith('blob:')) {
              URL.revokeObjectURL(newPreviews[req.key])
            }
            delete newFiles[req.key]
            delete newPreviews[req.key]
            delete newDocErrors[req.key]
            hasChanges = true
          }
        }
      }

      if (hasChanges) {
        setOtherFiles(prev => ({ ...prev, ...newFiles }))
        setOtherPreviews(prev => ({ ...prev, ...newPreviews }))
        setDocErrors(prev => ({ ...prev, ...newDocErrors }))
        toast({
          title: 'Documents Autofilled',
          description: `Autofilled ${filledCount} document(s) from profile.`,
        })
      }
    }

    autofillDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTravelerId, requirements, travelers, userProfile])

  const validateStep1 = (): boolean => {
    const parsed = step1Schema.safeParse({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      nationality: formData.nationality.trim(),
      occupation: formData.occupation.trim(),
      passportNumber: formData.passportNumber.trim(),
      passportExpiry: formData.passportExpiry,
      selectedVisaId: selectedVisaId || '',
      purpose: purpose || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
    })

    if (parsed.success) {
      setErrors({})
      return true
    }

    const next: ErrorState = {}
    parsed.error.errors.forEach(err => {
      const key = err.path[0]
      const msg = err.message
      if (key === 'selectedVisaId') {
        next.country = msg
      } else if (
        key === 'firstName' ||
        key === 'lastName' ||
        key === 'email' ||
        key === 'phone' ||
        key === 'nationality' ||
        key === 'occupation' ||
        key === 'passportNumber' ||
        key === 'passportExpiry'
      ) {
        next[key] = msg
      }
    })
    setErrors(next)
    return false
  }

  // Passport & photo now handled by onDynamicSelected – no hard-coded handlers

  // Clear dynamic file only – passport/photo now use onDynamicSelected

  const onDynamicSelected = async (
    key: string,
    spec: DocumentSpec,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const { types } = formatsToAcceptAttr(spec.formats || [])
    const err = validateFile(file, types, spec.maxSizeMB || MAX_FILE_MB)
    if (err) {
      setDocErrors(prev => ({ ...prev, [key]: err }))
      e.target.value = ''
      return
    }
    if (spec.imageSpec) {
      const dimErr = await validatePhotoDimensions(file, spec.imageSpec)
      if (dimErr) {
        setDocErrors(prev => ({ ...prev, [key]: dimErr }))
        e.target.value = ''
        return
      }
    }
    // Clear error
    setDocErrors(prev => ({ ...prev, [key]: '' }))
    // Revoke old preview
    if (otherPreviews[key]) URL.revokeObjectURL(otherPreviews[key])
    const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : ''
    setOtherFiles(prev => ({ ...prev, [key]: file }))
    setOtherPreviews(prev => ({ ...prev, [key]: preview }))

    // Files are stored in React state (otherFiles), no need for localStorage
    // localStorage has size limits and base64 encoding would exceed quota
  }

  const clearDynamicFile = (key: string) => {
    if (otherPreviews[key]) URL.revokeObjectURL(otherPreviews[key])
    setOtherFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[key]
      return newFiles
    })
    setOtherPreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[key]
      return newPreviews
    })
    setDocErrors(prev => ({ ...prev, [key]: '' }))
    const input = document.getElementById(
      `doc-${key}`
    ) as HTMLInputElement | null
    if (input) input.value = ''
    // Files are stored in React state, no localStorage needed
  }

  // Pre-create application via API to save draft or mark pending
  const preCreateApplication = async (draft: boolean) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    if (!selectedVisaId || !objectIdRegex.test(selectedVisaId)) {
      toast({
        title: 'Invalid Visa Selection',
        description: 'Please select a visa from the list',
        variant: 'destructive',
      })
      return null
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone.trim(),
      nationality: formData.nationality,
      occupation: formData.occupation,
      passportNumber: formData.passportNumber,
      passportExpiry: formData.passportExpiry,
      purpose: purpose,
      startDate: formData.startDate,
      endDate: formData.endDate,
      countryId: selectedVisaId,
      additionalInfo,
      paymentMethod: method || 'cashfree',
      couponDiscount,
      // documents optional during pre-create
      passportUrl: undefined,
      photoUrl: undefined,
      draft,
    }

    const res = await fetch('/api/applications/pre-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok || !data?.trackingId) {
      toast({
        title: 'Save Failed',
        description: data?.error || 'Unable to save application',
        variant: 'destructive',
      })
      return null
    }
    const tid = String(data.trackingId)
    const appId = data.applicationId ? String(data.applicationId) : null

    setTrackingId(tid)
    try {
      localStorage.setItem('visaApplicationTrackingId', tid)
      if (appId) {
        localStorage.setItem('visaApplicationId', appId)
        sessionStorage.setItem('visaApplicationId', appId)
      }
    } catch (e) {
      // Error storing IDs
    }

    const result: { trackingId: string; status: any; applicationId?: string } =
      {
        trackingId: tid,
        status: data.status,
      }
    if (appId) {
      result.applicationId = appId
    }
    return result
  }

  const handleSaveDraft = async () => {
    if (!validateStep1()) return
    setSubmitting(true)
    const saved = await preCreateApplication(true)
    setSubmitting(false)
    if (saved?.trackingId) {
      toast({
        title: 'Draft Saved',
        description: `Tracking ID: ${saved.trackingId}. You can resume anytime.`,
      })
    }
  }

  // Manual test upload function
  const handleTestUpload = async () => {
    try {
      // Get application ID from localStorage or sessionStorage
      let appId =
        localStorage.getItem('visaApplicationId') ||
        sessionStorage.getItem('visaApplicationId')

      // If no application ID exists, create one first for testing
      if (!appId) {
        // Validate form first
        if (!validateStep1() || !validateStep2()) {
          toast({
            title: 'Form Validation Failed',
            description:
              'Please fill in all required fields before testing upload.',
            variant: 'destructive',
          })
          return
        }

        // Create application in pending state
        setSubmitting(true)
        const created = await preCreateApplication(false)
        setSubmitting(false)

        if (created?.applicationId) {
          appId = created.applicationId
          toast({
            title: 'Application Created',
            description: `Test application created. Tracking ID: ${created.trackingId}. Testing upload now...`,
          })
        } else {
          toast({
            title: 'Failed to Create Test Application',
            description:
              'Could not create application for testing. Please try submitting normally first.',
            variant: 'destructive',
          })
          return
        }
      }

      if (!appId) {
        toast({
          title: 'No Application Found',
          description:
            'Could not get or create application ID. Please try submitting normally first.',
          variant: 'destructive',
        })
        return
      }

      // Get files from React state instead of localStorage
      const fileKeys = Object.keys(otherFiles)

      if (fileKeys.length === 0) {
        toast({
          title: 'No Files to Upload',
          description: 'No files selected. Please select documents first.',
          variant: 'destructive',
        })
        return
      }

      // Use files directly from React state
      const formData = new FormData()
      let fileCount = 0

      for (const key of fileKeys) {
        const file = otherFiles[key]
        if (file) {
          try {
            // Handle passport and photo specially
            if (key === 'passport') {
              formData.append('passport', file)
              fileCount++
            } else if (key === 'photo') {
              formData.append('photo', file)
              fileCount++
            } else {
              // Dynamic documents use doc_ prefix
              formData.append(`doc_${key}`, file)
              fileCount++
            }
          } catch (fileError) {
            // Error processing file
          }
        }
      }

      if (fileCount === 0) {
        toast({
          title: 'No Valid Files',
          description:
            'Could not process any files. Please check file formats.',
          variant: 'destructive',
        })
        return
      }

      // Attempt upload
      const uploadRes = await fetch(
        `/api/applications/${appId}/upload-documents`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        toast({
          title: '✅ Test Upload Successful!',
          description: `Successfully uploaded ${uploadData.uploadedCount || fileCount} document(s). Check the database to verify.`,
        })
      } else {
        const errorData = await uploadRes
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        toast({
          title: '❌ Test Upload Failed',
          description: `Status: ${uploadRes.status}. ${errorData.error || errorData.message || 'Unknown error'}`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '❌ Test Upload Error',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitPending = async () => {
    // ====== DEBOUNCING & DUPLICATE PREVENTION ======
    const now = Date.now()
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current

    // Debounce: Ignore clicks within 2 seconds of last submit
    if (timeSinceLastSubmit < 2000) {
      toast({
        title: 'Please wait',
        description: 'Submitting application... Please wait.',
        variant: 'default',
      })
      return
    }

    // Immediate guard: Check if already submitting (using ref for instant check)
    if (isSubmittingRef.current) {
      toast({
        title: 'Already submitting',
        description: 'Your application is being submitted. Please wait...',
        variant: 'default',
      })
      return
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Set submitting flag immediately (before any async operations)
    isSubmittingRef.current = true
    lastSubmitTimeRef.current = now
    setSubmitting(true)

    if (!validateStep1() || !validateStep2()) {
      // Reset flags on validation failure
      isSubmittingRef.current = false
      setSubmitting(false)
      abortControllerRef.current = null
      return
    }

    // Simple document validation - check if all mandatory documents are uploaded
    const missingDocuments = requirements.filter(
      req => req.mandatory && !otherFiles[req.key]
    )

    if (missingDocuments.length > 0) {
      // Reset flags on validation failure
      isSubmittingRef.current = false
      setSubmitting(false)
      abortControllerRef.current = null

      // Show error message with list of missing documents
      const missingDocNames = missingDocuments.map(doc => doc.label).join(', ')
      toast({
        title: 'Missing Required Documents',
        description: `Please upload the following documents before submitting: ${missingDocNames}`,
        variant: 'destructive',
        duration: 6000,
      })

      // Scroll to document section
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const firstMissingDoc = document.querySelector(
            `[id^="doc-${missingDocuments[0].key}"]`
          )
          if (firstMissingDoc) {
            firstMissingDoc.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }, 100)
      }

      return
    }

    try {
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return
      }

      // Pre-create application NOW and upload documents immediately
      const preCreateResult = await preCreateApplication(false)

      if (!preCreateResult?.applicationId) {
        toast({
          title: 'Error',
          description: 'Failed to create application. Please try again.',
          variant: 'destructive',
        })
        isSubmittingRef.current = false
        setSubmitting(false)
        abortControllerRef.current = null
        return
      }

      // Upload documents immediately after pre-create (BEFORE payment)
      const filesToUpload = Object.entries(otherFiles).filter(
        ([_, file]) => file !== null && file instanceof File
      )

      if (filesToUpload.length > 0) {
        try {
          const uploadFormData = new FormData()

          filesToUpload.forEach(([key, file]) => {
            if (file && file instanceof File) {
              if (key === 'passport') {
                uploadFormData.append('passport', file)
              } else if (key === 'photo') {
                uploadFormData.append('photo', file)
              } else {
                uploadFormData.append(`doc_${key}`, file)
              }
            }
          })

          const uploadRes = await fetch(
            `/api/applications/${preCreateResult.applicationId}/upload-documents`,
            {
              method: 'POST',
              body: uploadFormData,
              credentials: 'include',
            }
          )

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json().catch(() => ({}))
            toast({
              title: 'Warning',
              description:
                'Documents could not be uploaded. Please contact support.',
              variant: 'destructive',
            })
          }
        } catch (uploadError) {
          toast({
            title: 'Warning',
            description: 'Error uploading documents. Please contact support.',
            variant: 'destructive',
          })
        }
      }

      // IMPORTANT: Explicitly save form data to localStorage before moving to payment step
      // This ensures PaymentComponent can read it when creating the application
      if (typeof window !== 'undefined') {
        try {
          // Explicitly save form data to localStorage
          localStorage.setItem(
            'visaApplicationFormData',
            JSON.stringify(formData)
          )
          localStorage.setItem('visaApplicationAdditionalInfo', additionalInfo)
          if (selectedVisaId) {
            localStorage.setItem(
              'visaApplicationSelectedVisaId',
              selectedVisaId
            )
          }

          // Clear only UI/step-related items
          localStorage.removeItem('visaApplicationStep')
          localStorage.removeItem('selectedCountry')
          localStorage.removeItem('returnStep')

          // Keep form data for payment component:
          // - visaApplicationFormData (needed for pre-create) - just saved above
          // - visaApplicationAdditionalInfo (needed for pre-create) - just saved above
          // - visaApplicationSelectedVisaId (needed for pre-create) - just saved above
          // - uploadedPassportUrl, uploadedPhotoUrl, etc. (needed for pre-create)
          // - visaCouponDiscount (needed for discount calculation)
          // These will be cleared after payment completes
        } catch (error) {
          // Error saving/clearing localStorage
        }
      }

      // Scroll to top before changing step
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      // Move to payment step - application is already created with documents uploaded
      handleStepChange(3)
    } catch (error: any) {
      // Check if error was due to abort
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return
      }

      toast({
        title: 'Submission Error',
        description:
          error.message ||
          'An error occurred during submission. Please try again.',
        variant: 'destructive',
      })
    } finally {
      // Always reset flags when done (success or failure)
      isSubmittingRef.current = false
      setSubmitting(false)
      abortControllerRef.current = null
    }
  }

  const validateStep2 = (): boolean => {
    const next: ErrorState = {}
    const docErrs: Record<string, string> = {}

    requirements.forEach(req => {
      if (req.mandatory && !otherFiles[req.key]) {
        const errorMsg = `${req.label} is required`
        ;(next as any)[req.key] = errorMsg
        docErrs[req.key] = errorMsg
      } else {
        // Clear error if document is uploaded
        docErrs[req.key] = ''
      }
    })

    setErrors(next)
    setDocErrors(prev => ({ ...prev, ...docErrs }))
    return Object.keys(next).length === 0
  }

  useEffect(() => {
    if (!selectedVisaId) {
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/public/document-requirements?id=${selectedVisaId}`,
          {
            method: 'GET',
            credentials: 'same-origin',
          }
        )

        if (!res.ok) {
          return
        }

        const json = await res.json()

        // API now returns objects with metadata instead of just booleans
        const docsMap: Record<string, any> = json || {}
        const list: DocumentSpec[] = []
        Object.entries(docsMap).forEach(([key, docData]) => {
          // Handle both old format (boolean) and new format (object with metadata)
          const isRequired =
            typeof docData === 'boolean' ? docData : docData.required

          if (!isRequired) {
            return
          }

          const displayName =
            typeof docData === 'object' && docData.displayName
              ? docData.displayName
              : key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, ' $1')

          const exampleImage =
            typeof docData === 'object' &&
            docData.exampleImage &&
            docData.exampleImage.trim() !== ''
              ? docData.exampleImage
              : undefined

          const spec: DocumentSpec = {
            key,
            label: displayName,
            mandatory:
              typeof docData === 'object' ? docData.isRequired !== false : true,
            formats:
              typeof docData === 'object' && docData.formats
                ? docData.formats
                : ['pdf', 'jpg', 'png'],
            maxSizeMB:
              typeof docData === 'object' && docData.maxSizeMB
                ? docData.maxSizeMB
                : 5,
            imageSpec:
              typeof docData === 'object' && docData.imageSpec
                ? docData.imageSpec
                : key === 'photo'
                  ? { widthPx: 413, heightPx: 531, aspectRatio: 413 / 531 }
                  : undefined,
            exampleImage,
          }

          list.push(spec)
        })

        setRequirements(list)
      } catch (error) {
        // Error fetching document requirements
      }
    }

    fetchData()
  }, [selectedVisaId])

  // Scroll to top whenever step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Validate documents when entering step 2
  useEffect(() => {
    if (step === 2 && requirements.length > 0) {
      validateStep2()
    }
  }, [step, requirements.length])

  // Show skeleton loader while initial data is loading
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country Select Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Document Upload Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="flex justify-end gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8 relative">
      {/* Full-page loading overlay */}
      {(isTransitioning || submitting || isSubmittingRef.current) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <p className="text-gray-700 font-medium">
              {submitting || isSubmittingRef.current
                ? 'Submitting Application...'
                : 'Loading...'}
            </p>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto ">
        <Card className="w-full flex flex-col items-center justify-center">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Apply for Visa
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 transition-all duration-300 ease-in-out w-full flex flex-col items-center justify-center">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className=" gap-6">
                <div className="md:col-span-2 space-y-4">
                  {/* Country Select */}
                  <div>
                    <Label
                      htmlFor="country"
                      className="text-gray-700 font-medium"
                    >
                      Select Country
                    </Label>
                    {selectedVisaId ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed capitalize">
                          {(() => {
                            const selectedVisa = visaOptions.find(
                              v => v.value === selectedVisaId
                            )
                            return selectedVisa ? (
                              <>
                                {selectedVisa.flag && (
                                  <img
                                    src={selectedVisa.flag}
                                    alt="flag"
                                    className="h-4 w-6 object-cover rounded"
                                  />
                                )}
                                <span className="flex-1 font-medium text-gray-700">
                                  {selectedVisa.label}
                                </span>
                                <span className="text-gray-500">
                                  {formatPrice(selectedVisa.price || 0)}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">
                                Country selected
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <Select
                        value={selectedVisaId}
                        onValueChange={val => setSelectedVisaId(val)}
                      >
                        <SelectTrigger id="country" className="mt-2">
                          <SelectValue placeholder="Choose country" />
                        </SelectTrigger>
                        <SelectContent>
                          {visaOptions.map(v => (
                            <SelectItem key={v.value} value={v.value}>
                              <div className="flex items-center gap-2 capitalize">
                                {v.flag && (
                                  <img
                                    src={v.flag}
                                    alt="flag"
                                    className="h-4 w-6 object-cover rounded"
                                  />
                                )}
                                <span className="capitalize">{v.label}</span>
                                <span className="ml-auto text-gray-500">
                                  {formatPrice(v.price || 0)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.country && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Traveler Autofill */}
                  {(travelers.length > 0 || userProfile) && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-blue-800 block">
                          Autofill from Saved Travelers
                        </Label>
                        <AddTravelerModal
                          onSuccess={fetchTravelers}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              + Add New Traveler
                            </Button>
                          }
                        />
                      </div>
                      <Select
                        value={selectedTravelerId}
                        onValueChange={handleTravelerSelect}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a traveler to autofill" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Select a traveler...
                          </SelectItem>
                          {userProfile && (
                            <SelectItem value="myself" className="font-medium">
                              Myself ({userProfile.name})
                            </SelectItem>
                          )}
                          {travelers.map(t => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.personalInfo?.firstName}{' '}
                              {t.personalInfo?.lastName} ({t.relation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-blue-600 mt-2">
                        Select a traveler to automatically fill personal
                        details.
                      </p>
                    </div>
                  )}

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter First Name"
                        className="mt-2 capitalize"
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e =>
                          setFormData(p => ({ ...p, lastName: e.target.value }))
                        }
                        placeholder="Enter Last Name"
                        className="mt-2 capitalize"
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e =>
                          setFormData(p => ({ ...p, email: e.target.value }))
                        }
                        placeholder="Enter Email"
                        className="mt-2"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => {
                          // Allow +, numbers, spaces, and hyphens
                          const value = e.target.value.replace(/[^\d\s+-]/g, '')
                          setFormData(p => ({ ...p, phone: value }))
                        }}
                        placeholder="+91 XXXXXXXXXX"
                        className="mt-2"
                        maxLength={20}
                      />
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nationality">
                        Nationality <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            nationality: e.target.value,
                          }))
                        }
                        placeholder="Enter Nationality"
                        className="mt-2 capitalize"
                      />
                      {errors.nationality && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.nationality}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="occupation">
                        Occupation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            occupation: e.target.value,
                          }))
                        }
                        placeholder="Enter Occupation"
                        className="mt-2 capitalize"
                      />
                      {errors.occupation && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.occupation}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="passportNumber">
                        Passport Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="passportNumber"
                        value={formData.passportNumber}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            passportNumber: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="Enter Passport Number"
                        className="mt-2 uppercase"
                      />
                      {errors.passportNumber && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.passportNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="passportExpiry">
                        Passport Expiry Date{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="passportExpiry"
                        type="date"
                        value={formData.passportExpiry}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            passportExpiry: e.target.value,
                          }))
                        }
                        className="mt-2"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.passportExpiry && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.passportExpiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={purpose || ''}
                        onChange={e =>
                          router.replace(
                            `?purpose=${encodeURIComponent(e.target.value)}`
                          )
                        }
                        placeholder="Enter Purpose"
                        className="mt-2 capitalize"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            startDate: e.target.value,
                          }))
                        }
                        className="mt-2"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={e =>
                          setFormData(p => ({
                            ...p,
                            endDate: e.target.value,
                          }))
                        }
                        className="mt-2"
                        min={
                          formData.startDate ||
                          new Date().toISOString().split('T')[0]
                        }
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4">
                    <Label
                      htmlFor="additionalInfo"
                      className="text-gray-700 font-medium"
                    >
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any additional information you'd like to share..."
                      value={additionalInfo}
                      onChange={handleAdditionalInfo}
                      className="mt-2 border-gray-300 focus:border-brand-secondary focus:ring-brand-secondary"
                      rows={3}
                    />
                  </div>
                  {/* Unified uploads: render all requirements including passport/photo */}
                  {requirements.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {requirements.map(req => {
                        const { accept } = formatsToAcceptAttr(
                          req.formats || []
                        )
                        const inputId = `doc-${req.key}`

                        const onOpenPicker = () => {
                          document.getElementById(inputId)?.dispatchEvent(
                            new MouseEvent('click', {
                              bubbles: true,
                              cancelable: true,
                              view: window,
                            })
                          )
                        }

                        const onChangeHandler = (
                          e: React.ChangeEvent<HTMLInputElement>
                        ) => onDynamicSelected(req.key, req, e)

                        const hasFile = !!otherFiles[req.key]
                        const previewSrc = otherPreviews[req.key]
                        const fileName = otherFiles[req.key]?.name
                        const clearHandler = () => clearDynamicFile(req.key)
                        const errorText = docErrors[req.key]

                        return (
                          <Card
                            key={req.key}
                            className="relative overflow-hidden border-2 hover:border-brand-primary/50 transition-colors"
                          >
                            <input
                              id={inputId}
                              type="file"
                              accept={accept}
                              className="hidden"
                              onChange={onChangeHandler}
                            />

                            {/* Document Name Header */}
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                                <span>
                                  {req.label}
                                  {req.mandatory && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </span>
                                {hasFile && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-0 pb-4">
                              {/* Image Display Area */}
                              <div className="relative w-full aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden mb-4 flex items-center justify-center">
                                {hasFile && previewSrc ? (
                                  // Uploaded Preview
                                  <>
                                    <img
                                      src={previewSrc}
                                      alt={`${req.label} preview`}
                                      className="w-full h-full object-contain"
                                    />
                                    <Button
                                      aria-label="Remove"
                                      variant="destructive"
                                      size="icon"
                                      onClick={clearHandler}
                                      className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : hasFile && !previewSrc ? (
                                  // File name for non-image files
                                  <div className="text-center p-4">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">
                                      {fileName}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={clearHandler}
                                      className="mt-2 text-red-500 hover:text-red-600"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                ) : req.exampleImage &&
                                  req.exampleImage.trim() !== '' ? (
                                  // Example Image
                                  <>
                                    <img
                                      src={req.exampleImage}
                                      alt={`${req.label} example`}
                                      className="w-full h-full object-contain p-2"
                                      onError={e => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded-full">
                                      <span className="text-xs text-gray-500 font-medium">
                                        Example
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  // Placeholder when no example
                                  <div className="text-center p-4">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">
                                      No example available
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Choose File Button */}
                              {!hasFile && (
                                <Button
                                  variant="outline"
                                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
                                  onClick={onOpenPicker}
                                >
                                  <Upload className="w-4 h-4" />
                                  Choose File
                                </Button>
                              )}

                              {/* Format Info */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center">
                                  <span className="font-medium">Formats:</span>{' '}
                                  {(req.formats || []).join(', ').toUpperCase()}
                                  {' | '}
                                  <span className="font-medium">
                                    Max size:
                                  </span>{' '}
                                  {req.maxSizeMB || MAX_FILE_MB}MB
                                  {req.imageSpec?.widthPx &&
                                    req.imageSpec?.heightPx && (
                                      <>
                                        {' | '}
                                        <span className="font-medium">
                                          Required:
                                        </span>{' '}
                                        {req.imageSpec.widthPx}x
                                        {req.imageSpec.heightPx}px
                                      </>
                                    )}
                                </p>
                              </div>

                              {/* Error Message */}
                              {errorText && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-xs text-red-600 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    {errorText}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <ReviewPage
                  formData={formData}
                  // @ts-ignore - pass docs preview info for review
                  documents={{
                    additionalInfo: additionalInfo,
                    passport: otherFiles['passport']
                      ? {
                          name: otherFiles['passport']!.name,
                          preview: otherPreviews['passport'],
                        }
                      : undefined,
                    photo: otherFiles['photo']
                      ? {
                          name: otherFiles['photo']!.name,
                          preview: otherPreviews['photo'],
                        }
                      : undefined,
                    additionalDocs: Object.fromEntries(
                      Object.entries(otherFiles)
                        .filter(
                          ([key, f]) =>
                            !!f && key !== 'passport' && key !== 'photo'
                        )
                        .map(([key, f]) => [
                          key,
                          { name: f!.name, preview: otherPreviews[key] },
                        ])
                    ),
                  }}
                  onEdit={() => handleStepChange(1)}
                />
              </>
            )}

            {step === 3 && selectedVisaId && (
              <PaymentComponent
                visaPrice={(() => {
                  const selectedVisaData = visaOptions.find(
                    v => v.value === selectedVisaId
                  )
                  const price = selectedVisaData?.price || '0'

                  return price.toString()
                })()}
                method={method}
                setMethod={setMethod}
                onTotalAmountChange={setTotalAmount}
                onCouponDiscountChange={setCouponDiscount}
                country={(() => {
                  const selectedVisaData = visaOptions.find(
                    v => v.value === selectedVisaId
                  )
                  return selectedVisaData?.label || ''
                })()}
                visaType={purpose || ''}
                trackingId={trackingId}
                visaId={selectedVisaId}
                documentFiles={(() => {
                  const files = Object.entries(otherFiles)
                    .filter(([_, file]) => file !== null)
                    .reduce(
                      (acc, [key, file]) => {
                        acc[key] = file
                        return acc
                      },
                      {} as Record<string, File | null>
                    )

                  return files
                })()}
              />
            )}

            {/* Navigation Buttons */}
            <div
              className={`flex items-center w-full ${step === 1 ? 'justify-end' : 'justify-between'}`}
            >
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => handleStepChange(step - 1)}
                  disabled={isTransitioning}
                >
                  ← Previous
                </Button>
              )}

              {step === 1 && (
                <Button
                  className="bg-brand-primary hover:bg-brand-dark text-white px-8 py-2"
                  onClick={() => {
                    // Validate Step 1 fields before moving to Step 2
                    if (!validateStep1()) {
                      return
                    }
                    // Also validate documents if requirements are loaded
                    if (requirements.length > 0 && !validateStep2()) {
                      // Show toast for missing documents
                      const missingDocs = requirements.filter(
                        req => req.mandatory && !otherFiles[req.key]
                      )
                      if (missingDocs.length > 0) {
                        toast({
                          title: 'Missing required documents',
                          description: `Please upload: ${missingDocs.map(d => d.label).join(', ')}`,
                          variant: 'destructive',
                          duration: 5000,
                        })
                      }
                      return
                    }
                    handleStepChange(2)
                  }}
                  disabled={isTransitioning}
                >
                  Next →
                </Button>
              )}

              {step === 2 && (
                <div className="flex items-center justify-center  gap-10">
                  <Button
                    className="bg-brand-primary hover:bg-brand-dark text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()

                      // Additional client-side guard
                      if (
                        submitting ||
                        isTransitioning ||
                        isSubmittingRef.current
                      ) {
                        return
                      }

                      handleSubmitPending()
                    }}
                    disabled={
                      submitting || isTransitioning || isSubmittingRef.current
                    }
                  >
                    {submitting || isSubmittingRef.current ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Application Modal */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pending Application Found</DialogTitle>
            <DialogDescription>
              We found a pending application for{' '}
              {pendingApp?.visaDetails?.country}
              {pendingApp?.personalInfo?.firstName
                ? ` for ${pendingApp.personalInfo.firstName}`
                : ''}
              . Would you like to resume where you left off?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <div className="text-sm text-gray-500">
              <p>
                <strong>Tracking ID:</strong> {pendingApp?.trackingId}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {pendingApp?.createdAt
                  ? new Date(pendingApp.createdAt).toLocaleDateString()
                  : ''}
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setResumeModalOpen(false)

                // Clear local storage items for previous application
                if (typeof window !== 'undefined') {
                  // Add this application to ignored drafts so it doesn't pop up again
                  if (pendingApp?._id) {
                    try {
                      const ignored = JSON.parse(
                        localStorage.getItem('ignoredDrafts') || '[]'
                      )
                      if (!ignored.includes(pendingApp._id)) {
                        ignored.push(pendingApp._id)
                        localStorage.setItem(
                          'ignoredDrafts',
                          JSON.stringify(ignored)
                        )
                      }
                    } catch (e) {}
                  }

                  localStorage.removeItem('visaApplicationFormData')
                  localStorage.removeItem('visaApplicationAdditionalInfo')
                  localStorage.removeItem('visaApplicationSelectedVisaId')
                  localStorage.removeItem('visaApplicationStep')
                  localStorage.removeItem('visaApplicationTrackingId')
                  localStorage.removeItem('visaApplicationId')
                  sessionStorage.removeItem('visaApplicationId')

                  // Clear query params if any
                  const url = new URL(window.location.href)
                  url.searchParams.delete('resume')
                  window.history.replaceState({}, '', url)
                }

                // Reset state
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  nationality: '',
                  occupation: '',
                  passportNumber: '',
                  passportExpiry: '',
                  purpose: '',
                  startDate: '',
                  endDate: '',
                  selectedVisaId: countryFromQuery || '',
                })
                setSelectedVisaId(countryFromQuery || '')
                setAdditionalInfo('')
                setStep(1)
              }}
            >
              Start New Application
            </Button>
            <Button
              className="bg-brand-primary text-white"
              onClick={() => {
                if (pendingApp?._id) {
                  handleResumeApplication(pendingApp._id)
                }
              }}
              disabled={isResuming}
            >
              {isResuming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resuming...
                </>
              ) : (
                'Resume Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApplyPageContent
