'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Shield,
  Plane,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { formatUserDate } from '@/lib/dateUtils'

interface InsurancePlan {
  id: string
  planType: string
  coverage: {
    medicalExpenses: number
    tripCancellation: number
    baggageLoss: number
    flightDelay: number
    personalAccident: number
  }
  duration: {
    minDays: number
    maxDays: number
  }
  price: {
    perDay: number
    basePrice: number
  }
  features: Array<{
    name: string
    description: string
    included: boolean
  }>
}

interface CountryPlans {
  [country: string]: InsurancePlan[]
}

export default function SelectPlanPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)
  const [tripDuration, setTripDuration] = useState(1)
  const [totalPremium, setTotalPremium] = useState(0)
  const [availablePlans, setAvailablePlans] = useState<CountryPlans>({})

  // Get form data from URL params
  const country = searchParams.get('country') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const residence = searchParams.get('residence') || ''

  // Calculate trip duration
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const duration = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      setTripDuration(Math.max(1, duration))
    }
  }, [startDate, endDate])

  // Fetch available plans from TravelInsurance API (database, not CMS)
  useEffect(() => {
    const fetchInsurancePlans = async () => {
      try {
        const response = await fetch('/api/public/travel-insurance')
        const data = await response.json()

        if (data.success && data.plans) {
          // Get plans for the selected country
          const countryPlans = data.plans[country] || []

          // Convert to the expected format
          const convertedPlans = countryPlans.map((plan: any) => ({
            id: plan.id, // This is the TravelInsurance document _id
            planType: plan.planType,
            coverage: plan.coverage,
            duration: plan.duration,
            price: plan.price,
            features: plan.features || [],
          }))

          // Set plans for the selected country
          setAvailablePlans({
            [country]: convertedPlans,
          })
        } else {
          // Fallback: try CMS content if database doesn't have plans
          const cmsResponse = await fetch(
            '/api/public/travel-insurance-content'
          )
          const cmsData = await cmsResponse.json()

          if (cmsData.success && cmsData.travelInsurancePage) {
            const plans = cmsData.travelInsurancePage.plans.filter(
              (plan: any) => plan.status === 'active'
            )

            // Convert CMS data to the expected format
            const convertedPlans = plans.map((plan: any, index: number) => ({
              id: plan._id || `plan-${index}`, // Note: This is CMS plan ID, not TravelInsurance ID
              planType: plan.name.toLowerCase().replace(/\s+/g, '-'),
              coverage: {
                medicalExpenses:
                  plan.name === 'Basic Plan'
                    ? 500000
                    : plan.name === 'Standard Plan'
                      ? 1000000
                      : 2500000,
                tripCancellation:
                  plan.name === 'Basic Plan'
                    ? 100000
                    : plan.name === 'Standard Plan'
                      ? 200000
                      : 500000,
                baggageLoss:
                  plan.name === 'Basic Plan'
                    ? 50000
                    : plan.name === 'Standard Plan'
                      ? 100000
                      : 200000,
                flightDelay:
                  plan.name === 'Basic Plan'
                    ? 25000
                    : plan.name === 'Standard Plan'
                      ? 50000
                      : 100000,
                personalAccident:
                  plan.name === 'Basic Plan'
                    ? 100000
                    : plan.name === 'Standard Plan'
                      ? 200000
                      : 500000,
              },
              duration: {
                minDays: 1,
                maxDays: 365,
              },
              price: {
                perDay:
                  parseInt(plan.price.replace('₹', '').replace(',', '')) || 0,
                basePrice: 0,
              },
              features: (plan.features || []).map((feature: string) => ({
                name: feature,
                description: feature,
                included: true,
              })),
            }))

            // Set plans for the selected country
            setAvailablePlans({
              [country]: convertedPlans,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching insurance plans:', error)
      }
    }

    if (country) {
      fetchInsurancePlans()
    }
  }, [country])

  // Calculate premium when plan or duration changes
  useEffect(() => {
    if (selectedPlan) {
      const premium =
        selectedPlan.price.perDay * tripDuration + selectedPlan.price.basePrice
      setTotalPremium(premium)
    }
  }, [selectedPlan, tripDuration])

  const handlePlanSelect = (plan: InsurancePlan) => {
    setSelectedPlan(plan)
    // Scroll to top when plan is selected
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => {
    if (!selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please select a plan to continue',
        variant: 'destructive',
      })
      return
    }

    if (!session) {
      toast({
        title: 'Login Required',
        description: 'Please login to continue with your application',
        variant: 'destructive',
      })
      router.push('/auth/login')
      return
    }

    // Navigate to application form with plan data
    const params = new URLSearchParams({
      country,
      startDate,
      endDate,
      residence,
      planId: selectedPlan.id,
      planType: selectedPlan.planType,
      totalPremium: totalPremium.toString(),
      tripDuration: tripDuration.toString(),
    })

    router.push(`/travel-insurance/apply?${params.toString()}`)
  }

  const handleBack = () => {
    router.push('/travel-insurance')
  }

  if (!country || !startDate || !endDate || !residence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">
              Missing Information
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Please fill in all required fields on the previous page
            </p>
            <Button onClick={handleBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-light-green py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-brand-primary mb-4">
            Select Your Travel Insurance Plan
          </h1>
          <p className="text-sm md:text-lg text-gray-600">
            Choose the coverage that best fits your needs for {country}
          </p>
        </div>

        {/* Trip Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-primary">
              Trip Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <div>
                  <div className="text-sm text-gray-600">Destination</div>
                  <div className="font-semibold">{country}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-secondary" />
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold">{tripDuration} days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <div>
                  <div className="text-sm text-gray-600">Travel Dates</div>
                  <div className="font-semibold">
                    {formatUserDate(startDate)} - {formatUserDate(endDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <div>
                  <div className="text-sm text-gray-600">Residence</div>
                  <div className="font-semibold">{residence}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {availablePlans[country] ? (
            availablePlans[country].map(plan => (
              <Card
                key={plan.planType}
                className={`cursor-pointer transition-all ${
                  selectedPlan?.planType === plan.planType
                    ? 'ring-2 ring-brand-primary bg-brand-primary/5'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader className="text-center">
                  <CardTitle className="capitalize">{plan.planType}</CardTitle>
                  <div className="text-xl md:text-2xl font-bold text-brand-primary">
                    ₹{plan.price.perDay}/day
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Base: ₹{plan.price.basePrice}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="text-center">
                      <div className="text-sm md:text-lg font-semibold">
                        Medical Coverage
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-brand-secondary">
                        ₹{plan.coverage.medicalExpenses.toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Trip Cancellation:</span>
                        <div>
                          ₹{plan.coverage.tripCancellation.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Baggage Loss:</span>
                        <div>₹{plan.coverage.baggageLoss.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(feature => (
                      <li
                        key={feature.name}
                        className="flex items-center text-xs md:text-sm"
                      >
                        <Check className="w-4 h-4 text-brand-secondary mr-2" />
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600">No plans available for {country}</p>
              <Button onClick={handleBack} className="mt-4">
                Choose Different Country
              </Button>
            </div>
          )}
        </div>

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <Card className="mb-8 bg-brand-primary/5 border-brand-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-brand-primary">
                    Selected Plan: {selectedPlan.planType}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Trip Duration: {tripDuration} days | Total Premium: ₹
                    {totalPremium.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-brand-primary">
                    ₹{totalPremium.toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Total Premium
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="flex items-center gap-2"
          >
            Continue to Application
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
