import { useState, useEffect } from 'react';

interface ActiveCoupon {
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
  applicableVisas: string[];
  applicableCountries: string[];
  endDate: string;
  usageLimit?: number;
  usedCount: number;
}

export function useActiveCoupons(country?: string, visaType?: string, amount?: number) {
  const [coupons, setCoupons] = useState<ActiveCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCoupons = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (visaType) params.append('visaType', visaType);
      if (amount) params.append('amount', amount.toString());

      const response = await fetch(`/api/public/active-coupons?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch active coupons');
      }

      setCoupons(result.coupons || []);
    } catch (err: any) {
      console.error('Error fetching active coupons:', err);
      setError(err.message || 'Failed to fetch active coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCoupons();
  }, [country, visaType, amount]);

  return {
    coupons,
    loading,
    error,
    refetch: fetchActiveCoupons
  };
}
