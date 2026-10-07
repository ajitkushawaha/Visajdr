'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import VisaForm from '@/components/admin/VisaForm'

interface VisaFormData {
  // Basic Information
  country: string
  countryFlag: string
  countryCode: string
  countryImage: string
  visaType: string
  adultPrice: string
  childPrice: string
  processingFee: string
  status: string

  // Processing Information
  processingTimeDays: string
  processingTimeValue: string
  processingTimeQuote: string
  stayPeriod: string
  validity: string
  eVisa: string
  category: string
  hotListed: string
  restListed: string
  occupancyType: string

  // Documents (dynamic - can have any document type)
  documents: {
    [key: string]: boolean
  }

  // Content Tabs
  visaDetail: string
  visaDocument: string
  planDisclaimer: string
  inclusions: string
  importantInformation: string

  // Quotation Page Content
  visaSchedule?: {
    processInitiation: string
    processInitiationDays?: number
    applicationReview: string
    applicationReviewDays?: number
    appointmentPicked: string
    appointmentPickedDays?: number
    biometricDay: string
    biometricDayDays?: number
    appliedToEmbassy?: string
    appliedToEmbassyDays?: number
    enableAppointmentStep?: boolean
    enableBiometricStep?: boolean
  }
  documentRequirements?: {
    generalNote?: string
    [key: string]: string | undefined
  }
  operatingSchedule?: {
    visa4Hours?: string
    embassyHours?: string
    publicHolidaysNote?: string
  }
  faq?: Array<{
    question: string
    answer: string
    order: number
  }>

  // SEO Meta
  metaRobots: string
  metaTitle: string
  metaKeyword: string
  metaDescription: string
}

interface Country {
  name: string
  flag: string
  code: string
  image: string
}

// Visa types will be fetched dynamically from the database

export default function UpdateVisaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('visa-detail')
  const [originalData, setOriginalData] = useState<any>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [visaTypes, setVisaTypes] = useState<string[]>([])
  const [isLoadingVisaTypes, setIsLoadingVisaTypes] = useState(false)
  const [visaConfigs, setVisaConfigs] = useState<any>({
    visaTypes: [],
    documentTypes: [],
    visaCategories: [],
    processingTimeTypes: [],
    occupancyTypes: [],
  })
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)

  const [formData, setFormData] = useState<VisaFormData>({
    country: '',
    countryFlag: '',
    countryCode: '',
    countryImage: '',
    visaType: '',
    adultPrice: '',
    childPrice: '',
    processingFee: '0',
    status: 'active',
    processingTimeDays: 'in-days',
    processingTimeValue: '',
    processingTimeQuote: '',
    stayPeriod: '',
    validity: '',
    eVisa: 'false',
    category: 'standard',
    hotListed: 'true',
    restListed: 'false',
    occupancyType: 'single',
    documents: {},
    visaDetail: '',
    visaDocument: '',
    planDisclaimer: '',
    inclusions: '',
    importantInformation: '',
    visaSchedule: {
      processInitiation:
        'Our representative will connect with you, if required.',
      applicationReview: 'Application review and document verification.',
      appointmentPicked: 'Appointment date will be confirmed.',
      biometricDay: 'Biometric appointment day.',
      appliedToEmbassy: 'Application submitted to embassy.',
    },
    documentRequirements: {
      generalNote:
        'This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases.',
    },
    operatingSchedule: {
      visa4Hours: '10:00 AM - 7:00 PM (Mon-Sat)',
      embassyHours: '9:00 AM - 5:00 PM (Mon-Fri)',
      publicHolidaysNote:
        'Visa processing timelines may vary as per public holidays observed in both India and your intended destination country.',
    },
    faq: [],
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: '',
    metaKeyword: '',
    metaDescription: '',
  })

  useEffect(() => {
    if (!id) return

    const fetchVisaData = async () => {
      setIsLoadingData(true)
      try {
        const res = await fetch(`/api/admin/visa/${id}/view`)
        if (!res.ok) {
          throw new Error(`Error fetching visa data: ${res.status}`)
        }
        const data = await res.json()

        setOriginalData(data)
        setFormData({
          country: data?.country || '',
          countryFlag: data?.countryFlag || '',
          countryCode: data?.countryCode || '',
          countryImage: data?.countryImage || '',
          visaType: data?.visaType ? data.visaType.trim() : '',
          adultPrice: data.adultPrice || '',
          childPrice: data.childPrice || '',
          processingFee: data.processingFee || '0',
          status: data.status || 'active',
          processingTimeDays: data.processingTimeDays || 'in-days',
          processingTimeValue: data.processingTimeValue || '',
          processingTimeQuote: data.processingTimeQuote || '',
          stayPeriod: data.stayPeriod || '',
          validity: data.validity || '',
          eVisa: data.eVisa || 'false',
          category: data.category || 'standard',
          hotListed: data.hotListed || 'true',
          restListed: data.restListed || 'false',
          occupancyType: data.occupancyType || 'single',
          documents: (() => {
            // Convert document values to booleans if they're stored as strings
            const docs = data.documents || {}
            const normalizedDocs: { [key: string]: boolean } = {}
            Object.keys(docs).forEach(key => {
              // Handle both boolean and string "true"/"false" values
              if (
                docs[key] === true ||
                docs[key] === 'true' ||
                docs[key] === 1
              ) {
                normalizedDocs[key] = true
              } else {
                normalizedDocs[key] = false
              }
            })
            return normalizedDocs
          })(),
          visaDetail: data.visaDetail || '',
          visaDocument: data.visaDocument || '',
          planDisclaimer: data.planDisclaimer || '',
          inclusions: data.inclusions || '',
          importantInformation: data.importantInformation || '',
          visaSchedule: {
            processInitiation:
              data.visaSchedule?.processInitiation ||
              'Our representative will connect with you, if required.',
            processInitiationDays:
              data.visaSchedule?.processInitiationDays ?? 0,
            applicationReview:
              data.visaSchedule?.applicationReview ||
              'Application review and document verification.',
            applicationReviewDays:
              data.visaSchedule?.applicationReviewDays ?? 1,
            appointmentPicked:
              data.visaSchedule?.appointmentPicked ||
              'Appointment date will be confirmed.',
            appointmentPickedDays:
              data.visaSchedule?.appointmentPickedDays ?? 2,
            biometricDay:
              data.visaSchedule?.biometricDay || 'Biometric appointment day.',
            biometricDayDays: data.visaSchedule?.biometricDayDays ?? 5,
            appliedToEmbassy:
              data.visaSchedule?.appliedToEmbassy ||
              'Application submitted to embassy.',
            appliedToEmbassyDays: data.visaSchedule?.appliedToEmbassyDays ?? 0,
            enableAppointmentStep:
              data.visaSchedule?.enableAppointmentStep ?? false,
            enableBiometricStep:
              data.visaSchedule?.enableBiometricStep ?? false,
          },
          documentRequirements: (() => {
            // Preserve all existing document requirements, including dynamic ones
            const existing = data.documentRequirements || {}
            return {
              generalNote:
                existing.generalNote ||
                'This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases.',
              ...existing, // Spread all other fields (passportRequirements, aadharCardRequirements, etc.)
            }
          })(),
          operatingSchedule: data.operatingSchedule
            ? {
                ...data.operatingSchedule,
                visa4Hours:
                  data.operatingSchedule.visa4Hours ||
                  '10:00 AM - 7:00 PM (Mon-Sat)',
              }
            : {
                visa4Hours: '10:00 AM - 7:00 PM (Mon-Sat)',
                embassyHours: '9:00 AM - 5:00 PM (Mon-Fri)',
                publicHolidaysNote:
                  'Visa processing timelines may vary as per public holidays observed in both India and your intended destination country.',
              },

          faq: data.faq || [],
          metaRobots: data.metaRobots || 'INDEX, FOLLOW',
          metaTitle: data.metaTitle || '',
          metaKeyword: data.metaKeyword || '',
          metaDescription: data.metaDescription || '',
        })
      } catch (error) {
        console.error(error)
        // optionally set error state here
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchVisaData()
  }, [id])

  // Update country name to match exact country name from countries array
  useEffect(() => {
    if (countries.length > 0 && originalData?.country) {
      const storedCountryName = originalData.country
      const matchedCountry = countries.find(
        c => c.name.toLowerCase() === storedCountryName.toLowerCase()
      )
      if (matchedCountry && matchedCountry.name !== formData.country) {
        setFormData(prev => ({
          ...prev,
          country: matchedCountry.name,
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, originalData]) // Run when countries are loaded or originalData changes

  // Fetch visa configs (types, document types, categories, etc.)
  useEffect(() => {
    const fetchVisaConfigs = async () => {
      setIsLoadingConfigs(true)
      setIsLoadingVisaTypes(true)
      try {
        const res = await fetch('/api/public/visa-config')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setVisaConfigs(data.data)
            if (data.data.visaTypes) {
              const types = data.data.visaTypes.map((type: any) => type.name)
              setVisaTypes(types)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch visa configs:', error)
        // Fallback to default visa types
        setVisaTypes([
          'Tourist',
          'Business',
          'Transit',
          'Student',
          'Work',
          'Medical',
          'Family',
        ])
      } finally {
        setIsLoadingConfigs(false)
        setIsLoadingVisaTypes(false)
      }
    }
    fetchVisaConfigs()
  }, [])

  // Initialize documents dynamically based on active document types when they load
  useEffect(() => {
    if (
      visaConfigs.documentTypes &&
      visaConfigs.documentTypes.length > 0 &&
      formData.documents
    ) {
      // Preserve existing document selections from loaded visa data
      const activeDocTypes = visaConfigs.documentTypes.filter(
        (doc: any) => doc.isActive
      )
      const currentDocuments: { [key: string]: boolean } = {}

      // Normalize document keys: match database keys to documentTypes slugs
      activeDocTypes.forEach((docType: any) => {
        const docSlug = docType.slug
        const dbKeys = Object.keys(formData.documents || {})

        // Find matching key from database (case-insensitive, handle variations)
        const findMatchingKey = (slug: string): string | null => {
          // Try exact match
          const exactMatch = dbKeys.find(
            key => key.toLowerCase() === slug.toLowerCase()
          )
          if (exactMatch) return exactMatch

          // Try partial match
          const partialMatch = dbKeys.find(
            key =>
              key.toLowerCase().includes(slug.toLowerCase()) ||
              slug.toLowerCase().includes(key.toLowerCase())
          )
          if (partialMatch) return partialMatch

          // Try normalized match (remove spaces, dashes, etc.)
          const normalizedSlug = slug.toLowerCase().replace(/[-_\s]/g, '')
          const normalizedMatch = dbKeys.find(
            key => key.toLowerCase().replace(/[-_\s]/g, '') === normalizedSlug
          )
          if (normalizedMatch) return normalizedMatch

          return null
        }

        const matchedKey = findMatchingKey(docSlug)
        if (matchedKey) {
          // Use the documentType slug as the key, but preserve the value from database
          const dbValue: any = formData.documents[matchedKey]
          currentDocuments[docSlug] =
            dbValue === true ||
            String(dbValue) === 'true' ||
            Number(dbValue) === 1
        } else {
          // Document type not found in database, set to false
          currentDocuments[docSlug] = false
        }
      })

      // Only update if there are changes to avoid infinite loops
      const hasChanges =
        Object.keys(currentDocuments).some(
          key => currentDocuments[key] !== (formData.documents[key] === true)
        ) ||
        activeDocTypes.some((doc: any) => !(doc.slug in formData.documents))

      if (hasChanges) {
        setFormData(prev => ({
          ...prev,
          documents: currentDocuments,
        }))
      }
    }
  }, [visaConfigs.documentTypes, formData.documents])

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const res = await fetch('/data/countries.json')
        const data = await res.json()
        setCountries(data)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
        // Fallback to some common countries if API fails
        setCountries([
          {
            name: 'United States',
            flag: 'https://flagcdn.com/w40/us.png',
            code: 'us',
            image: 'https://flagcdn.com/w640/us.png',
          },
          {
            name: 'United Kingdom',
            flag: 'https://flagcdn.com/w40/gb.png',
            code: 'gb',
            image: 'https://flagcdn.com/w640/gb.png',
          },
          {
            name: 'Canada',
            flag: 'https://flagcdn.com/w40/ca.png',
            code: 'ca',
            image: 'https://flagcdn.com/w640/ca.png',
          },
          {
            name: 'Australia',
            flag: 'https://flagcdn.com/w40/au.png',
            code: 'au',
            image: 'https://flagcdn.com/w640/au.png',
          },
          {
            name: 'Germany',
            flag: 'https://flagcdn.com/w40/de.png',
            code: 'de',
            image: 'https://flagcdn.com/w640/de.png',
          },
          {
            name: 'France',
            flag: 'https://flagcdn.com/w40/fr.png',
            code: 'fr',
            image: 'https://flagcdn.com/w640/fr.png',
          },
          {
            name: 'Italy',
            flag: 'https://flagcdn.com/w40/it.png',
            code: 'it',
            image: 'https://flagcdn.com/w640/it.png',
          },
          {
            name: 'Spain',
            flag: 'https://flagcdn.com/w40/es.png',
            code: 'es',
            image: 'https://flagcdn.com/w640/es.png',
          },
          {
            name: 'Netherlands',
            flag: 'https://flagcdn.com/w40/nl.png',
            code: 'nl',
            image: 'https://flagcdn.com/w640/nl.png',
          },
          {
            name: 'Singapore',
            flag: 'https://flagcdn.com/w40/sg.png',
            code: 'sg',
            image: 'https://flagcdn.com/w640/sg.png',
          },
        ])
      } finally {
        setIsLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [])

  const handleInputChange = (
    field: keyof VisaFormData,
    value: string | any
  ) => {
    if (field === 'country' && typeof value === 'object') {
      // If a country object is passed, extract the name, flag, code, and image
      setFormData(prev => ({
        ...prev,
        country: value.name,
        countryFlag: value.flag,
        countryCode: value.code,
        // countryImage is not set automatically - user must provide their own
      }))
    } else {
      // Handle regular string values
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleDocumentChange = (document: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [document]: checked,
      },
    }))
  }

  const handleSave = async () => {
    setIsLoadingData(true)

    try {
      // Validate required fields
      if (!formData.country || !formData.visaType || !formData.adultPrice) {
        alert('Please fill in all required fields')
        return
      }

      // Log what we're saving
      console.log('💾 Saving visa data:', {
        visaSchedule: formData.visaSchedule,
        enableAppointmentStep: formData.visaSchedule?.enableAppointmentStep,
        enableBiometricStep: formData.visaSchedule?.enableBiometricStep,
        documents: formData.documents,
        documentRequirements: formData.documentRequirements
          ? Object.keys(formData.documentRequirements)
          : [],
        documentRequirementsSample: formData.documentRequirements
          ? {
              passport:
                formData.documentRequirements.passportRequirements?.substring(
                  0,
                  50
                ),
              aadhar:
                formData.documentRequirements.aadharCardRequirements?.substring(
                  0,
                  50
                ),
            }
          : null,
      })

      // Log what we're saving
      console.log('💾 Saving visa data:', {
        documents: formData.documents,
        documentRequirements: formData.documentRequirements
          ? Object.keys(formData.documentRequirements)
          : [],
        documentRequirementsSample: formData.documentRequirements
          ? {
              passport:
                formData.documentRequirements.passportRequirements?.substring(
                  0,
                  50
                ),
              aadhar:
                formData.documentRequirements.aadharCardRequirements?.substring(
                  0,
                  50
                ),
            }
          : null,
      })

      // Update visa data
      const response = await fetch(`/api/admin/visa/${id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert('Visa information updated successfully!')
        router.push(`/admin/visa/list`)
      } else {
        throw new Error('Failed to update visa information')
      }
    } catch (error) {
      console.error('Error updating visa:', error)
      alert('Error updating visa information. Please try again.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/visa/${id}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Visa deleted successfully!')
        router.push('/admin/visa/list')
      } else {
        throw new Error('Failed to delete visa')
      }
    } catch (error) {
      console.error('Error deleting visa:', error)
      alert('Error deleting visa. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCountryName = (country: string) => {
    return country.charAt(0).toUpperCase() + country.slice(1)
  }

  const formatVisaType = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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
      <main className="container mx-auto px-4 py-2">
        <Link href="/admin/visa/list">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-900 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </Link>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 pt-4">
                  Update{' '}
                  {originalData
                    ? `${formatCountryName(originalData.country)} ${formatVisaType(originalData.visaType)}`
                    : 'Visa'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Update visa information and pricing details
                </p>
              </div>

              {formData.countryImage && (
                <div className="mt-2">
                  <img
                    src={formData.countryImage}
                    alt="Country preview"
                    className="w-20 h-12 object-cover rounded border"
                    onError={e => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Delete Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Visa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the visa "
                      {originalData
                        ? `${formatCountryName(originalData.country)} ${formatVisaType(originalData.visaType)}`
                        : 'visa'}
                      " and remove all associated data from our servers.
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
                        'Delete Visa'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <VisaForm
          formData={formData}
          setFormData={setFormData}
          handleDocumentChange={handleDocumentChange}
          handleSave={handleSave}
          handleInputChange={handleInputChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          countries={countries}
          visaTypes={visaTypes}
          documentTypes={visaConfigs.documentTypes}
          categories={visaConfigs.visaCategories}
          processingTimeTypes={visaConfigs.processingTimeTypes}
          occupancyTypes={visaConfigs.occupancyTypes}
          isLoading={isLoadingData}
          isUpdate={true}
          isLoadingCountries={isLoadingCountries}
          isLoadingVisaTypes={isLoadingVisaTypes}
        />
      </main>
    </div>
  )
}
