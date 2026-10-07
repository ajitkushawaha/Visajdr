import GoogleReview from '@/models/GoogleReview'

export interface GoogleReviewData {
  reviewId: string
  authorName: string
  authorPhotoUrl?: string
  rating: number
  text?: string
  createTime: string
  language?: string
  originalLanguage?: string
  relativeTimeDescription?: string
}

export interface GooglePlaceReviewResponse {
  reviews: GoogleReviewData[]
  nextPageToken?: string
}

export class GoogleMyBusinessAPI {
  private apiKey: string
  private placeId: string

  constructor(apiKey: string, placeId: string) {
    this.apiKey = apiKey
    this.placeId = placeId
  }

  /**
   * Fetch reviews from Google Places API
   */
  async fetchReviews(): Promise<GoogleReviewData[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=reviews&key=${this.apiKey}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Google Places API error: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new Error(
          `Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`
        )
      }

      if (!data.result || !data.result.reviews) {
        console.log('No reviews found for this place')
        return []
      }

      return data.result.reviews.map((review: any) => ({
        reviewId: review.time?.toString() || `${Date.now()}_${Math.random()}`,
        authorName: review.author_name || 'Anonymous',
        authorPhotoUrl: review.profile_photo_url,
        rating: review.rating || 0,
        text: review.text || '',
        createTime: new Date(review.time * 1000).toISOString(),
        language: review.language,
        originalLanguage: review.original_language,
        relativeTimeDescription: review.relative_time_description,
      }))
    } catch (error) {
      console.error('Error fetching Google reviews:', error)
      throw error
    }
  }

  /**
   * Sync reviews from Google and store in database
   */
  async syncReviews(): Promise<{
    synced: number
    updated: number
    errors: number
  }> {
    try {
      const googleReviews = await this.fetchReviews()
      let synced = 0
      let updated = 0
      let errors = 0

      for (const reviewData of googleReviews) {
        try {
          const existingReview = await GoogleReview.findOne({
            reviewId: reviewData.reviewId,
          })

          if (existingReview) {
            // Update existing review
            existingReview.authorName = reviewData.authorName
            existingReview.authorPhotoUrl = reviewData.authorPhotoUrl
            existingReview.rating = reviewData.rating
            existingReview.text = reviewData.text
            existingReview.createTime = new Date(reviewData.createTime)
            existingReview.language = reviewData.language
            existingReview.originalLanguage = reviewData.originalLanguage
            existingReview.relativeTimeDescription =
              reviewData.relativeTimeDescription
            existingReview.placeId = this.placeId

            await existingReview.save()
            updated++
          } else {
            // Create new review
            await GoogleReview.create({
              reviewId: reviewData.reviewId,
              authorName: reviewData.authorName,
              authorPhotoUrl: reviewData.authorPhotoUrl,
              rating: reviewData.rating,
              text: reviewData.text,
              createTime: new Date(reviewData.createTime),
              synced: true,
              status: 'active',
              placeId: this.placeId,
              language: reviewData.language,
              originalLanguage: reviewData.originalLanguage,
              relativeTimeDescription: reviewData.relativeTimeDescription,
            })
            synced++
          }
        } catch (error) {
          console.error(`Error syncing review ${reviewData.reviewId}:`, error)
          errors++
        }
      }

      return { synced, updated, errors }
    } catch (error) {
      console.error('Error syncing Google reviews:', error)
      throw error
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(): Promise<{
    totalReviews: number
    activeReviews: number
    averageRating: number
    ratingDistribution: { [key: number]: number }
  }> {
    try {
      const totalReviews = await GoogleReview.countDocuments({
        placeId: this.placeId,
      })
      const activeReviews = await GoogleReview.countDocuments({
        placeId: this.placeId,
        status: 'active',
      })

      const reviews = await GoogleReview.find({
        placeId: this.placeId,
        status: 'active',
      }).select('rating')

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0

      const ratingDistribution = reviews.reduce(
        (dist, review) => {
          dist[review.rating] = (dist[review.rating] || 0) + 1
          return dist
        },
        {} as { [key: number]: number }
      )

      return {
        totalReviews,
        activeReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      }
    } catch (error) {
      console.error('Error getting review stats:', error)
      throw error
    }
  }
}

/**
 * Create Google My Business API instance with provided credentials
 */
export function createGoogleMyBusinessAPI(
  apiKey?: string,
  placeId?: string
): GoogleMyBusinessAPI {
  // Use provided credentials or fall back to environment variables for backward compatibility
  const finalApiKey = apiKey || process.env.GOOGLE_MY_BUSINESS_API_KEY
  const finalPlaceId = placeId || process.env.GOOGLE_PLACE_ID

  if (!finalApiKey) {
    throw new Error(
      'Google Places API Key is required. Please configure it in Admin Settings → Google Reviews.'
    )
  }

  if (!finalPlaceId) {
    throw new Error(
      'Google Place ID is required. Please configure it in Admin Settings → Google Reviews.'
    )
  }

  return new GoogleMyBusinessAPI(finalApiKey, finalPlaceId)
}
