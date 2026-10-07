'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MapPin, Calendar } from 'lucide-react';

interface GoogleReview {
  _id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text?: string;
  createTime: string;
  relativeTimeDescription?: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

interface GoogleReviewsSectionProps {
  title?: string;
  description?: string;
  showStats?: boolean;
  limit?: number;
  className?: string;
}

const GoogleReviewsSection = ({ 
  title = "What Our Clients Say", 
  description = "Real reviews from our satisfied customers",
  showStats = true,
  limit = 6,
  className = ""
}: GoogleReviewsSectionProps) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [limit]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/google-reviews?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600 mb-8">
              {error || 'No reviews available at the moment.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 mb-8">{description}</p>
          
          {/* Google Reviews Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image
              src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
              alt="Google"
              width={60}
              height={20}
              className="h-5 w-auto"
            />
            <span className="text-sm text-gray-600">Reviews</span>
          </div>

          {/* Stats */}
          {showStats && stats && (
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                <span className="ml-2 font-semibold">{stats.averageRating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{stats.totalReviews} reviews</span>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {review.authorPhotoUrl ? (
                      <Image
                        src={review.authorPhotoUrl}
                        alt={review.authorName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold text-sm">
                        {review.authorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {review.authorName}
                    </h4>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {review.relativeTimeDescription || formatDate(review.createTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              {review.text && (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  {review.text}
                </p>
              )}

              {/* Google Attribution */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Image
                    src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                    alt="Google"
                    width={40}
                    height={14}
                    className="h-3 w-auto"
                  />
                  <span>Google Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Reviews Link */}
        {stats && stats.totalReviews > limit && (
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/search?q=site:google.com+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all {stats.totalReviews} reviews on Google
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
