'use client'

import { useState, useRef, useEffect } from 'react'
import { useActiveCoupons } from '@/hooks/useActiveCoupons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CheckCircle,
  X,
  Tag,
  Percent,
  ChevronDown,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

interface SimpleCouponInputProps {
  country?: string
  visaType?: string
  originalAmount: number
  onCouponApplied?: (
    discountAmount: number,
    finalAmount: number,
    couponData?: any
  ) => void
  onCouponRemoved?: () => void
  className?: string
}

export default function SimpleCouponInput({
  country,
  visaType,
  originalAmount,
  onCouponApplied,
  onCouponRemoved,
  className = '',
}: SimpleCouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { coupons, loading: couponsLoading } = useActiveCoupons(
    country,
    visaType,
    originalAmount
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCouponCode(value)
    setShowDropdown(true)

    // Clear selected coupon if user is typing
    if (selectedCoupon) {
      setSelectedCoupon(null)
      onCouponRemoved?.()
    }
  }

  const handleCouponSelect = (coupon: any) => {
    setCouponCode(coupon.code)
    setSelectedCoupon(coupon)
    setShowDropdown(false)
    onCouponApplied?.(coupon.discountAmount, coupon.finalAmount, coupon)
    toast.success(
      `Coupon ${coupon.code} applied! Save ${formatPrice(coupon.discountAmount)}`
    )
  }

  const handleApplyManualCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setIsValidating(true)

    try {
      const response = await fetch('/api/public/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          country,
          visaType,
          amount: originalAmount,
        }),
      })

      const result = await response.json()

      if (result.valid && result.coupon) {
        setSelectedCoupon(result.coupon)
        onCouponApplied?.(
          result.coupon.discountAmount,
          result.coupon.finalAmount,
          result.coupon
        )
        toast.success(
          `Coupon applied! Save ${formatPrice(result.coupon.discountAmount)}`
        )
      } else {
        toast.error(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      toast.error('Failed to validate coupon')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setSelectedCoupon(null)
    setShowDropdown(false)
    onCouponRemoved?.()
    toast.success('Coupon removed')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedCoupon) {
        handleRemoveCoupon()
      } else {
        handleApplyManualCoupon()
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Simple Input with Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="couponCode" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Coupon Code
        </Label>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                id="couponCode"
                value={couponCode}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
                placeholder="Enter coupon code or click to browse"
                disabled={isValidating}
                className="pr-10"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {selectedCoupon ? (
              <Button
                onClick={handleRemoveCoupon}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleApplyManualCoupon}
                disabled={isValidating || !couponCode.trim()}
                size="sm"
                className="px-4"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            )}
          </div>

          {/* Dropdown with Available Coupons */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
            >
              {couponsLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading coupons...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  <Tag className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No coupons available</p>
                </div>
              ) : (
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">
                    Available Coupons:
                  </div>
                  {coupons.map(coupon => (
                    <div
                      key={coupon.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                      onClick={() => handleCouponSelect(coupon)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {coupon.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {coupon.code}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              {coupon.discountType === 'percentage' ? (
                                <Percent className="h-3 w-3" />
                              ) : (
                                <DollarSign className="h-3 w-3" />
                              )}
                              <span className="font-semibold text-green-600">
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}% OFF`
                                  : `${formatPrice(coupon.discountValue)} OFF`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {getDaysUntilExpiry(coupon.endDate)} days left
                              </span>
                            </div>
                          </div>

                          {coupon.discountAmount > 0 && (
                            <div className="mt-1 text-sm text-green-700 font-medium">
                              Save {formatPrice(coupon.discountAmount)}
                            </div>
                          )}
                        </div>

                        <div className="ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Applied Coupon Display */}
      {selectedCoupon && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">
                    {selectedCoupon.name}
                  </p>
                  <p className="text-sm text-green-600">
                    {selectedCoupon.code}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {selectedCoupon.discountType === 'percentage' ? (
                    <Percent className="h-4 w-4 text-green-600" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-bold text-green-800">
                    {selectedCoupon.discountType === 'percentage'
                      ? `${selectedCoupon.discountValue}%`
                      : `${formatPrice(selectedCoupon.discountValue)}`}
                  </span>
                </div>
                <p className="text-sm text-green-600">
                  Save {formatPrice(selectedCoupon.discountAmount)}
                </p>
              </div>
            </div>

            {selectedCoupon.description && (
              <p className="text-sm text-green-700 mt-2">
                {selectedCoupon.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
