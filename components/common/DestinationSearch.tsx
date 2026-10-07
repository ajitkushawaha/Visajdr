'use client'

import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn, formatCountryName } from '@/lib/utils'

let COUNTRIES_CACHE: Array<{
  id: string
  country: string
  flag?: string
  image?: string
  processingTime?: string
}> | null = null
let COUNTRIES_FETCHING: Promise<
  Array<{
    id: string
    country: string
    flag?: string
    image?: string
    processingTime?: string
  }>
> | null = null

interface Country {
  id: string
  country: string
  flag?: string
  image?: string
  processingTime?: string
}

interface DestinationSearchProps {
  className?: string
  inputClassName?: string
  placeholder?: string
  variant?: 'navbar' | 'hero'
  initialCountries?: Country[]
}

export function DestinationSearch({
  className,
  inputClassName,
  placeholder = 'Search destination',
  variant = 'navbar',
  initialCountries,
}: DestinationSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [countries, setCountries] = useState<Country[]>(
    initialCountries?.map(c => ({
      id: c.id,
      country: c.country,
      flag: c.flag || '🏳️',
      image: c.image,
      processingTime: c.processingTime,
    })) || []
  )
  const [loading, setLoading] = useState(!initialCountries)
  const fetchGuardRef = useRef(false)

  // Sync with initialCountries prop changes
  useEffect(() => {
    if (initialCountries) {
      setCountries(
        initialCountries.map(c => ({
          id: c.id,
          country: c.country,
          flag: c.flag || '🏳️',
          image: c.image,
          processingTime: c.processingTime,
        }))
      )
      setLoading(false)
    }
  }, [initialCountries])

  // Fetch countries if not provided
  useEffect(() => {
    if (initialCountries) return
    if (COUNTRIES_CACHE) {
      setCountries(COUNTRIES_CACHE)
      setLoading(false)
      return
    }
    if (COUNTRIES_FETCHING) {
      setLoading(true)
      COUNTRIES_FETCHING.then(list => {
        setCountries(list)
        setLoading(false)
      })
      return
    }
    fetchGuardRef.current = true

    let alive = true
    setLoading(true)

    const fetchCountries = async () => {
      try {
        COUNTRIES_FETCHING = fetch('/api/public/visa', {
          cache: 'no-store',
          next: { revalidate: 0 },
        })
          .then(async res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const list: Country[] = Array.isArray(data?.uniqueCountries)
              ? data.uniqueCountries
              : []
            const formatted = list.map(country => ({
              ...country,
              country: formatCountryName(country.country),
            }))
            COUNTRIES_CACHE = formatted
            return formatted
          })
          .catch(() => {
            const fallback: Country[] = [
              { id: '1', country: 'United States', flag: '🇺🇸' },
              { id: '2', country: 'United Kingdom', flag: '🇬🇧' },
              { id: '3', country: 'Canada', flag: '🇨🇦' },
              { id: '4', country: 'Australia', flag: '🇦🇺' },
              { id: '5', country: 'Germany', flag: '🇩🇪' },
              { id: '6', country: 'France', flag: '🇫🇷' },
              { id: '7', country: 'Italy', flag: '🇮🇹' },
              { id: '8', country: 'Spain', flag: '🇪🇸' },
            ]
            COUNTRIES_CACHE = fallback
            return fallback
          })

        const formattedList = await COUNTRIES_FETCHING
        if (alive) setCountries(formattedList)
      } catch (err) {
        console.error('Failed to load countries', err)
        if (alive) {
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
        if (alive) setLoading(false)
      }
    }

    fetchCountries()

    return () => {
      alive = false
    }
  }, [initialCountries])

  const nameToId = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of countries) map.set(c.country.toLowerCase(), c.id)
    return map
  }, [countries])

  const trimmedQuery = query.trim().toLowerCase()
  const filteredCountries =
    trimmedQuery.length >= 3
      ? countries
          .filter(c => c.country.toLowerCase().startsWith(trimmedQuery))
          .slice(0, 10)
      : []

  const handleSearch = () => {
    const q = query.trim()
    if (!q) return

    // Logic to find exact match or fallback
    const id = nameToId.get(q.toLowerCase())
    const byStarts = countries.find(c =>
      c.country.toLowerCase().startsWith(q.toLowerCase())
    )

    router.push(`/select-plan?country=${encodeURIComponent(q)}`)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (country: Country) => {
    setQuery(country.country)
    setShowSuggestions(false)
    router.push(`/select-plan?country=${encodeURIComponent(country.country)}`)
  }

  // Close suggestions on outside click (simplified for now, relying on blur/delay)
  // Or global scroll event like in HeroSection
  useEffect(() => {
    const handleScroll = () => setShowSuggestions(false)
    document.addEventListener('scroll', handleScroll, true)
    return () => document.removeEventListener('scroll', handleScroll, true)
  }, [])

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <input
        type="text"
        className={cn(
          'w-full outline-none bg-gray-50 text-base md:text-sm text-gray-700 placeholder:text-gray-400 bg-transparent',
          variant === 'navbar'
            ? 'py-3 pl-6 pr-14 bg-gray-50 border rounded-full'
            : 'py-2 pr-10',
          inputClassName
        )}
        placeholder={placeholder}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setShowSuggestions(true)
        }}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {variant === 'navbar' ? (
        <button
          onClick={handleSearch}
          className="absolute right-1 top-1 bottom-1 bg-brand-primary hover:bg-[#1e40af]/90 text-white rounded-full transition-colors flex items-center justify-center aspect-square"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <Search
          className="absolute right-3 text-gray-600 cursor-pointer"
          size={20}
          onClick={handleSearch}
        />
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredCountries.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50 text-left">
          {filteredCountries.map(country => (
            <div
              key={country.id}
              role="option"
              onClick={() => handleSuggestionClick(country)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-black flex items-center gap-3 border-b last:border-0 border-gray-100"
              onMouseDown={e => e.preventDefault()} // Prevent blur before click
            >
              {/* Image Container */}
              <div className="relative w-12 h-8 flex-shrink-0 overflow-hidden rounded bg-gray-100 shadow-sm">
                {country.image ? (
                  <Image
                    src={country.image}
                    alt={country.country}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                ) : country.flag &&
                  (country.flag.startsWith('http') ||
                    country.flag.startsWith('/') ||
                    country.flag.startsWith('data:')) ? (
                  <Image
                    src={country.flag}
                    alt=""
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    {country.flag}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col justify-center">
                <span className="font-medium text-gray-900 text-sm leading-tight">
                  {country.country}
                </span>
                {country.processingTime && (
                  <span className="text-[10px] text-blue-600 mt-0.5 font-medium">
                    {country.processingTime}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
