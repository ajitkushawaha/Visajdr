'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Swiper from '@/components/home/TestimonialSwiper'

interface Testimonial {
  _id?: string
  text: string
  name: string
  date: string
  rating?: number
  avatar?: string
  order: number
  status: 'active' | 'inactive'
}

interface TestimonialsSection {
  _id?: string
  badgeText: string
  title: string
  description: string
  backgroundImagePath: string
  backgroundColor?: string
  stats: {
    title: string
    value: string
    description: string
    backgroundColor: string
    textColor?: string
    position: 'left' | 'right' | 'center'
    order: number
    status: 'active' | 'inactive'
  }[]
  testimonials: Testimonial[]
  status: 'active' | 'inactive'
  order: number
}

interface TestimonialsProps {
  initialData?: TestimonialsSection | null
}

const Testimonials = ({ initialData }: TestimonialsProps = {}) => {
  // Initialize with server-side data if provided
  const [sectionContent, setSectionContent] =
    useState<TestimonialsSection | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)

  useEffect(() => {
    // Only fetch if no server-side data provided
    if (initialData) {
      setSectionContent(initialData)
      setLoading(false)
      return
    }

    fetchTestimonialsContent()
  }, [initialData])

  const fetchTestimonialsContent = async () => {
    try {
      const response = await fetch('/api/public/testimonials-content', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }

      const data = await response.json()

      if (data.success && data.testimonialsSection) {
        setSectionContent(data.testimonialsSection)
      } else {
        console.error('Invalid response format:', data)
      }
    } catch (error) {
      console.error('Error fetching testimonials content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="w-4/5 mx-auto">
          <div className="animate-pulse">
            <div className="text-center mb-16">
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
            <div className="flex gap-8 items-center justify-center">
              <div className="h-64 bg-gray-300 rounded-2xl w-80"></div>
              <div className="h-64 bg-gray-300 rounded-2xl w-80"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!sectionContent) {
    return null // Don't render anything until data is loaded
  }

  // Filter active stats and sort by order
  const activeStats = sectionContent.stats
    .filter(stat => stat.status === 'active')
    .sort((a, b) => a.order - b.order)

  return (
    <section
      className="bg-white py-20"
      style={{
        backgroundImage: sectionContent.backgroundImagePath
          ? `url('${sectionContent.backgroundImagePath}')`
          : 'none',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom center',
        backgroundColor: sectionContent.backgroundColor || '#ffffff',
      }}
    >
      <div className="w-4/5 mx-auto">
        <div className="text-center mb-16 max-[600px]:mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[16px] uppercase text-gray-700">
              {sectionContent.badgeText}
            </span>
            <svg
              width="15"
              height="12"
              viewBox="0 0 15 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2006_29)">
                <path
                  d="M4.9248 10.3748L6.49525 9.68052L5.62485 9.07031L4.9248 10.3748Z"
                  fill="#07034F"
                />
                <path
                  d="M4.9248 10.3743L4.99976 8L13.9078 0L5.66407 9.1113L4.9248 10.3743Z"
                  fill="#07034F"
                />
                <path d="M5 8L13.908 0L0 6.22704L5 8Z" fill="#07034F" />
                <path
                  d="M6 9.1113L10.2928 12L14.2437 0L6 9.1113Z"
                  fill="#EC3237"
                />
              </g>
              <defs>
                <clipPath id="clip0_2006_29">
                  <rect width="14.2437" height="12" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 lowercase">
            {sectionContent.title}
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            {sectionContent.description}
          </p>
        </div>

        <div className="flex gap-8 items-center justify-center max-[600px]:flex-col relative">
          {/* Left: Testimonial */}
          <Swiper
            testimonials={sectionContent.testimonials.filter(
              t => t.status === 'active'
            )}
          />

          {/* Right: Illustration and Stats */}
          <div className="relative bg-white rounded-2xl overflow-hidden">
            <Image
              src="/visa/human.png"
              alt="Thumbs Up Illustration"
              width={577}
              height={577}
              className="object-contain"
              quality={85}
              sizes="(max-width: 768px) 300px, 400px"
            />
            {activeStats.map((stat, index) => (
              <div
                key={stat._id || index}
                className={`absolute ${stat.position === 'left' ? 'bottom-14 sm:bottom-1/3 left-12 sm:left-1/4 max-[600px]:bottom-0' : stat.position === 'right' ? 'bottom-12 right-0 sm:bottom-1/4 sm:right-12' : 'bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'} text-white px-4 py-3 rounded-lg text-4xl font-semibold shadow-lg`}
                style={{ backgroundColor: stat.backgroundColor }}
              >
                {stat.value}
                <p className="text-xs font-normal">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
