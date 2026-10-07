'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

interface GoogleReview {
  _id: string
  reviewId: string
  authorName: string
  authorPhotoUrl?: string
  rating: number
  text?: string
  createTime: string
  status: 'active' | 'inactive'
  relativeTimeDescription?: string
}

interface ReviewStats {
  totalReviews: number
  activeReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
}

export default function GoogleReviewsSettings() {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchSettings()
  }, [currentPage])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/google-reviews/settings')
      const data = await response.json()

      if (data.success) {
        setPlaceId(data.data.placeId || '')
        setHasApiKey(data.data.hasApiKey)
        setIsConfigured(data.data.isConfigured)
        // Don't set the full API key, only show masked version
        if (data.data.hasApiKey && !showApiKey) {
          // Keep the masked version for display
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    }
  }

  const saveSettings = async () => {
    if (!apiKey || !placeId) {
      toast.error('Please enter both API Key and Place ID')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/google-reviews/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          placeId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Settings saved successfully')
        setHasApiKey(data.data.hasApiKey)
        setIsConfigured(data.data.isConfigured)
        setPlaceId(data.data.placeId)
        // Clear the API key input after saving for security
        setApiKey('')
        setShowApiKey(false)
        // Refresh reviews to update stats
        await fetchReviews()
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/google-reviews?page=${currentPage}&limit=10`
      )
      const data = await response.json()

      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        toast.error('Failed to fetch reviews')
      }
    } catch (error) {
      toast.error('Failed to fetch reviews')
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncReviews = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/admin/google-reviews/sync', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        toast.success(
          `Sync completed: ${data.data.synced} new, ${data.data.updated} updated`
        )
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to sync reviews')
      }
    } catch (error) {
      toast.error('Failed to sync reviews')
      console.error('Error syncing reviews:', error)
    } finally {
      setSyncing(false)
    }
  }

  const toggleReviewStatus = async (
    reviewId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await fetch('/api/admin/google-reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Review ${newStatus === 'active' ? 'activated' : 'deactivated'}`
        )
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to update review')
      }
    } catch (error) {
      toast.error('Failed to update review')
      console.error('Error updating review:', error)
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(
        `/api/admin/google-reviews?reviewId=${reviewId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Review deleted successfully')
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to delete review')
      }
    } catch (error) {
      toast.error('Failed to delete review')
      console.error('Error deleting review:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Google Reviews Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your Google My Business reviews and sync settings
        </p>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Reviews</CardTitle>
                  <CardDescription>
                    Manage your synced Google reviews
                  </CardDescription>
                </div>
                <Button
                  onClick={syncReviews}
                  disabled={syncing || !isConfigured}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
                  />
                  {syncing ? 'Syncing...' : 'Sync Reviews'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isConfigured && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Google My Business API credentials are not configured.
                    Please set up your API key and Place ID in the Settings tab.
                  </AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.authorPhotoUrl ? (
                              <img
                                src={review.authorPhotoUrl}
                                alt={review.authorName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-semibold text-sm">
                                {review.authorName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {review.authorName}
                              </h4>
                              <Badge
                                variant={
                                  review.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {review.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {review.relativeTimeDescription ||
                                  formatDate(review.createTime)}
                              </span>
                            </div>
                            {review.text && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {review.text}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleReviewStatus(review.reviewId, review.status)
                            }
                          >
                            {review.status === 'active' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReview(review.reviewId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        No reviews found. Sync reviews to get started.
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(prev => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(prev => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure your Google Places API credentials directly from here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To use Google Reviews, you need to set up Google Places API
                  credentials. Enter your API Key and Place ID below. These
                  settings are stored securely in the database.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">Google Places API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder={
                        hasApiKey
                          ? 'Enter new API key to update'
                          : 'Enter your Google Places API key'
                      }
                      className="flex-1"
                    />
                    {hasApiKey && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {hasApiKey && !apiKey && (
                    <p className="text-xs text-gray-500 mt-1">
                      API key is configured. Enter a new key to update it.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="placeId">Google Place ID</Label>
                  <Input
                    id="placeId"
                    value={placeId}
                    onChange={e => setPlaceId(e.target.value)}
                    placeholder="Enter your Google Place ID"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      Configuration status:{' '}
                      <span
                        className={
                          isConfigured
                            ? 'text-green-600 font-semibold'
                            : 'text-yellow-600 font-semibold'
                        }
                      >
                        {isConfigured ? 'Configured' : 'Not configured'}
                      </span>
                    </span>
                  </div>
                  <Button
                    onClick={saveSettings}
                    disabled={saving || (!apiKey && hasApiKey) || !placeId}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Statistics</CardTitle>
              <CardDescription>
                Overview of your Google reviews performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.totalReviews}
                    </div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.activeReviews}
                    </div>
                    <div className="text-sm text-gray-600">Active Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.averageRating}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No statistics available. Sync reviews to see stats.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
