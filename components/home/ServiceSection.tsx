'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'

interface VisaType {
  type: string
  price: string
  pricingOptions?: {
    day: number
    week: number
    schengen: number
  }
  processingTime: string
  processingTimeDays?: string
  stayPeriod: string
  validity: string
  category: string
  hotListed: boolean
  occupancyType: string
  eVisa: boolean
}

interface ServiceData {
  country: string
  countryFlag: string
  countryCode: string
  countryImage: string
  visaTypes: VisaType[]
  totalVisas: number
  minPrice: number
  maxPrice: number
}

interface ServiceSectionProps {
  initialServices?: ServiceData[]
  initialSectionContent?: {
    title?: string
    subtitle?: string
    description?: string
  }
  initialVisaConfig?: {
    processingTimeTypes?: any[]
  }
}

const ServiceSection = ({
  initialServices,
  initialSectionContent,
  initialVisaConfig,
}: ServiceSectionProps = {}) => {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  // Initialize with server-side data if provided
  const [services, setServices] = useState<ServiceData[]>(initialServices || [])
  const [loading, setLoading] = useState(
    !initialServices || initialServices.length === 0
  )
  const [error, setError] = useState<string | null>(null)
  const [showPricingInfo, setShowPricingInfo] = useState(false)
  const [processingTimeTypes, setProcessingTimeTypes] = useState<any[]>(
    initialVisaConfig?.processingTimeTypes || []
  )
  const [sectionContent, setSectionContent] = useState({
    title: initialSectionContent?.title || 'Our Services',
    subtitle:
      initialSectionContent?.subtitle ||
      'Comprehensive Solutions for Your European Journey',
    description:
      initialSectionContent?.description ||
      'We provide end-to-end visa and travel services to make your European adventure seamless.',
  })

  // Handle visa card click to redirect to select-plan
  const handleVisaClick = (country: string) => {
    router.push(`/select-plan?country=${encodeURIComponent(country)}`)
  }

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/public/services')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setServices(data.services)
        } else {
          setError(data.error || 'Failed to fetch services')
          setServices([])
        }
      } catch (err: any) {
        console.error('Error fetching services:', err)
        setError(err.message || 'An unexpected error occurred')
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    const fetchProcessingTimeTypes = async () => {
      try {
        const response = await fetch('/api/public/visa-config')
        if (response.ok) {
          const data = await response.json()
          setProcessingTimeTypes(data.data?.processingTimeTypes || [])
        } else {
          console.warn('Failed to fetch visa config:', response.status)
          setProcessingTimeTypes([])
        }
      } catch (err) {
        console.error('Error fetching processing time types:', err)
        setProcessingTimeTypes([])
      }
    }

    const fetchSectionContent = async () => {
      try {
        const response = await fetch('/api/public/home/services')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.serviceSection) {
            setSectionContent({
              title: data.serviceSection.title || 'Our Services',
              subtitle: data.serviceSection.subtitle || '',
              description: data.serviceSection.description || '',
            })
          }
        } else {
          console.warn('Failed to fetch services content:', response.status)
        }
      } catch (err) {
        console.error('Error fetching services content:', err)
      }
    }

    // Only fetch if no server-side data provided
    if (initialServices && initialServices.length > 0) {
      setServices(initialServices)
      setLoading(false)
    } else {
      fetchServices()
    }

    // Only fetch processing time types if not provided
    if (
      !initialVisaConfig?.processingTimeTypes ||
      initialVisaConfig.processingTimeTypes.length === 0
    ) {
      fetchProcessingTimeTypes()
    }

    // Only fetch section content if not provided
    if (!initialSectionContent) {
      fetchSectionContent()
    }
  }, [initialServices, initialSectionContent, initialVisaConfig])

  // Transform services data to match the original format for filtering
  const transformedVisas = services.flatMap(service =>
    service.visaTypes.map(visaType => {
      // Get the appropriate price based on current filter and occupancy type
      let displayPrice = parseInt(visaType.price)

      if (visaType.occupancyType === 'single' && visaType.pricingOptions) {
        switch (filter) {
          case 'In Days':
            displayPrice = visaType.pricingOptions.day
            break
          case 'In Weeks':
            displayPrice = visaType.pricingOptions.week
            break
          case 'Other': // This maps to "Schengen" in the UI
            displayPrice = visaType.pricingOptions.schengen
            break
          default:
            displayPrice = parseInt(visaType.price)
        }
      }

      return {
        name: service.country,
        price: `₹ ${displayPrice}`,
        basePrice: parseInt(visaType.price),
        pricingOptions: visaType.pricingOptions,
        image:
          service.countryImage || service.countryFlag || '/visa/default.png',
        deliveryDays: parseInt(visaType.processingTime) || 7,
        type: visaType.category === 'schengen' ? 'Schengen' : 'Other',
        countryFlag: service.countryFlag,
        countryCode: service.countryCode,
        visaType: visaType.type,
        stayPeriod: visaType.stayPeriod,
        validity: visaType.validity,
        hotListed: visaType.hotListed,
        occupancyType: visaType.occupancyType,
        eVisa: visaType.eVisa,
        processingTimeDays: visaType.processingTimeDays,
      }
    })
  )

  const filteredVisas = transformedVisas.filter(visa => {
    // Only show hotlisted visas
    if (!visa.hotListed) return false

    // If no filter is selected, show all hotlisted visas
    if (!filter) return true

    // Apply filtering based on the selected processing time type
    switch (filter) {
      case 'In Days':
        return visa.deliveryDays <= 1
      case 'In Weeks':
        return visa.deliveryDays <= 7
      case 'Other': // This maps to "Schengen" in the UI
        return visa.type === 'Schengen'
      default:
        return true
    }
  })

  // Get the first service for the large card display
  const firstService = services[0]
  const firstVisa = firstService?.visaTypes[0]

  if (loading) {
    return (
      <section className="py-20 relative max-[600px]:px-4 max-[600px]:pb-32">
        <Image
          className="absolute left-5 bottom-10 w-28"
          src="/visa/air1.png"
          alt=""
          width={112}
          height={112}
          quality={85}
          sizes="112px"
        />
        <Image
          className="absolute right-8 top-10 w-28 rotate-180"
          src="/visa/air1.png"
          alt=""
          width={112}
          height={112}
          quality={85}
          sizes="112px"
        />

        <div className="w-4/5 max-[600px]:w-[90%] mx-auto md:flex-row items-center justify-between py-6 sm:px-6 lg:px-8 gap-10">
          {/* Section Heading */}
          <div className="text-left mb-10 flex flex-col items-start gap-2">
            <div className="text-[16px] max-[600px]:text-base max-[600px]:text-bold flex items-center gap-2 font-medium text-gray-500 tracking-widest">
              {sectionContent.title}{' '}
              <Image
                src="/visa/OBJECTS.png"
                className="w-10 h-2"
                alt="image"
                width={40}
                height={8}
                quality={85}
                sizes="40px"
              />
            </div>
            {sectionContent.subtitle && (
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {sectionContent.subtitle}
              </h2>
            )}
            {sectionContent.description && (
              <p className="mt-4 max-w-xl text-xs md:text-sm text-gray-600">
                {sectionContent.description}
              </p>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="text-left flex flex-wrap gap-4 mb-10 max-[600px]:mb-10">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Large Card */}
            <div className="relative text-center h-[430px] rounded-xl overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Visa Cards Grid */}
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-[170px] w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 relative max-[600px]:px-4 max-[600px]:pb-32">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-red-600">Error: {error}</p>
          <p className="text-gray-600">
            Failed to load services. Please try again later.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 relative max-[600px]:px-4 max-[600px]:pb-32">
      <Image
        className="absolute left-5 bottom-10 w-28"
        src="/visa/air1.png"
        alt=""
        width={112}
        height={112}
        quality={85}
        sizes="112px"
      />
      <Image
        className="absolute right-8 top-10 w-28 rotate-180"
        src="/visa/air1.png"
        alt=""
        width={112}
        height={112}
        quality={85}
        sizes="112px"
      />

      <div className="w-4/5 max-[600px]:w-[90%] mx-auto md:flex-row items-center justify-between py-6 sm:px-6 lg:px-8 gap-10">
        {/* Section Heading */}
        <div className="text-left mb-10 flex flex-col items-start gap-2">
          <div className="text-[16px] max-[600px]:text-base max-[600px]:text-bold flex items-center gap-2 font-medium text-gray-500 tracking-widest">
            {sectionContent.title}{' '}
            <Image
              src="/visa/OBJECTS.png"
              className="w-10 h-2"
              alt="image"
              width={40}
              height={8}
              quality={85}
              sizes="40px"
            />
          </div>
          {sectionContent.subtitle && (
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {sectionContent.subtitle}
            </h2>
          )}
          {sectionContent.description && (
            <p className="mt-4 w-full text-xs md:text-sm text-gray-600">
              {sectionContent.description}
            </p>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="text-left flex flex-wrap gap-4 mb-10 max-[600px]:mb-10">
          {processingTimeTypes.map(type => {
            const displayName = type.name === 'Other' ? 'Schengen' : type.name
            const icon =
              type.name === 'In Days'
                ? '☀️'
                : type.name === 'In Weeks'
                  ? '📅'
                  : '🛂'

            return (
              <button
                key={type._id}
                onClick={() => setFilter(type.name)}
                className={`px-4 py-2 rounded-lg ${filter === type.name ? 'bg-red-600 text-white' : 'bg-gray-100 text-black'} text-sm font-medium flex items-center gap-2`}
              >
                {icon} {displayName}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2">
          {/* Large Card */}
          <div
            onClick={() =>
              firstService && handleVisaClick(firstService.country)
            }
            className="relative text-center h-[430px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <div className="h-full flex justify-center max-[600px]:mb-4">
              {firstService?.countryImage ? (
                <Image
                  src={(() => {
                    const imgUrl = firstService.countryImage
                    if (imgUrl.includes('cloudinary.com')) {
                      return optimizeCloudinaryUrl(imgUrl, {
                        width: 800,
                        height: 600,
                        quality: 'auto:good',
                        format: 'auto',
                      })
                    }
                    return imgUrl
                  })()}
                  alt={`${firstService.country} Visa`}
                  className="w-4/5 h-[380px] object-cover max-[600px]:object-cover rounded-xl"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 80vw, 600px"
                  quality={85}
                />
              ) : (
                <Image
                  src="/visa/serviceimg.png"
                  alt="Visa Image"
                  className="w-4/5 h-[380px] object-contain max-[600px]:object-cover rounded-xl"
                  width={600}
                  height={380}
                  sizes="(max-width: 768px) 80vw, 600px"
                  quality={85}
                />
              )}
            </div>
            {firstVisa && (
              <>
                <div className="absolute bottom-1/2 right-10 z-20 bg-orange-600 text-white px-8 py-2 text-xl font-semibold rounded-md shadow">
                  {(() => {
                    let displayPrice = parseInt(firstVisa.price)

                    if (
                      firstVisa.occupancyType === 'single' &&
                      firstVisa.pricingOptions
                    ) {
                      switch (filter) {
                        case 'In Days':
                          displayPrice = firstVisa.pricingOptions.day
                          break
                        case 'In Weeks':
                          displayPrice = firstVisa.pricingOptions.week
                          break
                        case 'Other': // This maps to "Schengen" in the UI
                          displayPrice = firstVisa.pricingOptions.schengen
                          break
                      }
                    }

                    return `₹ ${displayPrice}`
                  })()}
                </div>
                <div className="absolute w-full bottom-16 flex flex-col items-center justify-center text-white text-[11px] ">
                  <span className="p-0  text-2xl text-white uppercase font-bold">
                    {firstService.country}
                  </span>
                  {/* <div className='text-xs w-1/2  border-b border-white text-white'></div> */}
                  {/* <h3 className='text-xs bg-gray-900 text-center'> <span className='capitalize'>{firstVisa.type}</span> visa  within {firstVisa.processingTime} </h3> */}
                </div>
              </>
            )}
            <div className="absolute bottom-4 left-6 w-3/4 h-[380px] rounded-xl overflow-hidden border-4 border-orange-400" />
          </div>

          {/* Visa Cards Grid */}
          <div>
            {firstService && (
              <>
                <h3 className="text-lg md:text-xl font-semibold mb-1 flex items-center gap-2 capitalize">
                  {firstService.countryFlag && (
                    <Image
                      src={firstService.countryFlag}
                      alt={`${firstService.country} flag`}
                      className="w-6 h-auto rounded-sm"
                      width={24}
                      height={18}
                      quality={85}
                      sizes="24px"
                    />
                  )}
                  {firstService.country}
                </h3>
                {firstVisa && (
                  <p className="text-xs md:text-sm text-gray-500 mb-4 capitalize">
                    Get your visa by{' '}
                    <strong>{firstVisa.processingTime} Days</strong>
                  </p>
                )}
              </>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVisas.slice(0, 6).map((visa, i) => (
                <div
                  key={i}
                  onClick={() => handleVisaClick(visa.name)}
                  className="relative rounded-xl overflow-hidden w-full h-[170px] cursor-pointer hover:scale-105 transition-transform duration-200"
                  style={{
                    backgroundImage: `url('${visa.image}')`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/30 z-0" />
                  <div className="absolute top-0 right-0 p-2 w-full flex items-center justify-between">
                    {/* <p className="font-semibold text-[12px] text-white capitalize">{visa.name}</p> */}

                    <p className="bg-green-500 absolute top-1 right-2 text-white px-2.5 py-0.5 text-sm rounded">
                      {visa.price}
                    </p>
                  </div>
                  <div className="absolute w-full bottom-0 flex flex-col items-center justify-center text-white ">
                    <span className="p-0 font-semibold text-[12px] text-white capitalize  ">
                      {visa.name}
                    </span>
                    <div className="text-xs w-1/2  border-b border-white text-white"></div>
                    <div className="w-full text-[10px] px-1 bg-gray-900 text-center capitalize">
                      <span>{visa.visaType}</span>
                      <span> Visa within </span>
                      <span>{visa.deliveryDays}</span>
                      <span>{visa.deliveryDays > 1 ? 'days' : 'day'}</span>
                    </div>
                  </div>

                  {visa.hotListed && (
                    <div className="absolute top-0 left-0 text-white px-2 py-1 text-xl rounded">
                      🔥
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {filteredVisas.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  No hotlisted visas found for the selected filter
                </div>
                <p className="text-gray-400">
                  Try selecting a different processing option or check back
                  later
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceSection
