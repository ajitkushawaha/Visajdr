'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VisaForm from '@/components/admin/VisaForm'

export const dynamic = 'force-dynamic'

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

  // Schedule Information

  // Documents
  documents: {
    [key: string]: boolean // Dynamic document types from config
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

// Dynamic visa types will be fetched from API

export default function CreateVisaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('visa-detail')
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string
  }>({})
  const [visaConfigs, setVisaConfigs] = useState<any>({
    visaTypes: [],
    documentTypes: [],
    visaCategories: [],
    processingTimeTypes: [],
    occupancyTypes: [],
  })
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)

  useEffect(() => {
    const fetchVisaConfigs = async () => {
      setIsLoadingConfigs(true)
      try {
        const response = await fetch('/api/public/visa-config')
        const result = await response.json()
        if (result.success) {
          setVisaConfigs(result.data)
        }
      } catch (error) {
        console.error('Error fetching visa configs:', error)
      } finally {
        setIsLoadingConfigs(false)
      }
    }

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

    fetchVisaConfigs()
    fetchCountries()
  }, [])

  // Initialize documents dynamically based on active document types
  useEffect(() => {
    if (visaConfigs.documentTypes && visaConfigs.documentTypes.length > 0) {
      const activeDocTypes = visaConfigs.documentTypes.filter(
        (doc: any) => doc.isActive
      )
      const initialDocuments: { [key: string]: boolean } = {}
      activeDocTypes.forEach((doc: any) => {
        initialDocuments[doc.slug] = formData.documents[doc.slug] || false
      })
      // Preserve existing document selections
      setFormData(prev => ({
        ...prev,
        documents: { ...initialDocuments, ...prev.documents },
      }))
    }
  }, [visaConfigs.documentTypes])

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
      processInitiationDays: 0,
      applicationReview: 'Application review and document verification.',
      applicationReviewDays: 1,
      appointmentPicked: 'Appointment date will be confirmed.',
      appointmentPickedDays: 2,
      biometricDay: 'Biometric appointment day.',
      biometricDayDays: 5,
      enableAppointmentStep: false,
      enableBiometricStep: false,
    },
    documentRequirements: {
      generalNote:
        'This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases.',
      passportRequirements:
        'Original passport issued within 10 years, valid for 6 months beyond the last intended date of departure, at least 2 blank visa pages, no alterations in data pages.',
      photographRequirements:
        'Three recent colored passport size (35x45mm) photographs with plain white background, no scanned or unclear images.',
      accommodationRequirements:
        'Hotel or Cruise voucher, Invitation letter + ID + financials if staying with friend/relative.',
      flightRequirements: 'Confirmed round-trip flight reservations.',
      itineraryRequirements: 'Day-wise itinerary or travel agent letter.',
      insuranceRequirements:
        'Minimum 30,000 Euros / 50,000 USD coverage, must cover entire stay in Schengen territory.',
      fundsRequirements:
        'Last 6 months bank statement (attested), recent, dated within 1 week.',
      itrRequirements: 'Last 3 years of returns.',
      coverLetterRequirements:
        'A4 paper (employed) or business letterhead (self-employed).',
      employmentRequirements: 'On official letterhead with employment details.',
      nocRequirements: 'From school/college with ID copy (for students).',
      gstRequirements: 'If self-employed.',
      leaveRequirements: 'From company with employment ID.',
      biometricRequirements: 'Mandatory for first-time Schengen applicants.',
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

  const validateField = (field: keyof VisaFormData, value: string) => {
    const errors: { [key: string]: string } = {}

    switch (field) {
      case 'country':
        if (!value) errors.country = 'Country is required'
        break
      case 'visaType':
        if (!value) errors.visaType = 'Visa type is required'
        break
      case 'adultPrice':
        if (!value) errors.adultPrice = 'Adult price is required'
        else if (isNaN(Number(value)) || Number(value) <= 0) {
          errors.adultPrice = 'Adult price must be a positive number'
        }
        break
      case 'childPrice':
        if (!value) errors.childPrice = 'Child price is required'
        else if (isNaN(Number(value)) || Number(value) <= 0) {
          errors.childPrice = 'Child price must be a positive number'
        }
        break
      case 'countryImage':
        if (!value) errors.countryImage = 'Country image URL is required'
        break
      case 'processingTimeValue':
        if (!value)
          errors.processingTimeValue = 'Processing time value is required'
        break
      case 'stayPeriod':
        if (!value) errors.stayPeriod = 'Stay period is required'
        break
      case 'validity':
        if (!value) errors.validity = 'Validity is required'
        break
      case 'visaDetail':
        if (!value) errors.visaDetail = 'Visa details are required'
        break
      case 'metaTitle':
        if (!value) errors.metaTitle = 'Meta title is required'
        else if (value.length > 60) {
          errors.metaTitle = 'Meta title should be 60 characters or less'
        }
        break
      case 'metaDescription':
        if (!value) errors.metaDescription = 'Meta description is required'
        else if (value.length > 160) {
          errors.metaDescription =
            'Meta description should be 160 characters or less'
        }
        break
    }

    return errors
  }

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

      // Validate country field
      const fieldErrors = validateField('country', value.name)
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors,
      }))
    } else {
      // Handle regular string values
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))

      // Validate the field
      const fieldErrors = validateField(field, value as string)
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors,
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

  const validateForm = () => {
    const errors: string[] = []

    // Required field validations
    if (!formData.country) errors.push('Country is required')
    if (!formData.visaType) errors.push('Visa type is required')
    if (!formData.adultPrice) errors.push('Adult price is required')
    if (!formData.childPrice) errors.push('Child price is required')
    if (!formData.processingTimeValue)
      errors.push('Processing time value is required')
    if (!formData.stayPeriod) errors.push('Stay period is required')
    if (!formData.validity) errors.push('Validity is required')
    if (!formData.visaDetail) errors.push('Visa details are required')
    if (!formData.metaTitle) errors.push('Meta title is required')
    if (!formData.metaDescription) errors.push('Meta description is required')

    // Numeric validations
    if (
      formData.adultPrice &&
      (isNaN(Number(formData.adultPrice)) || Number(formData.adultPrice) <= 0)
    ) {
      errors.push('Adult price must be a positive number')
    }
    if (
      formData.childPrice &&
      (isNaN(Number(formData.childPrice)) || Number(formData.childPrice) <= 0)
    ) {
      errors.push('Child price must be a positive number')
    }

    // Length validations
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      errors.push('Meta title should be 60 characters or less')
    }
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.push('Meta description should be 160 characters or less')
    }

    // Document validation
    const hasRequiredDocuments = Object.values(formData.documents).some(
      doc => doc === true
    )
    if (!hasRequiredDocuments) {
      errors.push('At least one document type must be selected')
    }

    return errors
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Validate form
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        alert(
          `Please fix the following errors:\n\n${validationErrors.join('\n')}`
        )
        setIsLoading(false)
        return
      }

      // Simulate API call to save to database
      const response = await fetch('/api/admin/create-visa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Visa information saved successfully!')
        router.push('/admin/visa/list')
      } else {
        throw new Error('Failed to save visa information')
      }
    } catch (error) {
      console.error('Error saving visa:', error)
      alert('Error saving visa information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Visa
              </h1>
              <p className="text-gray-600 mt-2">
                Add visa information and pricing details
              </p>
            </div>
          </div>
        </div>
        <VisaForm
          setFormData={data => setFormData(data)}
          formData={formData}
          handleDocumentChange={handleDocumentChange}
          handleSave={handleSave}
          handleInputChange={handleInputChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          countries={countries}
          visaTypes={visaConfigs.visaTypes.map((vt: any) => vt.name)}
          documentTypes={visaConfigs.documentTypes}
          categories={visaConfigs.visaCategories}
          processingTimeTypes={visaConfigs.processingTimeTypes}
          occupancyTypes={visaConfigs.occupancyTypes}
          isLoading={isLoading}
          isLoadingCountries={isLoadingCountries}
          validationErrors={validationErrors}
        />
      </main>
    </div>
  )
}
