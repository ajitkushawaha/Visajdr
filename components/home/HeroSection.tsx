'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'
import { formatCountryName } from '@/lib/utils'
import { DestinationSearch } from '../common/DestinationSearch'

// Utility function imported from @/lib/utils

interface Country {
  id: string
  country: string
  flag?: string
  image?: string
  processingTime?: string
}

interface HeroSectionProps {
  // Admin preview props (optional)
  adminData?: {
    title?: string
    description?: string
    highlightedText?: string
    highlightedTextColor?: string
    backgroundImage?: string
    mainImage?: string
    mainImageAlt?: string
    bottomLabel?: string
    searchPlaceholder?: string
    floatingCountries?: Array<{
      country: string
      flag: string
      position: string
    }>
  }
  // Countries list from server-side (optional)
  countries?: Array<{
    id: string
    country: string
    flag?: string
    image?: string
    processingTime?: string
  }>
}

const HeroSection = ({
  adminData,
  countries: initialCountries,
}: HeroSectionProps = {}) => {
  const router = useRouter()
  // Initialize with server-side countries if available
  const [countries, setCountries] = useState<Country[]>(
    initialCountries?.map(c => ({
      id: c.id,
      country: c.country,
      flag: c.flag || '🏳️',
      image: c.image,
      processingTime: c.processingTime,
    })) || []
  )
  // Only show loading if we don't have server-side data
  const [loading, setLoading] = useState(!adminData || !initialCountries)
  // Initialize with server-side data if available
  const [heroContent, setHeroContent] = useState<any>(adminData || null)

  // Fetch hero content and countries in parallel for better performance
  // Only fetch hero content if not provided via props (server-side)
  useEffect(() => {
    let alive = true
    setLoading(true)
    ;(async () => {
      try {
        // Only fetch hero content if not provided via adminData prop
        const fetchPromises = [
          adminData
            ? Promise.resolve(null) // Skip hero content fetch if already provided
            : fetch('/api/public/hero-content', {
                cache: 'no-store',
              }),
          fetch('/api/public/visa', {
            cache: 'no-store',
            next: { revalidate: 0 },
          }),
        ]

        const [heroRes, visaRes] = await Promise.all(fetchPromises)

        if (!alive) return

        // Process hero content only if we fetched it
        if (heroRes && heroRes.ok) {
          const heroData = await heroRes.json()
          if (alive && heroData.heroSection) {
            setHeroContent(heroData.heroSection)
          }
        } else if (adminData && alive) {
          // If adminData was provided, we already have heroContent initialized
          // Don't set loading to false here, wait for countries to load
        }

        // Process countries only if not provided server-side
        if (!initialCountries && visaRes && visaRes.ok) {
          const visaData = await visaRes.json()
          const list: Country[] = Array.isArray(visaData?.uniqueCountries)
            ? visaData.uniqueCountries
            : []
          if (alive) {
            // Format country names to Title Case
            const formattedList = list.map(country => ({
              ...country,
              country: formatCountryName(country.country),
            }))
            setCountries(formattedList)
          }
        } else if (initialCountries && alive) {
          // Countries already provided server-side, just format them
          const formattedList = initialCountries.map(country => ({
            id: country.id,
            country: formatCountryName(country.country),
            flag: country.flag || '🏳️',
            image: country.image,
            processingTime: country.processingTime,
          }))
          setCountries(formattedList)
        } else if (visaRes && !visaRes.ok && !initialCountries) {
          throw new Error(`HTTP ${visaRes.status}`)
        }
      } catch (err) {
        console.error('Failed to load data', err)
        if (alive) {
          // Set some default countries if API fails
          setCountries([
            { id: '1', country: 'United States', flag: '🇺🇸' },
            { id: '2', country: 'United Kingdom', flag: '🇬🇧' },
            { id: '3', country: 'Canada', flag: '🇨🇦' },
            { id: '4', country: 'Australia', flag: '🇦🇺' },
            { id: '5', country: 'Germany', flag: '🇩🇪' },
            { id: '6', country: 'France', flag: '🇫🇷' },
            { id: '7', country: 'Italy', flag: '🇮🇹' },
            { id: '8', country: 'Spain', flag: '🇪🇸' },
          ])
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    })()

    return () => {
      alive = false
    }
  }, [adminData, initialCountries]) // Re-run if adminData or countries change

  // Preload hero image for faster loading
  useEffect(() => {
    const imageUrl =
      adminData?.mainImage || heroContent?.mainImage || '/visa/Rectangle.png'
    if (imageUrl && imageUrl.startsWith('http')) {
      // Preload external images
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = imageUrl
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [adminData?.mainImage, heroContent?.mainImage])

  const handleCountryClick = (country: string) => {
    router.push(`/select-plan?country=${encodeURIComponent(country)}`)
  }

  // Function to render title with highlighted text
  const renderTitleWithHighlight = (
    title: string,
    highlightedText: string,
    highlightColor: string
  ) => {
    if (!highlightedText) return title

    const parts = title.split(highlightedText)
    if (parts.length === 1) return title

    return (
      <>
        {parts[0]}
        <span className={highlightColor}>{highlightedText}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <section
      className="py-20 min-h-screen bg-[#07034f] text-white m-auto"
      style={{
        backgroundImage: `url('${adminData?.backgroundImage || heroContent?.backgroundImage || '/visa/Vector.png'}')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
      }}
    >
      <div className="w-4/5 max-[600px]:w-[95%] mx-auto flex flex-col md:flex-row items-center justify-between py-6 sm:px-6 lg:px-8 gap-10">
        {/* Left Text Content */}
        <div className="md:w-1/2 flex flex-col text-white text-center md:text-left gap-3 px-2 relative">
          <h1 className="text-xl max-[600px]:text-2xl md:text-4xl font-bold leading-tight sm:mb-4 sm:py-4">
            {renderTitleWithHighlight(
              adminData?.title ||
                heroContent?.title ||
                'Apply for Your Visa Online with Visa4 - Fast, Secure & Hassle-Free',
              adminData?.highlightedText ||
                heroContent?.highlightedText ||
                'Visa4',
              adminData?.highlightedTextColor ||
                heroContent?.highlightedTextColor ||
                'text-red-500'
            )}
          </h1>
          <p className="text-xs md:text-sm text-white/90 mb-6 sm:mb-2 ">
            {adminData?.description ||
              heroContent?.description ||
              'Planning A Trip Abroad And Want To Make The Visa Application Process As Quick And Cost-Effective As Possible? Enlist The Support Of Our Visa Agent In India And Get Qualified Assistance From Us.'}
          </p>

          {/* Search Box */}
          <DestinationSearch
            variant="hero"
            className="relative flex items-center w-full rounded-md bg-white"
            inputClassName="w-full pr-10 py-2 bg-transparent border-0 outline-none text-gray-800"
            initialCountries={countries}
            placeholder={
              adminData?.searchPlaceholder ||
              heroContent?.searchPlaceholder ||
              'Enter Destination'
            }
          />

          {/* Country Pills */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {loading
              ? // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-4 py-1 text-[10px] rounded-full border border-white/30 animate-pulse bg-white/10"
                  >
                    <div className="w-12 h-3 bg-white/20 rounded"></div>
                  </div>
                ))
              : (countries || [])
                  .slice(0, 4)
                  .map((country: Country, i: number) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountryClick(country.country)}
                      className={`px-4 py-1 text-[10px] rounded-full cursor-pointer border hover:bg-red-600 hover:border-red-600 ${
                        i === 0
                          ? 'bg-red-600 text-white border-red-600'
                          : 'text-white border-white'
                      }`}
                    >
                      {country.country}
                    </button>
                  ))}
          </div>
        </div>

        {/* Right Image + Floating Labels */}
        <div className="md:w-1/2 h-[66vh] relative flex justify-center items-center ">
          <div className="rounded-2xl h-full overflow-hidden flex justify-center items-center">
            <Image
              src={(() => {
                const imageUrl =
                  adminData?.mainImage ||
                  heroContent?.mainImage ||
                  '/visa/Rectangle.png'
                // Optimize Cloudinary URLs
                if (imageUrl.includes('cloudinary.com')) {
                  return optimizeCloudinaryUrl(imageUrl, {
                    width: 1200,
                    height: 900,
                    quality: 'auto:good',
                    format: 'auto',
                  })
                }
                return imageUrl
              })()}
              alt={
                adminData?.mainImageAlt ||
                heroContent?.mainImageAlt ||
                'Dubai City'
              }
              width={1200}
              height={900}
              sizes="(max-width: 768px) 80vw, 50vw"
              className="object-cover w-4/5 h-full max-[600px]:w-[80%] border-4 border-yellow-600 rounded-2xl"
              priority
              fetchPriority="high"
              quality={85}
            />
          </div>

          {/* Floating Visa Labels */}
          {(
            adminData?.floatingCountries || heroContent?.floatingCountries
          )?.map((country: any, index: number) => (
            <button
              key={index}
              onClick={() => handleCountryClick(country.country)}
              className={`absolute bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200 ${
                country.position === 'top-left'
                  ? 'top-4 left-4'
                  : country.position === 'top-right'
                    ? 'top-4 right-2'
                    : country.position === 'center-left'
                      ? 'top-2/2 left-4 transform -translate-y-2/2'
                      : country.position === 'center-right'
                        ? 'top-2/2 right-4 transform -translate-y-2/2'
                        : country.position === 'bottom-right'
                          ? 'bottom-4 right-4 '
                          : country.position === 'bottom-left'
                            ? 'bottom-4 left-4 max-[600px]:left-2'
                            : 'bottom-4 right-0 max-[600px]:right-2'
              }`}
            >
              {country.flag} {country.country}
            </button>
          )) || (
            // Default floating countries
            <>
              <button
                onClick={() => handleCountryClick('China')}
                className="absolute top-4 left-4 bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
              >
                🇨🇳 China
              </button>
              <button
                onClick={() => handleCountryClick('Albania')}
                className="absolute top-4 right-4 bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
              >
                🇦🇱 Albania
              </button>
              <button
                onClick={() => handleCountryClick('India')}
                className="absolute top-2/2 left-4 bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black transform -translate-y-2/2 cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
              >
                🇮🇳 Japan
              </button>
              <button
                onClick={() => handleCountryClick('Germany')}
                className="absolute bottom-4 left-4 max-[600px]:left-2 bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
              >
                🇩🇪 Germany
              </button>
              <button
                onClick={() => handleCountryClick('UAE')}
                className="absolute bottom-4 right-4 max-[600px]:right-4 bg-white rounded-md px-3 py-2 shadow text-sm font-medium text-black cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
              >
                🇦🇪 United States
              </button>
            </>
          )}

          {/* Bottom Label */}
          <div className="absolute bottom-2 left-2/2  transformtop-2/2 transform -translate-y-2/2  text-white text-xs md:text-sm w-40 font-bold ">
            {adminData?.bottomLabel || heroContent?.bottomLabel || (
              <>
                Get Appointment Picked <br />
                <strong>Within 82 Hours</strong>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
