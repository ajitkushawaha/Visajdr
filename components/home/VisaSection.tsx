'use client'

import { VisaCard } from './VisaCard'

interface VisaType {
  type: string
  processingTimeDays?: string
  processingTime?: string
  operatingHours?: string
  // other fields...
}

interface ServiceData {
  country: string
  countryImage: string
  visaTypes: VisaType[]
  hotlistedCount?: number
}

interface VisaSectionProps {
  title: string
  services: ServiceData[]
}

export function VisaSection({ title, services }: VisaSectionProps) {
  const getProcessingDate = (
    value: string | undefined,
    unit: string | undefined,
    operatingHours?: string
  ) => {
    if (!value) return 'soon'

    if (unit === 'in-days' || unit === 'schengen') {
      const trimmed = String(value).trim()
      const count = parseInt(trimmed, 10)
      if (!isNaN(count)) {
        if (unit === 'in-days' && count == 3) {
          return 'Get appointment within 72 hours'
        }
        const text = operatingHours || ''
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
        const date = addBiz(new Date(), count)
        const dateStr = date.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        return `Get visa on ${dateStr}`
      }
    }

    return value
  }

  // Generate a deterministic random number for processed count based on country name
  const getProcessedCount = (country: string) => {
    let hash = 0
    for (let i = 0; i < country.length; i++) {
      hash = country.charCodeAt(i) + ((hash << 5) - hash)
    }
    // Map to range 20k - 200k
    const count = Math.abs(hash % 180) + 20
    return `${count}k+`
  }

  if (!services || services.length === 0) return null

  // Limit to 5 services
  const displayedServices = services.slice(0, 5)

  return (
    <section className="py-2">
      <div className="w-11/12 max-[600px]:w-[95%] mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedServices.map((service, index) => (
            <VisaCard
              key={`${service.country}-${index}`}
              country={service.country}
              image={service.countryImage}
              processedCount={getProcessedCount(service.country)}
              processingDate={getProcessingDate(
                service.visaTypes[0]?.processingTime,
                service.visaTypes[0]?.processingTimeDays,
                service.visaTypes[0]?.operatingHours
              )}
              link={`/select-plan?country=${encodeURIComponent(service.country)}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
