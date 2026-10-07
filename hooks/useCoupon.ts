import { useState } from 'react';

interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
    maxDiscount?: number;
    minAmount?: number;
  };
  error?: string;
}

export function useCoupon() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult['coupon'] | null>(null);

  const validateCoupon = async (code: string, country?: string, visaType?: string, amount?: number): Promise<CouponValidationResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/public/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          country,
          visaType,
          amount
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate coupon');
      }

      if (result.valid) {
        setAppliedCoupon(result.coupon);
        return result;
      } else {
        setError(result.error);
        return result;
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to validate coupon';
      setError(errorMessage);
      return {
        valid: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setError(null);
  };

  const calculateDiscount = (originalAmount: number): { discountAmount: number; finalAmount: number } => {
    if (!appliedCoupon) {
      return { discountAmount: 0, finalAmount: originalAmount };
    }

    let discountAmount = 0;

    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (originalAmount * appliedCoupon.discountValue) / 100;
      
      // Apply maximum discount limit if set
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      // Fixed amount discount
      discountAmount = appliedCoupon.discountValue;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return { discountAmount, finalAmount };
  };

  return {
    validateCoupon,
    removeCoupon,
    calculateDiscount,
    appliedCoupon,
    loading,
    error,
    clearError: () => setError(null)
  };
}
