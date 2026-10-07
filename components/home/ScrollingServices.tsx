'use client'

import { useEffect, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { HelpCircle } from 'lucide-react'

interface ScrollingServiceItem {
  name: string
  icon: string
  order: number
  status: 'active' | 'inactive'
}

export default function ScrollingServices() {
  const [services, setServices] = useState<ScrollingServiceItem[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/public/scrolling-services', {
          cache: 'no-store',
        })
        const data = await response.json()

        if (data.success && data.scrollingServices?.items) {
          // Filter active items and sort by order
          const activeItems = data.scrollingServices.items
            .filter((item: ScrollingServiceItem) => item.status === 'active')
            .sort(
              (a: ScrollingServiceItem, b: ScrollingServiceItem) =>
                a.order - b.order
            )
          setServices(activeItems)
        } else {
          // Fallback to default data
          setServices([
            {
              name: 'Travel Packages',
              icon: 'Briefcase',
              order: 0,
              status: 'active',
            },
            {
              name: 'Travel Planning',
              icon: 'TicketsPlane',
              order: 1,
              status: 'active',
            },
            {
              name: 'Visa Assistance',
              icon: 'TicketsPlane',
              order: 2,
              status: 'active',
            },
            {
              name: 'Global Reach Immigration',
              icon: 'Globe',
              order: 3,
              status: 'active',
            },
            {
              name: 'Travel Planning',
              icon: 'PlaneTakeoff',
              order: 4,
              status: 'active',
            },
          ])
        }
      } catch (error) {
        console.error('Error fetching scrolling services:', error)
        // Fallback to default data on error
        setServices([
          {
            name: 'Travel Packages',
            icon: 'Briefcase',
            order: 0,
            status: 'active',
          },
          {
            name: 'Travel Planning',
            icon: 'TicketsPlane',
            order: 1,
            status: 'active',
          },
          {
            name: 'Visa Assistance',
            icon: 'TicketsPlane',
            order: 2,
            status: 'active',
          },
          {
            name: 'Global Reach Immigration',
            icon: 'Globe',
            order: 3,
            status: 'active',
          },
          {
            name: 'Travel Planning',
            icon: 'PlaneTakeoff',
            order: 4,
            status: 'active',
          },
        ])
      }
    }

    fetchServices()
  }, [])

  // Duplicate services for seamless scrolling (show 2 sets)
  const duplicatedServices = [...services, ...services]

  if (services.length === 0) {
    return null
  }

  return (
    <div className="bg-brand-primary overflow-hidden py-4">
      <div className="whitespace-nowrap animate-scroll flex gap-16 items-center text-white text-lg font-semibold">
        {duplicatedServices.map((item, index) => {
          // Dynamically get icon component from lucide-react
          const IconComponent =
            (item.icon && (LucideIcons as any)[item.icon]) || HelpCircle
          return (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center gap-2"
            >
              <IconComponent className="w-6 h-6" />
              <span className="font-bold">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
