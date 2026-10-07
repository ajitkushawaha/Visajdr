'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  User,
  FileText,
  Camera,
  FileCheck,
  Plane,
  Building2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import AccordionItem from '@/components/ui/AccordionItem'
import { slugify } from '@/utils/slugify'
import VisaScheduleTimeline from '@/components/ui/VisaScheduleTimeline'
import { format, addDays } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Document labels mapping
const documentLabels: { [key: string]: string } = {
  passport: 'Passport',
  aadharCard: 'Aadhar Card',
  birthCertificate: 'Birth Certificate',
  panCard: 'PAN Card',
  dl: 'Driving License',
  tl: 'Travel License',
  schoolMarksheet: 'School Marksheet',
  id: 'ID Card',
  test: 'Test Document',
}

// Function to generate beautiful gradients for different countries
function getCountryGradient(countryName: string) {
  const gradients: { [key: string]: { from: string; to: string } } = {
    'United States': { from: '#FF6B6B', to: '#4ECDC4' },
    'United Kingdom': { from: '#667eea', to: '#764ba2' },
    Canada: { from: '#f093fb', to: '#f5576c' },
    Australia: { from: '#4facfe', to: '#00f2fe' },
    France: { from: '#43e97b', to: '#38f9d7' },
  }

  // Try to find exact match first
  if (gradients[countryName]) {
    return gradients[countryName]
  }

  // Try to find partial match
  const partialMatch = Object.keys(gradients).find(
    key =>
      countryName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(countryName.toLowerCase())
  )

  if (partialMatch) {
    return gradients[partialMatch]
  }

  // Default gradient for unknown countries
  return { from: '#667eea', to: '#764ba2' }
}

type Props = {
  visa: any // The full visa object from the database
  readableCountry: string
  countryImage?: string
  countryCode?: string
}

export default function QuotationClient({
  visa,
  readableCountry,
  countryImage,
  countryCode,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState('planDetails')
  const [loadingContent, setLoadingContent] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<
    Array<{
      slug: string
      displayName: string
      name: string
      exampleImage?: string
      icon?: string
    }>
  >([])
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const params = useParams()

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }
  console.log(visa)
  const slug = params?.country as string
  let [country, countryId] = slug ? slug.split('-') : [undefined, undefined]

  // Debug: Log image URL when component mounts or image changes
  useEffect(() => {
    if (countryImage) {
      setImageError(false)
    } else {
      console.warn('⚠️ No countryImage provided')
    }
  }, [countryImage])

  const sidebarItems = [
    { id: 'planDetails', label: 'Plan Details' },
    { id: 'planDisclaimer', label: 'Plan Disclaimer' },
    { id: 'visaSchedule', label: 'Visa Schedule' },
    { id: 'documentsRequired', label: 'Documents Required' },
    { id: 'importantInformation', label: 'Important Information' },
    { id: 'faq', label: 'FAQ' },
  ]

  // Fetch document types for document icons - no cache
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingContent(true)
        const configResponse = await fetch('/api/public/visa-config', {
          cache: 'no-store', // No caching - always fetch fresh data
        })
        const configData = await configResponse.json()
        if (configData.success && configData.data?.documentTypes) {
          setDocumentTypes(configData.data.documentTypes)
        }
      } catch (error) {
        console.error('Error fetching document types:', error)
      } finally {
        setLoadingContent(false)
      }
    }

    fetchDocumentTypes()
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('section')
    const observer = new IntersectionObserver(
      entries => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    )
    sections.forEach(section => observer.observe(section))
    return () => sections.forEach(section => observer.unobserve(section))
  }, [])

  // Get list of required documents
  const getRequiredDocuments = (): string[] => {
    const docs: string[] = []
    if (visa?.documents) {
      Object.keys(visa.documents).forEach(key => {
        if (visa.documents[key] === true) {
          const docType = documentTypes.find(dt => dt.slug === key)
          docs.push(docType?.displayName || documentLabels[key] || key)
        }
      })
    }
    return docs
  }

  // Map document slug to document requirement key
  const mapDocumentSlugToRequirementKey = (slug: string): string | null => {
    // Mapping: document slug -> requirement key
    // Note: Case-insensitive matching handles variations (e.g., "aadharCard" and "aadharcard" both work)
    const mapping: { [key: string]: string } = {
      passport: 'passportRequirements',
      photograph: 'photographRequirements',
      photo: 'photographRequirements',
      flight: 'flightRequirements',
      accommodation: 'accommodationRequirements',
      itinerary: 'itineraryRequirements',
      insurance: 'insuranceRequirements',
      funds: 'fundsRequirements',
      bankStatement: 'fundsRequirements',
      itr: 'itrRequirements',
      incomeTax: 'itrRequirements',
      coverLetter: 'coverLetterRequirements',
      coverletter: 'coverLetterRequirements',
      employment: 'employmentRequirements',
      employmentLetter: 'employmentLetterRequirements',
      employmentletter: 'employmentLetterRequirements',
      noc: 'nocRequirements',
      gst: 'gstRequirements',
      leave: 'leaveRequirements',
      biometric: 'biometricRequirements',
      aadharCard: 'aadharCardRequirements',
      // Note: "aadharcard" (lowercase) will match "aadharCard" due to case-insensitive matching below
      panCard: 'panCardRequirements',
      // Note: "pancard" (lowercase) will match "panCard" due to case-insensitive matching below
      birthCertificate: 'birthCertificateRequirements',
      // Note: "birthcertificate" (lowercase) will match "birthCertificate" due to case-insensitive matching below
      schoolMarksheet: 'schoolMarksheetRequirements',
      // Note: "schoolmarksheet" (lowercase) will match "schoolMarksheet" due to case-insensitive matching below
    }

    // Normalize slug (lowercase, remove spaces/dashes) for case-insensitive matching
    const normalizedSlug = slug.toLowerCase().replace(/[-_\s]/g, '')

    // Try exact match first (case-insensitive)
    // This handles both "aadharCard" and "aadharcard" -> both match and return "aadharCardRequirements"
    const exactMatch = Object.keys(mapping).find(
      key => key.toLowerCase().replace(/[-_\s]/g, '') === normalizedSlug
    )
    if (exactMatch) {
      return mapping[exactMatch]
    }

    // Try partial match (e.g., "passport_copy" -> "passport")
    for (const [key, value] of Object.entries(mapping)) {
      const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '')
      if (
        normalizedSlug.includes(normalizedKey) ||
        normalizedKey.includes(normalizedSlug)
      ) {
        return value
      }
    }

    // For new/custom document types, convert slug to camelCase + "Requirements"
    // Handle special case: if slug is all lowercase and contains "card", "letter", etc., convert properly
    // e.g., "aadharcard" -> "aadharCardRequirements"
    let camelCaseSlug = slug
      .split(/[-_\s]/)
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')

    // Handle special case: all lowercase compound words (e.g., "aadharcard" -> "aadharCard")
    if (
      slug.toLowerCase() === slug &&
      !slug.includes('-') &&
      !slug.includes('_')
    ) {
      const cardMatch = slug.match(
        /^(.+?)(card|letter|marksheet|certificate)$/i
      )
      if (cardMatch) {
        const [, prefix, suffix] = cardMatch
        camelCaseSlug =
          prefix.charAt(0).toLowerCase() +
          prefix.slice(1) +
          suffix.charAt(0).toUpperCase() +
          suffix.slice(1).toLowerCase()
      }
    }

    return `${camelCaseSlug.charAt(0).toLowerCase() + camelCaseSlug.slice(1)}Requirements`
  }

  // Get required document requirement keys based on visa.documents
  // ONLY show documents that are explicitly marked as required in visa.documents
  const getRequiredDocumentKeys = (): string[] => {
    const requiredKeys: string[] = []
    const processedDocuments = new Set<string>() // Track processed documents by normalized slug
    const docReqs = visa?.documentRequirements || {}
    const docReqKeys = Object.keys(docReqs).filter(key => key !== 'generalNote')

    // Only process documents that are explicitly marked as required in visa.documents
    if (visa?.documents) {
      Object.keys(visa.documents).forEach(slug => {
        // Check if document is required (handle both boolean true and string "true")
        const isRequired =
          visa.documents[slug] === true ||
          visa.documents[slug] === 'true' ||
          visa.documents[slug] === 1

        if (isRequired) {
          // Normalize slug to prevent processing the same document twice
          // (e.g., "aadharCard" and "aadharcard" are the same document)
          const normalizedSlug = slug.toLowerCase().replace(/[-_\s]/g, '')

          // Skip if we've already processed this document
          if (processedDocuments.has(normalizedSlug)) {
            return
          }

          // Mark as processed
          processedDocuments.add(normalizedSlug)

          // Try to map to known requirement key
          let requirementKey = mapDocumentSlugToRequirementKey(slug)

          // Try to find matching key in documentRequirements (case-insensitive)
          const matchingKey = docReqKeys.find(key => {
            const normalizedKey = key
              .toLowerCase()
              .replace(/[-_\s]/g, '')
              .replace('requirements', '')
            return (
              normalizedKey === normalizedSlug ||
              normalizedKey.includes(normalizedSlug) ||
              normalizedSlug.includes(normalizedKey)
            )
          })

          // Use the actual key from documentRequirements if found, otherwise use generated key
          if (matchingKey) {
            requirementKey = matchingKey
          } else if (!requirementKey) {
            // If no mapping found, create dynamic key: convert slug to camelCase + "Requirements"
            const camelCaseSlug = slug
              .split(/[-_\s]/)
              .map((word, index) =>
                index === 0
                  ? word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
                  : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join('')
            requirementKey = `${camelCaseSlug.charAt(0).toLowerCase() + camelCaseSlug.slice(1)}Requirements`
          }

          // Only add if the requirement key has content in documentRequirements
          // AND the document is explicitly selected in visa.documents
          if (requirementKey) {
            // Find all matching keys (case-insensitive)
            const normalizedRequirementKey = requirementKey
              .toLowerCase()
              .replace(/[-_\s]/g, '')
            const matchingKeys = docReqKeys.filter(key => {
              const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '')
              return normalizedKey === normalizedRequirementKey
            })

            if (matchingKeys.length > 0) {
              // If multiple matches, prefer camelCase over lowercase
              // e.g., prefer "aadharCardRequirements" over "aadharcardRequirements"
              const camelCaseMatch = matchingKeys.find(k => {
                // Check if key has uppercase letters (camelCase)
                return /[a-z][A-Z]/.test(k)
              })

              // Also try exact match first
              const exactMatch = matchingKeys.find(k => k === requirementKey)

              // Priority: exact match > camelCase > first match
              const actualKey = exactMatch || camelCaseMatch || matchingKeys[0]

              // Check if it has content
              const hasContent =
                docReqs[actualKey] &&
                String(docReqs[actualKey]).trim().length > 0

              // Double-check: verify the document is still marked as required
              // This ensures we only show documents that are explicitly selected
              const isStillRequired =
                visa.documents[slug] === true ||
                visa.documents[slug] === 'true' ||
                visa.documents[slug] === 1

              if (hasContent && isStillRequired) {
                // Check if we already have this key (or a case-insensitive duplicate)
                const alreadyAdded = requiredKeys.some(
                  k =>
                    k.toLowerCase().replace(/[-_\s]/g, '') ===
                    actualKey.toLowerCase().replace(/[-_\s]/g, '')
                )

                if (!alreadyAdded) {
                  requiredKeys.push(actualKey)
                }
              }
            }
          }
        }
      })
    }

    // Final deduplication: remove case-insensitive duplicates, prefer camelCase
    const deduplicatedKeys: string[] = []
    const seenNormalized = new Set<string>()

    requiredKeys.forEach(key => {
      const normalized = key.toLowerCase().replace(/[-_\s]/g, '')
      if (!seenNormalized.has(normalized)) {
        // Check if there's a camelCase version already added
        const existingCamelCase = deduplicatedKeys.find(
          k =>
            k.toLowerCase().replace(/[-_\s]/g, '') === normalized &&
            /[a-z][A-Z]/.test(k)
        )

        if (existingCamelCase) {
          // Keep the camelCase version, skip this one
          return
        }

        // Check if this is camelCase and there's a lowercase version
        const isCamelCase = /[a-z][A-Z]/.test(key)
        if (isCamelCase) {
          // Remove any lowercase version and add this camelCase one
          const lowercaseIndex = deduplicatedKeys.findIndex(
            k =>
              k.toLowerCase().replace(/[-_\s]/g, '') === normalized &&
              k === k.toLowerCase()
          )
          if (lowercaseIndex !== -1) {
            deduplicatedKeys.splice(lowercaseIndex, 1)
          }
        }

        deduplicatedKeys.push(key)
        seenNormalized.add(normalized)
      }
    })

    return deduplicatedKeys
  }

  // Use visa data directly - NO FALLBACKS, show error if data is missing
  // Validate that required data exists and has content
  const hasRequiredData =
    visa &&
    visa.visaSchedule &&
    typeof visa.visaSchedule === 'object' &&
    (visa.visaSchedule.processInitiation ||
      visa.visaSchedule.applicationReview ||
      visa.visaSchedule.appointmentPicked ||
      visa.visaSchedule.biometricDay) &&
    visa.documentRequirements &&
    typeof visa.documentRequirements === 'object' &&
    Object.keys(visa.documentRequirements).length > 0 &&
    visa.operatingSchedule &&
    typeof visa.operatingSchedule === 'object' &&
    (visa.operatingSchedule.visa4Hours ||
      visa.operatingSchedule.embassyHours ||
      visa.operatingSchedule.publicHolidaysNote)

  if (!hasRequiredData) {
    return (
      <div className="min-h-screen bg-theme-light-green py-24 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Data Not Available
          </h2>
          <p className="text-gray-700 mb-2">
            The quotation content for this visa has not been configured yet.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please contact the administrator to set up the quotation page
            content in the admin panel.
          </p>
          <div className="space-y-2 text-left text-xs text-gray-600 bg-gray-50 p-4 rounded mb-4">
            <p>
              <strong>Missing data:</strong>
            </p>
            {(!visa?.visaSchedule || !visa.visaSchedule.processInitiation) && (
              <p>• Visa Schedule</p>
            )}
            {(!visa?.documentRequirements ||
              Object.keys(visa.documentRequirements).length === 0) && (
              <p>• Document Requirements</p>
            )}
            {(!visa?.operatingSchedule ||
              !visa.operatingSchedule.visa4Hours) && (
              <p>• Operating Schedule</p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Use actual visa data directly - no fallbacks
  const displayContent = {
    planDisclaimer: visa.planDisclaimer || '',
    visaSchedule: visa.visaSchedule,
    documentRequirements: visa.documentRequirements,
    importantInformation: visa.importantInformation || '',
    visaDetail: visa.visaDetail || '',
    inclusions: visa.inclusions || '',
    faq:
      visa.faq && Array.isArray(visa.faq) && visa.faq.length > 0
        ? visa.faq
        : [],
    operatingSchedule: {
      ...visa.operatingSchedule,
      visa4Hours: visa.operatingSchedule?.visa4Hours || '',
    },
  }

  const requiredDocumentKeys = getRequiredDocumentKeys()

  // Helper function to get document image/icon from documentTypes
  const getDocumentImage = (requirementKey: string): string | null => {
    // Map requirement key back to document slug
    const reverseMapping: { [key: string]: string[] } = {
      passportRequirements: ['passport'],
      photographRequirements: ['photograph', 'photo'],
      flightRequirements: ['flight'],
      accommodationRequirements: ['accommodation'],
      itineraryRequirements: ['itinerary'],
      insuranceRequirements: ['insurance'],
      fundsRequirements: ['funds', 'bankStatement'],
      itrRequirements: ['itr', 'incomeTax'],
      coverLetterRequirements: ['coverLetter', 'coverletter'],
      employmentRequirements: [
        'employment',
        'employmentLetter',
        'employmentletter',
      ],
      nocRequirements: ['noc'],
      gstRequirements: ['gst'],
      leaveRequirements: ['leave'],
      biometricRequirements: ['biometric'],
      aadharCardRequirements: ['aadharCard', 'aadharcard'],
      aadharcardRequirements: ['aadharCard', 'aadharcard'], // Handle lowercase key
      panCardRequirements: ['panCard', 'pancard'],
      pancardRequirements: ['panCard', 'pancard'], // Handle lowercase key
      birthCertificateRequirements: ['birthCertificate', 'birthcertificate'],
      birthcertificateRequirements: ['birthCertificate', 'birthcertificate'], // Handle lowercase key
      schoolMarksheetRequirements: ['schoolMarksheet', 'schoolmarksheet'],
      schoolmarksheetRequirements: ['schoolMarksheet', 'schoolmarksheet'], // Handle lowercase key
      employmentLetterRequirements: ['employmentLetter', 'employmentletter'],
      employmentletterRequirements: ['employmentLetter', 'employmentletter'], // Handle lowercase key
      coverletterRequirements: ['coverLetter', 'coverletter'], // Handle lowercase key (coverLetterRequirements already defined above)
    }

    // Try known mappings first
    const slugs = reverseMapping[requirementKey] || []
    for (const slug of slugs) {
      // Try exact match
      let docType = documentTypes.find(
        dt => dt.slug === slug || dt.slug.toLowerCase() === slug.toLowerCase()
      )
      if (docType?.exampleImage) return docType.exampleImage
      if (docType?.icon) return docType.icon

      // Try partial match (case-insensitive)
      docType = documentTypes.find(dt => {
        const dtSlug = dt.slug.toLowerCase().replace(/[-_\s]/g, '')
        const searchSlug = slug.toLowerCase().replace(/[-_\s]/g, '')
        return (
          dtSlug === searchSlug ||
          dtSlug.includes(searchSlug) ||
          searchSlug.includes(dtSlug)
        )
      })
      if (docType?.exampleImage) return docType.exampleImage
      if (docType?.icon) return docType.icon
    }

    // For dynamic requirements (e.g., "aadharCardRequirements"), extract slug from key
    if (requirementKey.endsWith('Requirements')) {
      const baseSlug = requirementKey.replace('Requirements', '')
      // Try exact match
      let docType = documentTypes.find(
        dt =>
          dt.slug === baseSlug ||
          dt.slug.toLowerCase() === baseSlug.toLowerCase() ||
          dt.slug.toLowerCase() ===
            baseSlug
              .toLowerCase()
              .replace(/([A-Z])/g, '-$1')
              .toLowerCase()
      )
      if (docType?.exampleImage) return docType.exampleImage
      if (docType?.icon) return docType.icon

      // Try normalized match (remove camelCase, dashes, etc.)
      const normalizedBase = baseSlug.toLowerCase().replace(/[-_\s]/g, '')
      docType = documentTypes.find(dt => {
        const normalizedSlug = dt.slug.toLowerCase().replace(/[-_\s]/g, '')
        return (
          normalizedSlug === normalizedBase ||
          normalizedSlug.includes(normalizedBase) ||
          normalizedBase.includes(normalizedSlug)
        )
      })
      if (docType?.exampleImage) return docType.exampleImage
      if (docType?.icon) return docType.icon
    }

    return null
  }

  // Helper function to get document display name
  const getDocumentDisplayName = (requirementKey: string): string => {
    // Extract slug from requirement key
    let slug = requirementKey.replace('Requirements', '')

    // Try to find in documentTypes
    const docType = documentTypes.find(dt => dt.slug === slug)
    if (docType?.displayName) return docType.displayName
    if (docType?.name) return docType.name

    // Fallback: format slug nicely
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Don't block the entire page - show content progressively
  // The visa data is already available, so we can show the page immediately

  const generateVisaSchedule = () => {
    const today = new Date()
    const schedule = visa.visaSchedule || {}
    const processingBase = parseInt(visa.processingTimeValue) || 15
    const processingTime =
      visa.processingTimeDays === 'schengen'
        ? processingBase * 7
        : processingBase

    const text = visa.operatingSchedule?.visa4Hours || ''
    const m = text.match(/\(([^)]+)\)/)
    const payload = (m ? m[1] : '').toLowerCase()
    const map: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    }
    const set = new Set<number>()
    const rangeMatch = payload.match(
      /(mon|tue|wed|thu|fri|sat|sun)\s*-\s*(mon|tue|wed|thu|fri|sat|sun)/
    )
    if (rangeMatch) {
      const start = map[rangeMatch[1]]
      const end = map[rangeMatch[2]]
      if (start <= end) {
        for (let d = start; d <= end; d++) set.add(d)
      } else {
        for (let d = start; d <= 6; d++) set.add(d)
        for (let d = 0; d <= end; d++) set.add(d)
      }
    } else if (payload) {
      payload.split(/[,\s]+/).forEach((tok: string) => {
        const key = tok.slice(0, 3)
        if (map[key] !== undefined) set.add(map[key])
      })
    }
    if (set.size === 0) {
      for (let d = 1; d <= 6; d++) set.add(d)
    }
    const addBiz = (start: Date, days: number) => {
      const d = new Date(start)
      let added = 0
      while (added < days) {
        d.setDate(d.getDate() + 1)
        if (set.has(d.getDay())) added++
      }
      if (!set.has(d.getDay())) {
        while (!set.has(d.getDay())) d.setDate(d.getDate() + 1)
      }
      return d
    }
    const ensureWorking = (date: Date) => {
      const d = new Date(date)
      if (!set.has(d.getDay())) {
        while (!set.has(d.getDay())) d.setDate(d.getDate() + 1)
      }
      return d
    }

    const steps = []

    // 1. Process Initiation
    steps.push({
      date: format(
        ensureWorking(
          addBiz(today, Math.max(0, schedule.processInitiationDays ?? 0))
        ),
        'dd MMM, yyyy'
      ),
      title: 'Process initiation',
      description: schedule.processInitiation,
      status: 'completed' as const,
    })

    // 2. Application Review
    steps.push({
      date: format(
        ensureWorking(
          addBiz(today, Math.max(0, schedule.applicationReviewDays ?? 1))
        ),
        'dd MMM, yyyy'
      ),
      title: 'Application review',
      description: schedule.applicationReview,
      status: 'completed' as const,
    })

    // 3. Appointment Picked (Optional)
    if (schedule.enableAppointmentStep) {
      steps.push({
        date:
          schedule.appointmentPickedDays === -1
            ? 'To be Confirmed'
            : format(
                ensureWorking(
                  addBiz(
                    today,
                    Math.max(0, schedule.appointmentPickedDays ?? 2)
                  )
                ),
                'dd MMM, yyyy'
              ),
        title: 'Appointment picked',
        description: schedule.appointmentPicked,
        status: 'current' as const,
      })
    }

    // 4. Biometric Day (Optional)
    if (schedule.enableBiometricStep) {
      steps.push({
        date:
          schedule.biometricDayDays === -1
            ? 'To be Confirmed'
            : format(
                ensureWorking(
                  addBiz(today, Math.max(0, schedule.biometricDayDays ?? 5))
                ),
                'dd MMM, yyyy'
              ),
        title: 'Day of biometric',
        description: schedule.biometricDay,
        status: 'current' as const,
      })
    }

    // 5. Applied to Embassy
    // Logic:
    // If Biometric is enabled:
    //    - If Biometric is TBC (-1), then Applied to Embassy is TBC.
    //    - If Biometric has date, Applied to Embassy is usually same day or next day.
    // If Biometric is disabled but Appointment is enabled:
    //    - If Appointment is TBC (-1), then Applied to Embassy is TBC.
    //    - If Appointment has date, Applied to Embassy is same/next day.
    // If both disabled (Standard flow):
    //    - Use Appointment offset (or default 2) as per original logic.

    let appliedToEmbassyDate = 'To be Confirmed'
    let isAppliedToEmbassyTBC = false

    if (schedule.enableBiometricStep) {
      if (schedule.biometricDayDays === -1) {
        appliedToEmbassyDate = 'To be Confirmed'
        isAppliedToEmbassyTBC = true
      } else {
        // If biometric date is set, applied date is that date (or +0)
        appliedToEmbassyDate = format(
          ensureWorking(
            addBiz(today, Math.max(0, schedule.biometricDayDays ?? 5))
          ),
          'dd MMM, yyyy'
        )
      }
    } else if (schedule.enableAppointmentStep) {
      if (schedule.appointmentPickedDays === -1) {
        appliedToEmbassyDate = 'To be Confirmed'
        isAppliedToEmbassyTBC = true
      } else {
        appliedToEmbassyDate = format(
          ensureWorking(
            addBiz(today, Math.max(0, schedule.appointmentPickedDays ?? 2))
          ),
          'dd MMM, yyyy'
        )
      }
    } else {
      // Standard flow
      appliedToEmbassyDate = format(
        ensureWorking(
          addBiz(today, Math.max(0, schedule.appliedToEmbassyDays ?? 0))
        ),
        'dd MMM, yyyy'
      )
    }

    steps.push({
      date: appliedToEmbassyDate,
      title: 'Applied to embassy',
      description:
        schedule.appliedToEmbassy || 'Application submitted to embassy.',
      status: 'current' as const,
      badgeLabel: 'EMBASSY',
    })

    // 6. Application Status
    // Aligned with Home/Select Plan: use processingTime only with business-day schedule.
    // If preceding critical step is TBC, show TBC; otherwise compute based solely on processingTime.
    let statusDate = 'To be Confirmed'
    if (!isAppliedToEmbassyTBC) {
      statusDate = format(
        ensureWorking(addBiz(today, Math.max(0, processingTime || 0))),
        'dd MMM, yyyy'
      )
    }

    steps.push({
      date: statusDate,
      title: 'Application status',
      description: `Estimated completion by ${statusDate === 'To be Confirmed' ? 'TBC' : statusDate}`,
      status: 'pending' as const,
    })

    return steps
  }

  return (
    <div className="min-h-screen relative bg-theme-light-green py-24">
      <div className="flex max-w-6xl max-[600px]:w-[90%] mx-auto bg-white items-start rounded-xl">
        {/* Sidebar */}
        <aside className="w-1/4 sticky top-24 bg-white  rounded-lg max-[600px]:hidden overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-brand-primary capitalize">
              {readableCountry} Visa Application
            </h1>
            <p className="text-gray-600 mt-1">Your Plan Summary is Here</p>
          </div>
          <nav className="p-6">
            <ul className="space-y-1">
              {sidebarItems.map(item => (
                <li className="py-3" key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => {
                      setActiveSection(item.id)
                      setOpenSections(prev => ({ ...prev, [item.id]: true }))
                    }}
                    className={`mb-6 w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main className="w-3/4 max-[600px]:w-full p-2">
          <div className="p-6 border-b block sm:hidden">
            <h1 className="text-2xl font-bold text-brand-primary">
              {readableCountry} Visa Application
            </h1>
            <p className="text-gray-600 mt-1">Your Plan Summary is Here</p>
          </div>

          {/* Banner */}
          <section
            id="planDetails"
            className="relative h-48 overflow-hidden rounded-lg mb-6"
          >
            {countryImage && countryImage.trim() && !imageError ? (
              <>
                <Image
                  src={countryImage}
                  alt={`${readableCountry} landmark`}
                  width={1200}
                  height={400}
                  className="w-full h-full object-cover"
                  sizes="100vw"
                  quality={85}
                  onError={() => {
                    console.error('❌ Image failed to load:', countryImage)
                    setImageError(true)
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully')
                    setImageError(false)
                  }}
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </>
            ) : countryImage && countryImage.trim() ? (
              // Image exists but failed to load - show error message
              <div className="w-full h-full flex items-center justify-center relative bg-gray-200">
                <div className="text-center text-gray-600 p-4">
                  <p className="text-sm">Image failed to load</p>
                  <p className="text-xs mt-1 opacity-75 break-all">
                    {countryImage.substring(0, 50)}...
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, 
                    ${getCountryGradient(readableCountry).from} 0%, 
                    ${getCountryGradient(readableCountry).to} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center text-white">
                  <h2 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                    {readableCountry}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 drop-shadow-md">
                    Visa Application
                  </p>
                  {countryCode && (
                    <div className="mt-3 text-sm opacity-75">
                      {countryCode.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Appointment Highlight */}
          {visa?.appointmentHighlight && (
            <div className="bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-secondary/20 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-brand-secondary" />
              </div>

              <span className="text-brand-primary text-sm">
                {visa?.processingTimeQuote || 'N/A'}.
              </span>
            </div>
          )}

          {/* Plan Summary */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-sm text-brand-primary font-medium">
                Get your appointment in{' '}
                {visa?.processingTimeValue || 'N/A'}{' '}
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">
                {visa?.visaType?.toUpperCase() || 'N/A'}
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">
                {visa?.category?.toUpperCase() || 'STANDARD'}
              </button>
              <div className="ml-auto flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-xl text-brand-primary">
                  ₹{visa?.adultPrice || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 max-[600px]:grid-cols-1 gap-6 text-center">
              <div className="bg-gray-50 rounded-lg border p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Visa Type
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {visa?.visaType || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Stay
                </div>
                <div className="font-semibold text-gray-900">
                  {visa?.stayPeriod || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Validity
                </div>
                <div className="font-semibold text-gray-900">
                  {visa?.validity || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Entry Type
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {visa?.occupancyType || 'N/A'}
                </div>
              </div>
            </div>
          </section>

          {/* Plan Disclaimer */}
          {displayContent.planDisclaimer && (
            <section id="planDisclaimer" className="mb-8">
              <h2 className="text-xl font-semibold text-brand-primary mb-4">
                Plan Disclaimer
              </h2>
              <div className="bg-white rounded-lg border p-6">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {displayContent.planDisclaimer}
                </p>
              </div>
            </section>
          )}

          {/* Visa Schedule & Timings */}
          <section
            id="visaSchedule"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Visa Schedule */}
            <div>
              <div className="relative">
                <VisaScheduleTimeline
                  steps={generateVisaSchedule().slice(0, 4)}
                  title="Visa Schedule"
                  className="max-w-full mx-0 pb-16"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <button
                    onClick={() => setIsScheduleOpen(true)}
                    className="text-brand-primary font-bold text-sm hover:underline"
                  >
                    View More
                  </button>
                </div>
              </div>

              <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      Your Visa Schedule
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <VisaScheduleTimeline
                      steps={generateVisaSchedule()}
                      title=""
                      className="border-none shadow-none p-0"
                    />
                  </div>
                  <div className="mt-6">
                    <Button
                      className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-full py-6 text-lg"
                      onClick={() => setIsScheduleOpen(false)}
                    >
                      Got it!
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Timings & Holidays */}
            <div className="bg-theme-light-green rounded-xl p-6">
              <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timings & Holidays
              </h2>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Operating Schedule */}
                <div className="p-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        Operating Schedule
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium text-gray-900">
                            Visa4:
                          </span>{' '}
                          {displayContent.operatingSchedule.visa4Hours}
                        </p>
                        <p>
                          <span className="font-medium text-gray-900">
                            Embassy:
                          </span>{' '}
                          {displayContent.operatingSchedule.embassyHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Public Holidays */}
                <div className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        Public Holidays
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {displayContent.operatingSchedule.publicHolidaysNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Documents Required */}
          <AccordionItem
            id="documentsRequired"
            title="Documents Required"
            isOpen={!!openSections['documentsRequired']}
            onToggle={() => toggleSection('documentsRequired')}
          >
            <div className="space-y-6">
              {/* Loading state for document types */}
              {loadingContent && documentTypes.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    Loading document requirements...
                  </p>
                </div>
              )}

              {/* Blue Information Banner */}
              {displayContent.documentRequirements.generalNote && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong>{' '}
                    {displayContent.documentRequirements.generalNote}
                  </p>
                </div>
              )}

              {/* Document Checklist with Icons */}
              {!loadingContent && requiredDocumentKeys.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> No specific document requirements
                    have been configured for this visa type. Please contact our
                    support team for detailed document requirements.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 ">
                  {/* Passport - Only show if required */}
                  {requiredDocumentKeys.includes('passportRequirements') &&
                    displayContent.documentRequirements
                      .passportRequirements && (
                      <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getDocumentImage('passportRequirements') ? (
                              <img
                                src={getDocumentImage('passportRequirements')!}
                                alt="Passport"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileCheck className="w-6 h-6 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Passport
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {displayContent.documentRequirements.passportRequirements
                                .split('.')
                                .filter((item: string) => item.trim())
                                .map((item: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-green-600 mt-1">
                                      •
                                    </span>
                                    <span>{item.trim()}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  {/* Photograph - Only show if required */}
                  {requiredDocumentKeys.includes('photographRequirements') &&
                    displayContent.documentRequirements
                      .photographRequirements && (
                      <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getDocumentImage('photographRequirements') ? (
                              <img
                                src={
                                  getDocumentImage('photographRequirements')!
                                }
                                alt="Photograph"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Photograph
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {displayContent.documentRequirements.photographRequirements
                                .split('.')
                                .filter((item: string) => item.trim())
                                .map((item: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-blue-600 mt-1">
                                      •
                                    </span>
                                    <span>{item.trim()}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  {/* Flight Ticket - Only show if required */}
                  {requiredDocumentKeys.includes('flightRequirements') &&
                    displayContent.documentRequirements.flightRequirements && (
                      <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getDocumentImage('flightRequirements') ? (
                              <img
                                src={getDocumentImage('flightRequirements')!}
                                alt="Flight"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Plane className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Flight Ticket
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {displayContent.documentRequirements.flightRequirements
                                .split('.')
                                .filter((item: string) => item.trim())
                                .map((item: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-purple-600 mt-1">
                                      •
                                    </span>
                                    <span>{item.trim()}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Accommodation - Only show if required */}
                  {requiredDocumentKeys.includes('accommodationRequirements') &&
                    displayContent.documentRequirements
                      .accommodationRequirements && (
                      <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getDocumentImage('accommodationRequirements') ? (
                              <img
                                src={
                                  getDocumentImage('accommodationRequirements')!
                                }
                                alt="Accommodation"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Accommodation
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {displayContent.documentRequirements.accommodationRequirements
                                .split('.')
                                .filter((item: string) => item.trim())
                                .map((item: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-orange-600 mt-1">
                                      •
                                    </span>
                                    <span>{item.trim()}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Other Documents - Show all required documents dynamically */}
                  {
                    requiredDocumentKeys
                      .filter(
                        key =>
                          ![
                            'generalNote',
                            'photographRequirements',
                            'passportRequirements',
                            'flightRequirements',
                            'accommodationRequirements',
                          ].includes(key)
                      )
                      .map(key => {
                        // Get documentRequirements as any to access dynamic keys
                        const docReqs =
                          displayContent.documentRequirements as any

                        // Normalize the expected key for matching
                        const normalizedKey = key
                          .toLowerCase()
                          .replace(/[-_\s]/g, '')

                        // Find all matching keys (case-insensitive)
                        const matchingKeys = Object.keys(docReqs).filter(
                          (k: string) => {
                            const normalizedK = k
                              .toLowerCase()
                              .replace(/[-_\s]/g, '')
                            return normalizedK === normalizedKey
                          }
                        )

                        let value: any = null
                        let matchedKey: string | null = null

                        if (matchingKeys.length > 0) {
                          // If multiple matches, prefer camelCase over lowercase
                          // e.g., prefer "aadharCardRequirements" over "aadharcardRequirements"
                          // Check if any key is camelCase (has uppercase letters after first letter)
                          const camelCaseMatch = matchingKeys.find(k => {
                            // Check if key has uppercase letters (camelCase)
                            return /[a-z][A-Z]/.test(k)
                          })

                          // Also try exact match first
                          const exactMatch = matchingKeys.find(k => k === key)

                          // Priority: exact match > camelCase > first match
                          matchedKey =
                            exactMatch || camelCaseMatch || matchingKeys[0]
                          value = docReqs[matchedKey]
                        } else {
                          // Try exact key as fallback
                          value = docReqs[key]
                          matchedKey = key
                        }

                        // Only render if we have a value
                        if (!value || !String(value).trim()) {
                          return null
                        }

                        const docImage = getDocumentImage(key)
                        const displayName = getDocumentDisplayName(key)

                        return (
                          <div
                            key={key}
                            className="bg-white border rounded-xl p-4 mt-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {docImage ? (
                                  <img
                                    src={docImage}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileText className="w-6 h-6 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  {displayName}
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {String(value)
                                    .split('.')
                                    .filter((item: string) => item.trim())
                                    .map((item: string, idx: number) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-2"
                                      >
                                        <span className="text-gray-600 mt-1">
                                          •
                                        </span>
                                        <span>{item.trim()}</span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      })
                      .filter(Boolean) // Remove null entries
                  }
                </div>
              )}
            </div>
          </AccordionItem>

          {/* Visa Details */}
          {displayContent.visaDetail && (
            <AccordionItem
              id="visaDetail"
              title="Visa Details"
              isOpen={!!openSections['visaDetail']}
              onToggle={() => toggleSection('visaDetail')}
            >
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {displayContent.visaDetail}
              </p>
            </AccordionItem>
          )}

          {/* Inclusions */}
          {displayContent.inclusions && (
            <AccordionItem
              id="inclusions"
              title="What's Included"
              isOpen={!!openSections['inclusions']}
              onToggle={() => toggleSection('inclusions')}
            >
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {displayContent.inclusions}
              </p>
            </AccordionItem>
          )}

          {/* Important Information */}
          {displayContent.importantInformation && (
            <AccordionItem
              id="importantInformation"
              title="Important Information"
              isOpen={!!openSections['importantInformation']}
              onToggle={() => toggleSection('importantInformation')}
            >
              <div className="space-y-2 pt-2">
                {displayContent.importantInformation
                  .split(/\n|•|-\s/)
                  .filter((item: string) => item.trim())
                  .map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <Plane className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{item.trim()}</span>
                    </div>
                  ))}
              </div>
            </AccordionItem>
          )}

          {/* FAQ */}
          <AccordionItem
            id="faq"
            title="Frequently Asked Questions"
            isOpen={!!openSections['faq']}
            onToggle={() => toggleSection('faq')}
          >
            {displayContent.faq.length > 0 ? (
              <div className="space-y-4">
                {displayContent.faq
                  .sort(
                    (a: { order: number }, b: { order: number }) =>
                      a.order - b.order
                  )
                  .map(
                    (
                      faq: { question: string; answer: string; order: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-gray-700">{faq.answer}</p>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                FAQ information will be available soon.
              </p>
            )}
          </AccordionItem>

          {/* Buttons */}
        </main>
      </div>
      <div className="absolute bg-white w-full py-4 px-24 bottom-0 mt-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={() => {
            const purpose = searchParams?.get('purpose') || ''
            const returnTo = `/apply?country=${slugify(readableCountry)}-${countryId}${purpose ? `&purpose=${encodeURIComponent(purpose)}` : ''}`
            if (!session) {
              localStorage.setItem('postLoginRedirect', returnTo)
              localStorage.setItem('selectedCountry', countryId || '')
              router.push(
                `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
              )
            } else {
              router.push(returnTo)
            }
          }}
          className="px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-accent"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
