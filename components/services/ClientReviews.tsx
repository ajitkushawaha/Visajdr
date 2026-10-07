'use client'

import React from 'react'
import { MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReviewItem {
  name: string
  location: string
  date: string
  rating: number
  title: string
  comment: string
  initials: string
  color: string
  travelerType: string
  image?: string
}

interface ClientReviewsProps {
  reviews: ReviewItem[]
}

export default function ClientReviews({ reviews }: ClientReviewsProps) {
  const [visibleReviews, setVisibleReviews] = React.useState(3)

  if (!reviews || reviews.length === 0) return null

  // Reverse the reviews to show most recent first
  const reversedReviews = [...reviews].reverse()

  return (
    <div className="space-y-6">
      {reversedReviews.slice(0, visibleReviews).map((review, idx) => (
        <Card
          key={idx}
          className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {review.image ? (
                <div className="size-12 rounded-full overflow-hidden border border-slate-100">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`size-12 rounded-full ${review.color || 'bg-brand-primary'} flex items-center justify-center text-white font-bold text-lg`}
                >
                  {review.initials}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900">{review.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="size-3" />
                  <span>{review.location}</span>
                  <span className="mx-1">•</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>
          <h5 className="font-bold text-slate-800 mb-2">{review.title}</h5>
          <p className="text-slate-600 text-sm leading-relaxed">
            {review.comment}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none font-medium text-[10px] uppercase tracking-wider"
            >
              {review.travelerType || 'Verified Traveler'}
            </Badge>
          </div>
        </Card>
      ))}

      {reversedReviews.length > visibleReviews && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="rounded-full px-8 hover:bg-primary hover:text-white transition-colors border-primary text-primary"
            onClick={() => setVisibleReviews(prev => prev + 3)}
          >
            Show More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}
