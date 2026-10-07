'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CheckCircle,
  Flame,
  Clock,
  Shield,
  Star,
  ArrowRight,
  Plane,
  Briefcase,
  GraduationCap,
  Building2,
  Stethoscope,
  MapPin,
  AlertTriangle,
  Check,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/hooks/useCurrency'

interface VisaOption {
  id: string
  country: string
  countryFlag?: string
  visaType: string
  adultPrice?: number
  childPrice?: number
  processingTimeValue?: string
  processingTimeDays?: string | number
  purpose?: string
  stayPeriod?: string
  validity?: string
  occupancyType?: string
  hotListed?: string
  category?: string
  processingTimeQuote?: string
  operatingSchedule?: { visa4Hours?: string } | null
}

interface PurposeOption {
  id: string
  title: string
  img: string | null
  icon?: React.ComponentType<{ className?: string; size?: number }>
  description: string
}

interface VisaTypeConfig {
  id: string
  name: string
  slug: string
  displayName: string
  description?: string
  image?: string
  icon?: string
  order: number
}

interface VisaSelectionWizardProps {
  country: string
  onVisaSelect?: (visaId: string) => void
  // Optional: Pre-fetched data to avoid loading delays
  initialVisaTypeConfigs?: VisaTypeConfig[]
  initialCountryVisas?: VisaOption[]
}

export default function VisaSelectionWizard({
  country,
  onVisaSelect,
  initialVisaTypeConfigs,
  initialCountryVisas,
}: VisaSelectionWizardProps) {
  const { format: formatCurrency } = useCurrency()
  const [selectedPurpose, setSelectedPurpose] = useState<string>('')
  // Initialize with server-side data if provided
  const [visaOptions, setVisaOptions] = useState<VisaOption[]>(
    initialCountryVisas || []
  )
  const [availablePurposes, setAvailablePurposes] = useState<PurposeOption[]>(
    []
  )
  const [visaTypeConfigs, setVisaTypeConfigs] = useState<VisaTypeConfig[]>(
    initialVisaTypeConfigs || []
  )
  const [loading, setLoading] = useState(false)
  // Only show loading if we don't have initial data
  const [loadingPurposes, setLoadingPurposes] = useState(
    !initialVisaTypeConfigs || !initialCountryVisas
  )
  const [trustSectionContent, setTrustSectionContent] = useState<{
    mainText: string
    features: Array<{ text: string; order: number; status: string }>
  } | null>(null)
  const router = useRouter()
  const fetchingPurposesRef = useRef(false) // Prevent duplicate fetches
  const lastFetchedCountryRef = useRef<string | null>(null) // Track which country we fetched for
  const configsLoadedRef = useRef(false) // Track if visa type configs have loaded
  const visasLoadedRef = useRef(false) // Track if country visas have loaded

  // Fallback purpose options (used if API fails) - using lucide-react icons instead of external SVGs
  const fallbackPurposeOptions: PurposeOption[] = [
    {
      id: 'tourist',
      title: 'Tourist',
      img: null,
      icon: Plane,
      description: 'For leisure and sightseeing',
    },
    {
      id: 'business',
      title: 'Business',
      img: null,
      icon: Briefcase,
      description: 'For business meetings and work',
    },
    {
      id: 'transit',
      title: 'Transit',
      img: null,
      icon: MapPin,
      description: 'For connecting flights',
    },
    {
      id: 'student',
      title: 'Student',
      img: null,
      icon: GraduationCap,
      description: 'For educational purposes',
    },
    {
      id: 'work',
      title: 'Work',
      img: null,
      icon: Building2,
      description: 'For employment opportunities',
    },
    {
      id: 'medical',
      title: 'Medical',
      img: null,
      icon: Stethoscope,
      description: 'For medical treatment',
    },
  ]

  // Fetch trust section content on component mount
  useEffect(() => {
    const fetchTrustSection = async () => {
      try {
        const response = await fetch('/api/public/select-plan-content')
        const data = await response.json()
        if (data.success && data.selectPlanPage) {
          setTrustSectionContent(data.selectPlanPage.trustSection)
        }
      } catch (error) {
        console.error('Error fetching trust section content:', error)
        // Use default content on error
        setTrustSectionContent({
          mainText: 'Visa4 has brought joy to over 1,50,000 happy travellers!',
          features: [
            { text: '100% Secure Processing', order: 0, status: 'active' },
            { text: '24/7 Customer Support', order: 1, status: 'active' },
            { text: 'Money Back Guarantee', order: 2, status: 'active' },
          ],
        })
      }
    }
    fetchTrustSection()
  }, [])

  // Show fallback purposes immediately while loading to improve UX
  useEffect(() => {
    // Disabled fallback while loading as per request
    /*
    if (country && availablePurposes.length === 0 && loadingPurposes) {
      // Show common fallback purposes immediately while loading
      const commonPurposes = fallbackPurposeOptions.slice(0, 3)
      setAvailablePurposes(commonPurposes)
    }
    */
  }, [country, loadingPurposes, availablePurposes.length])

  // Fetch visa type configurations AND country-specific visas in parallel on component mount
  useEffect(() => {
    // If we have initial data, process it immediately
    if (initialVisaTypeConfigs && initialVisaTypeConfigs.length > 0) {
      configsLoadedRef.current = true
    }
    if (initialCountryVisas && initialCountryVisas.length > 0) {
      visasLoadedRef.current = true
    }

    // If we have both initial data, process purposes immediately
    if (initialVisaTypeConfigs && initialCountryVisas && country) {
      processAvailablePurposes()
      return
    }

    if (country) {
      // Reset loading state and flags when country changes (only if we don't have initial data)
      if (!initialVisaTypeConfigs || !initialCountryVisas) {
        setLoadingPurposes(true)
        configsLoadedRef.current = false
        visasLoadedRef.current = false
        // Fetch both in parallel for better performance
        Promise.all([fetchVisaTypeConfigs(), fetchCountryVisas()])
      }
    } else {
      // No country, just fetch visa type configs if not provided
      if (!initialVisaTypeConfigs) {
        configsLoadedRef.current = false
        fetchVisaTypeConfigs()
      }
    }
  }, [country, initialVisaTypeConfigs, initialCountryVisas])

  // When we have visa type configs and country visas loaded, process available purposes
  useEffect(() => {
    if (!country) return

    // If we have initial data, process immediately
    if (initialVisaTypeConfigs && initialCountryVisas) {
      processAvailablePurposes()
      return
    }

    // Safety timeout: if loading takes more than 5 seconds, show fallback purposes
    const timeoutId = setTimeout(() => {
      if (loadingPurposes) {
        console.warn('Purpose loading timeout')
        // Don't show fallbacks on timeout
        setLoadingPurposes(false)
      }
    }, 5000) // 5 second timeout (reduced from 10)

    // Process purposes when both API calls have completed (even if one returns empty)
    if (configsLoadedRef.current && visasLoadedRef.current) {
      clearTimeout(timeoutId)
      processAvailablePurposes()
    }

    return () => clearTimeout(timeoutId)
  }, [
    country,
    visaTypeConfigs,
    visaOptions,
    loadingPurposes,
    initialVisaTypeConfigs,
    initialCountryVisas,
  ])

  const fetchVisaTypeConfigs = async () => {
    try {
      // Use revalidation to balance performance and freshness
      // Revalidates every 60 seconds, so new images appear within a minute
      const response = await fetch('/api/public/visa-types', {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      })
      if (!response.ok) throw new Error('Failed to fetch visa type configs')
      const data = await response.json()
      setVisaTypeConfigs(data.visaTypes || [])
    } catch (error) {
      console.error('Error fetching visa type configs:', error)
      setVisaTypeConfigs([])
    } finally {
      configsLoadedRef.current = true
      // If country visas are also loaded, trigger processing
      if (visasLoadedRef.current && country) {
        processAvailablePurposes()
      }
    }
  }

  const fetchCountryVisas = async () => {
    // Prevent duplicate calls
    if (fetchingPurposesRef.current) {
      return
    }
    fetchingPurposesRef.current = true
    setLoadingPurposes(true)
    try {
      // Use country filter for server-side filtering - much faster!
      // Add cache: 'no-store' to ensure fresh data
      const response = await fetch(
        `/api/public/visa?country=${encodeURIComponent(country)}`,
        {
          cache: 'no-store',
        }
      )
      if (!response.ok) throw new Error('Failed to fetch visa data')
      const data = await response.json()

      // Store all country-specific visas
      setVisaOptions(data.visas || [])

      // Mark that we've fetched for this country
      lastFetchedCountryRef.current = country
    } catch (error) {
      console.error('Error fetching country visas:', error)
      setVisaOptions([])
      lastFetchedCountryRef.current = country
    } finally {
      fetchingPurposesRef.current = false
      visasLoadedRef.current = true
      // If visa type configs are also loaded, trigger processing
      if (configsLoadedRef.current && country) {
        processAvailablePurposes()
      }
    }
  }

  const processAvailablePurposes = () => {
    try {
      // Use current state values (which may include initial data)
      const currentVisaOptions =
        visaOptions.length > 0 ? visaOptions : initialCountryVisas || []
      const currentVisaTypeConfigs =
        visaTypeConfigs.length > 0
          ? visaTypeConfigs
          : initialVisaTypeConfigs || []

      // Extract unique visa types from the country's visas
      const availableVisaTypes = [
        ...new Set(
          currentVisaOptions.map((visa: VisaOption) =>
            visa.visaType?.toLowerCase()
          )
        ),
      ] as string[]

      // Create purpose options dynamically from visa type configs
      const dynamicPurposes = currentVisaTypeConfigs
        .filter(config => {
          const normalizedConfigName = config.name
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          const normalizedConfigDisplayName = (config.displayName || '')
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          const normalizedConfigSlug = (config.slug || '')
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          return availableVisaTypes.some(visaType => {
            if (!visaType) return false
            const normalizedVisaType = visaType
              .toLowerCase()
              .replace(/[-_]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()

            return (
              normalizedVisaType.includes(normalizedConfigName) ||
              normalizedConfigName.includes(normalizedVisaType) ||
              (normalizedConfigDisplayName &&
                (normalizedVisaType.includes(normalizedConfigDisplayName) ||
                  normalizedConfigDisplayName.includes(normalizedVisaType))) ||
              (normalizedConfigSlug &&
                (normalizedVisaType.includes(normalizedConfigSlug) ||
                  normalizedConfigSlug.includes(normalizedVisaType)))
            )
          })
        })
        .map(config => {
          const fallbackOption = fallbackPurposeOptions.find(
            p => p.id === config.slug || p.id === config.name.toLowerCase()
          )

          // Use the image from config if available and not empty, otherwise use fallback
          const hasConfigImage =
            config.image &&
            typeof config.image === 'string' &&
            config.image.trim() !== ''
          const imageUrl = hasConfigImage ? config.image : null

          const purpose: PurposeOption = {
            id: config.slug || config.name.toLowerCase(),
            title: config.displayName || config.name,
            img: imageUrl || null, // Only use config image, never fallback image
            // Only set icon if we DON'T have an image from config
            icon: hasConfigImage ? undefined : fallbackOption?.icon,
            description:
              config.description ||
              fallbackOption?.description ||
              `For ${config.name.toLowerCase()} purposes`,
          }

          return purpose
        })

      // Deduplicate purposes by id
      const uniqueDynamicPurposes = Array.from(
        new Map(dynamicPurposes.map(item => [item.id, item])).values()
      )

      // If no dynamic purposes found, use fallback
      if (uniqueDynamicPurposes.length === 0) {
        // Disabled fallback logic
        /*
        const filteredFallback = fallbackPurposeOptions.filter(purpose =>
          availableVisaTypes.some(
            visaType =>
              visaType.includes(purpose.id.toLowerCase()) ||
              purpose.id.toLowerCase().includes(visaType)
          )
        )
        setAvailablePurposes(filteredFallback)
        */
        setAvailablePurposes([])
      } else {
        setAvailablePurposes(uniqueDynamicPurposes)
      }
    } catch (error) {
      console.error('Error processing available purposes:', error)
      // Fallback to all purposes if processing fails
      // setAvailablePurposes(fallbackPurposeOptions)
      setAvailablePurposes([])
    } finally {
      setLoadingPurposes(false)
    }
  }

  const handleVisaSelect = (visaId: string) => {
    if (onVisaSelect) {
      onVisaSelect(visaId)
    }
    // The parent component (select-plan page) handles the routing
    router.push(
      `/quotation/${country.toLowerCase()}-${visaId}?purpose=${selectedPurpose}`
    )
  }

  // Filter visas by selected purpose from already-loaded country visas
  const filteredVisasByPurpose = selectedPurpose
    ? visaOptions.filter((visa: VisaOption) => {
        if (!visa.visaType) return false

        const config = visaTypeConfigs.find(
          c =>
            c.slug === selectedPurpose ||
            c.name.toLowerCase() === selectedPurpose.toLowerCase()
        )

        const normalizedVisaType = visa.visaType
          .toLowerCase()
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        const normalizedPurpose = selectedPurpose
          .toLowerCase()
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (config) {
          const normalizedConfigName = config.name
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          const normalizedConfigDisplayName = (config.displayName || '')
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          return (
            normalizedVisaType.includes(normalizedPurpose) ||
            normalizedPurpose.includes(normalizedVisaType) ||
            normalizedVisaType.includes(normalizedConfigName) ||
            normalizedConfigName.includes(normalizedVisaType) ||
            (normalizedConfigDisplayName &&
              (normalizedVisaType.includes(normalizedConfigDisplayName) ||
                normalizedConfigDisplayName.includes(normalizedVisaType)))
          )
        }

        return (
          normalizedVisaType.includes(normalizedPurpose) ||
          normalizedPurpose.includes(normalizedVisaType)
        )
      })
    : []

  // Helper function to calculate delivery date
  const calculateDeliveryDate = (
    value: string | undefined,
    type: string | number | undefined,
    scheduleText?: string | null
  ) => {
    let base = 7
    if (value) {
      const m = value.match(/\d+/)
      if (m) base = parseInt(m[0], 10)
    }
    const days = Math.max(0, base)

    const text = scheduleText || ''
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
      payload.split(/[,\s]+/).forEach(tok => {
        const key = tok.slice(0, 3)
        if (map[key] !== undefined) set.add(map[key])
      })
    }
    if (set.size === 0) {
      for (let d = 1; d <= 6; d++) set.add(d)
    }
    const addBiz = (start: Date, businessDays: number) => {
      const d = new Date(start)
      let added = 0
      while (added < businessDays) {
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
    const date = ensureWorking(addBiz(new Date(), Math.max(0, days)))
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Purpose Selection */}
      {!selectedPurpose && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-primary mb-2">
              Select Your Travel Purpose
            </h2>
            <p className="text-gray-600">
              Choose the purpose of your visit to {country}
            </p>
          </div>

          {/* Loading Skeleton - Show only if no purposes available yet */}
          {loadingPurposes && availablePurposes.length === 0 && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 justify-center">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Visa Types Available - Only show when NOT loading and empty */}
          {!loadingPurposes && availablePurposes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">
                  No Visa Types Available
                </h3>
                <p className="text-gray-600">
                  We don't have any visa options available for {country} at the
                  moment.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please try selecting a different country or contact our
                  support team.
                </p>
              </div>
            </div>
          )}

          {/* Purpose Options - Show if we have data (even while loading in background) */}
          {availablePurposes.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 justify-center">
              {availablePurposes.map(purpose => (
                <Card
                  key={purpose.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-primary"
                  onClick={() => setSelectedPurpose(purpose.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-lg relative">
                      {purpose.img && purpose.img.trim() !== '' ? (
                        <>
                          <img
                            src={purpose.img}
                            alt={purpose.title}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-contain"
                            onError={e => {
                              // Hide the broken image and show fallback
                              e.currentTarget.style.display = 'none'
                              const fallbackDiv = e.currentTarget
                                .nextElementSibling as HTMLElement
                              if (fallbackDiv) {
                                fallbackDiv.style.display = 'flex'
                              }
                            }}
                          />
                          {/* Fallback div for when image fails to load - shows icon or letter */}
                          <div
                            className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center absolute inset-0"
                            style={{ display: 'none' }}
                          >
                            {purpose.icon ? (
                              <purpose.icon
                                className="w-10 h-10 text-brand-primary"
                                size={40}
                              />
                            ) : (
                              <span className="text-2xl font-bold text-brand-primary">
                                {purpose.title.charAt(0)}
                              </span>
                            )}
                          </div>
                        </>
                      ) : purpose.icon ? (
                        <purpose.icon
                          className="w-10 h-10 text-brand-primary"
                          size={40}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-brand-primary">
                            {purpose.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-brand-primary mb-2">
                      {purpose.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {purpose.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Visa Selection */}
      {selectedPurpose && (
        <div className="space-y-6 relative">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setSelectedPurpose('')}
            className="w-24 absolute left-0"
          >
            ← Back
          </Button>
          <div className="flex items-center justify-center max-h-screen ">
            <div className="text-left sm:text-left pt-16 sm:pt-0 w-full">
              <h2 className="text-xl text-center sm:text-2xl font-bold text-brand-primary capitalize mb-2">
                {country} Visa Application
              </h2>
              <p className="text-gray-600 text-center text-sm sm:text-base mb-8">
                Which Visa do you wish to apply?
              </p>
            </div>
          </div>

          {/* Yellow Banner for Processing Time Quote */}
          {filteredVisasByPurpose.some(v => v.processingTimeQuote) && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex gap-3 max-w-4xl mx-auto">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                <span className="font-bold">Please Note : </span>
                {
                  filteredVisasByPurpose.find(v => v.processingTimeQuote)
                    ?.processingTimeQuote
                }
              </p>
            </div>
          )}

          {/* Visa Options */}
          {filteredVisasByPurpose.length > 0 && (
            <div className="flex flex-col gap-6 justify-center max-w-4xl mx-auto">
              {filteredVisasByPurpose.map(visa => (
                <Card
                  key={visa.id}
                  className="relative hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-visible"
                >
                  {/* Popular Badge */}
                  {visa.hotListed === 'true' && (
                    <div className="absolute -top-3 left-0 bg-[#FF7A00] text-white px-4 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-semibold">Popular</span>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* Left Section */}
                      <div className="space-y-4 flex-1">
                        {/* Title (Mobile) */}
                        <div className="flex justify-between items-start md:hidden mb-2">
                          <h3 className="text-lg font-bold text-gray-900 capitalize">
                            {visa.occupancyType || 'Single'} Entry
                          </h3>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(visa.adultPrice || 0)}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-700" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-gray-900 border-b pb-2">
                                  Price Breakdown
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">Adult</span>
                                  <span className="font-medium">
                                    {formatCurrency(visa.adultPrice || 0)}
                                  </span>
                                </div>
                                {Number(visa.childPrice) > 0 && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Child</span>
                                    <span className="font-medium">
                                      {formatCurrency(visa.childPrice || 0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Title (Desktop) */}
                        <div className="hidden md:block">
                          <h3 className="text-xl font-bold text-gray-900 capitalize">
                            {visa.stayPeriod} {visa.occupancyType || 'Single'}{' '}
                            Entry
                          </h3>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-3 items-center">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                            Get your visa by:{' '}
                            {calculateDeliveryDate(
                              visa.processingTimeValue,
                              visa.processingTimeDays,
                              visa.operatingSchedule?.visa4Hours || null
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="font-normal text-gray-600 bg-white hover:bg-white border-gray-300 px-3 py-1.5 h-auto text-sm"
                          >
                            E-Visa
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-normal text-gray-600 bg-white hover:bg-white border-gray-300 px-3 py-1.5 h-auto text-sm capitalize"
                          >
                            {visa.category || 'Standard'}
                          </Badge>
                        </div>

                        {/* Features (Stay & Validity) */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-emerald-100 p-0.5 rounded-full">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">
                              Stay Period:{' '}
                              <span className="font-bold text-gray-900">
                                {visa.stayPeriod}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-emerald-100 p-0.5 rounded-full">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">
                              Validity:{' '}
                              <span className="font-bold text-gray-900">
                                {visa.validity}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section (Desktop) */}
                      <div className="hidden md:flex flex-col items-end justify-between min-w-[200px] gap-4">
                        <div className="flex items-center gap-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="bg-gray-100 px-4 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors">
                                <span className="text-xl font-bold text-gray-900">
                                  {formatCurrency(visa.adultPrice || 0)}
                                </span>
                                <ChevronDown className="w-5 h-5 text-gray-700" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-gray-900 border-b pb-2">
                                  Price Breakdown
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">Adult</span>
                                  <span className="font-medium">
                                    {formatCurrency(visa.adultPrice || 0)}
                                  </span>
                                </div>
                                {Number(visa.childPrice) > 0 && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Child</span>
                                    <span className="font-medium">
                                      {formatCurrency(visa.childPrice || 0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <Button
                          className="bg-brand-primary hover:bg-brand-primary/60 text-white rounded-full px-8 w-full mt-auto text-base font-medium"
                          onClick={() => handleVisaSelect(visa.id)}
                        >
                          Select <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>

                      {/* Mobile Select Button */}
                      <div className="md:hidden mt-2">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-full"
                          onClick={() => handleVisaSelect(visa.id)}
                        >
                          Select <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Options Found */}
          {filteredVisasByPurpose.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">
                  No Visa Options Found
                </h3>
                <p className="text-gray-600">
                  We don't have {selectedPurpose} visa options for {country} at
                  the moment.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedPurpose('')}
                className="mt-4"
              >
                Try Different Purpose
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Trust Section */}
      {trustSectionContent && (
        <div className="mt-8 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <svg
              id="Layer_1"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 113.77 122.88"
              width={24}
              height={24}
            >
              <title>idea</title>
              <path d="M2.89,59.92a2.79,2.79,0,0,1-2-.75,2.84,2.84,0,0,1-.88-2,2.8,2.8,0,0,1,2.72-2.89l8.65-.3a2.83,2.83,0,0,1,2,.76,2.81,2.81,0,0,1-1.83,4.85l-8.66.29ZM68.1,40.42a6.12,6.12,0,0,1,2.14.35,8.27,8.27,0,0,1,3.61,2.5,8,8,0,0,1,1.89,4.31,7.84,7.84,0,0,1-.12,2.4,9.29,9.29,0,0,1,1.83,2.21,7.3,7.3,0,0,1,1,3.92,7,7,0,0,1-1.43,4,9.66,9.66,0,0,1-2.4,2.25,8.87,8.87,0,0,1-1.53,5.5A7.15,7.15,0,0,1,68.63,71a7,7,0,0,1-8.2,4.9,5.7,5.7,0,0,1-3.58-3A6.13,6.13,0,0,1,52.76,76a6.37,6.37,0,0,1-5.16-1.29A6.24,6.24,0,0,1,45.27,71a6.42,6.42,0,0,1-1.81-.34,8.33,8.33,0,0,1-3.54-2.43A8.13,8.13,0,0,1,38,64.1a7.56,7.56,0,0,1,.09-2.63,9.15,9.15,0,0,1-1.67-2,7.54,7.54,0,0,1-1.14-4,7.16,7.16,0,0,1,1.45-4.19A9.87,9.87,0,0,1,39,49.09c0-.27,0-.55,0-.82A8.77,8.77,0,0,1,41,43a6.9,6.9,0,0,1,4.28-2.55h0a5.07,5.07,0,0,1,.22-.76,6.6,6.6,0,0,1,2.87-3.34,6.22,6.22,0,0,1,4.39-.77,6,6,0,0,1,3.93,2.86,6.06,6.06,0,0,1,3.94-2.86,6.17,6.17,0,0,1,4,.58,6.79,6.79,0,0,1,2.88,2.76,6,6,0,0,1,.56,1.48Zm-9.83.89V68.82a1.38,1.38,0,0,1,.25.58c.39,2.4,1.43,3.56,2.61,3.88a4,4,0,0,0,3.31-.76,3.65,3.65,0,0,0,1.68-2.8c0-1.22-.88-2.61-3.28-3.83a1.33,1.33,0,1,1,1.21-2.36c2.66,1.35,4,3,4.52,4.71a4.72,4.72,0,0,0,2.37-1.87A6.29,6.29,0,0,0,72,62a1.33,1.33,0,0,1,.63-1.43,7.61,7.61,0,0,0,2.33-2,4.32,4.32,0,0,0,.91-2.5,4.73,4.73,0,0,0-.68-2.51,6.74,6.74,0,0,0-1.79-2A1.35,1.35,0,0,1,72.84,50a4.92,4.92,0,0,0,.25-2.18A5.44,5.44,0,0,0,71.82,45a5.63,5.63,0,0,0-2.43-1.7,3.51,3.51,0,0,0-1.37-.2,6.25,6.25,0,0,1-1.29,2.35,1.32,1.32,0,1,1-2-1.7,3,3,0,0,0,.49-3.54,4,4,0,0,0-1.73-1.65,3.53,3.53,0,0,0-2.29-.35c-1.13.23-2.22,1.17-2.9,3.11Zm6.78,9a1.33,1.33,0,0,1,1.56-2.15c.28.2.53.41.77.62a8.78,8.78,0,0,1,2.91,5.88,9.34,9.34,0,0,1-1.78,6.26c-.19.26-.41.52-.66.8a1.33,1.33,0,0,1-2-1.78,7.37,7.37,0,0,0,.47-.58,6.76,6.76,0,0,0,1.29-4.49,6.14,6.14,0,0,0-2-4.11,5.7,5.7,0,0,0-.55-.45ZM55.6,42.7h0l0,0h0l-.06-.1h0l0,0h0v0h0v0h0v0h0v0h0v0h0c-.64-2.59-1.89-3.78-3.18-4a3.63,3.63,0,0,0-2.52.47A3.92,3.92,0,0,0,48,40.62a3.28,3.28,0,0,0,1.18,3.62,1.33,1.33,0,0,1-1.81,1.95,6.75,6.75,0,0,1-2-3,4.36,4.36,0,0,0-2.33,1.56,6.11,6.11,0,0,0-1.36,3.66,7.25,7.25,0,0,0,.07,1.21,1.34,1.34,0,0,1-.62,1.31,8,8,0,0,0-2.27,2,4.52,4.52,0,0,0-.93,2.64,4.81,4.81,0,0,0,.75,2.56,6.43,6.43,0,0,0,1.67,1.79,1.34,1.34,0,0,1,.5,1.53,5.08,5.08,0,0,0-.23,2.32,5.52,5.52,0,0,0,1.3,2.78,5.74,5.74,0,0,0,2.38,1.65,3.93,3.93,0,0,0,1.09.2c.52-1.72,2-3.45,4.68-4.84a1.33,1.33,0,1,1,1.21,2.36c-2.52,1.29-3.47,2.77-3.47,4.07a3.42,3.42,0,0,0,1.41,2.61,3.77,3.77,0,0,0,3,.79c1.29-.27,2.54-1.46,3.18-4.06a1.35,1.35,0,0,1,.2-.44V42.7Zm-9.88,6.37A1.33,1.33,0,1,1,47.58,51a6.17,6.17,0,0,0-1.85,4.17,6.71,6.71,0,0,0,1.52,4.52,1.33,1.33,0,0,1-2.08,1.67A9.46,9.46,0,0,1,43.07,55a8.83,8.83,0,0,1,2.65-6Zm-1.14,53.11a2.26,2.26,0,0,1-.48-4.48c-1.29-7.33-4.82-11.36-8.55-15.63-2.9-3.32-5.91-6.77-8.29-11.85a35.77,35.77,0,0,1-3.58-15.54,36.57,36.57,0,0,1,4.38-16.62l.06-.1h0A31.55,31.55,0,0,1,43.5,24.51a34,34,0,0,1,16-2.29,36.7,36.7,0,0,1,15.28,4.91A31.55,31.55,0,0,1,88.13,42.25,33.57,33.57,0,0,1,90.65,54a34.15,34.15,0,0,1-2.59,13.8c-2.65,6.55-6.15,10.62-9.42,14.43-3,3.5-5.82,6.77-7.38,11.77a2.26,2.26,0,0,1-.21,4.43l-.76.11c-.14,1.09-.23,2.25-.27,3.5l.25,0a2.26,2.26,0,1,1,.62,4.48l-.77.11,0,.45h0a17.91,17.91,0,0,1,0,2.53l.13,0a2.27,2.27,0,0,1,.55,4.5l-1.68.2a13.51,13.51,0,0,1-5.83,6.91,12.73,12.73,0,0,1-5.58,1.7A11.59,11.59,0,0,1,52,121.73a12.11,12.11,0,0,1-5.26-5.11,2.25,2.25,0,0,1-1.22-1.74,2.2,2.2,0,0,1,.07-.89,19.64,19.64,0,0,1-.87-3.8h-.07a2.26,2.26,0,0,1-.62-4.48l.54-.07c0-1.23,0-2.38,0-3.47Zm3.73-5.08L66.7,94.49c1.58-6.67,5-10.67,8.74-15,3.06-3.56,6.33-7.36,8.71-13.26a29.94,29.94,0,0,0,2.3-12.12,29.2,29.2,0,0,0-2.23-10.28A27.26,27.26,0,0,0,72.64,30.76a32.33,32.33,0,0,0-13.51-4.35,29.89,29.89,0,0,0-14.05,2A27.43,27.43,0,0,0,31.76,40.07a32.35,32.35,0,0,0-3.87,14.64,31.57,31.57,0,0,0,3.18,13.73A44.91,44.91,0,0,0,38.72,79.3c4.21,4.82,8.19,9.38,9.59,17.8ZM66,99.16,48.78,101.6c0,1.09.07,2.24,0,3.45l17-2.41c0-1.23.07-2.39.17-3.48Zm-17,10.44a16.21,16.21,0,0,0,.53,2.52l16.45-2a13.67,13.67,0,0,0,.06-2.73h0v-.19l-17,2.42Zm2.87,6.79a7.56,7.56,0,0,0,2.09,1.55,7.4,7.4,0,0,0,3.66.72,8.53,8.53,0,0,0,3.71-1.14,9.07,9.07,0,0,0,2.86-2.64l-12.32,1.51ZM110.68,50a2.8,2.8,0,0,1,3.08,2.5,2.81,2.81,0,0,1-2.51,3.08l-8.61.91a2.78,2.78,0,0,1-2.06-.62,2.81,2.81,0,0,1,1.49-5l8.61-.9ZM94.48,15a2.85,2.85,0,0,1,1.79-1.19A2.8,2.8,0,0,1,99.57,16a2.78,2.78,0,0,1-.42,2.1l-4.81,7.2a2.8,2.8,0,0,1-1.79,1.2,2.84,2.84,0,0,1-2.1-.43,2.78,2.78,0,0,1-1.2-1.79,2.75,2.75,0,0,1,.43-2.1l4.8-7.2ZM57.3,2.74a2.85,2.85,0,0,1,.86-2,2.81,2.81,0,0,1,4.74,2.1l-.21,8.65a2.81,2.81,0,1,1-5.61-.12l.22-8.66ZM14,16.64l0,0a2.81,2.81,0,0,1-.09-3.92l0,0a2.78,2.78,0,0,1,1.9-.85,2.84,2.84,0,0,1,2,.75c2.09,2,4.23,3.95,6.33,5.91a2.83,2.83,0,0,1,.9,2,2.87,2.87,0,0,1-.75,2l0,0a2.81,2.81,0,0,1-3.92.09c-2-1.93-4.25-4.09-6.35-5.92Z" />
            </svg>
            <p className="text-brand-primary font-medium">
              {trustSectionContent.mainText}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
            {trustSectionContent.features
              .filter(f => f.status === 'active')
              .sort((a, b) => a.order - b.order)
              .map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature.text}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
