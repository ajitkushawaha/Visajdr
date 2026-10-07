import { useState } from 'react';

interface BookingData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceType: 'visa' | 'travel-insurance';
  serviceDetails: any;
  totalAmount: number;
  bookingDate?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface StatusUpdateData {
  bookingId: string;
  customerEmail: string;
  status: string;
  serviceType: 'visa' | 'travel-insurance';
}

export function useEmailService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendBookingConfirmation = async (data: BookingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/email/send-booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send booking confirmation email');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendStatusUpdate = async (data: StatusUpdateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/email/send-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send status update email');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendBookingConfirmation,
    sendStatusUpdate,
    loading,
    error,
    clearError: () => setError(null)
  };
}
