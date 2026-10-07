'use client'

import { useState, useEffect } from 'react'
import GoogleReviewsSection from './GoogleReviewsSection'

interface ReviewsOrTestimonialsProps {
  showGoogleReviews: boolean
  googleReviewsTitle?: string
  googleReviewsDescription?: string
  testimonialsTitle: string
  testimonialsDescription: string
}

export default function ReviewsOrTestimonials({
  showGoogleReviews,
  googleReviewsTitle,
  googleReviewsDescription,
  testimonialsTitle,
  testimonialsDescription,
}: ReviewsOrTestimonialsProps) {
  const [hasGoogleReviews, setHasGoogleReviews] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (showGoogleReviews) {
      checkGoogleReviews()
    } else {
      setLoading(false)
    }
  }, [showGoogleReviews])

  const checkGoogleReviews = async () => {
    try {
      const response = await fetch('/api/public/google-reviews?limit=1')
      const data = await response.json()

      if (data.success && data.data.reviews && data.data.reviews.length > 0) {
        setHasGoogleReviews(true)
      } else {
        setHasGoogleReviews(false)
      }
    } catch (error) {
      console.error('Error checking Google reviews:', error)
      setHasGoogleReviews(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    )
  }

  // Show Google Reviews if enabled and available
  if (showGoogleReviews && hasGoogleReviews) {
    return (
      <GoogleReviewsSection
        title={googleReviewsTitle || 'What Our Clients Say'}
        description={
          googleReviewsDescription ||
          'Real reviews from our satisfied customers'
        }
        showStats={true}
        limit={6}
        className="py-12 sm:py-16 lg:py-20 bg-white"
      />
    )
  }

  // Otherwise show Testimonials section
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-900">
            {testimonialsTitle}
          </h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {testimonialsDescription}
          </p>
        </div>
      </div>
    </section>
  )
}
