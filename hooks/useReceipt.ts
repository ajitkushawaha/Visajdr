import { useState } from 'react'
import { downloadReceipt } from '@/lib/receiptGenerator'

interface ReceiptData {
  trackingId: string
  applicationId: string
  status: string
  submittedDate: string
  estimatedProcessingDate: string
  actualProcessingDate?: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    purpose: string
  }
  visaDetails: {
    country: string
    visaType: string
    price: number
    processingTime: string
    stayPeriod: string
    validity: string
  }
  payment: {
    baseAmount: number
    convenienceFees: {
      onlineProcessing: number
      paymentMethod: number
      expressService: number
      documentProcessing: number
      total: number
    }
    totalAmount: number
    paymentMethod: string
    paymentStatus: string
  }
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
}

export function useReceipt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadApplicationReceipt = async (trackingId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Starting receipt download for tracking ID:', trackingId)

      const response = await fetch(`/api/public/receipt/${trackingId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch receipt data`
        )
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate receipt')
      }

      console.log('Receipt data received:', data.receipt)

      // Download the receipt
      await downloadReceipt(data.receipt)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download receipt'
      setError(errorMessage)
      console.error('Receipt download error:', err)
      throw err // Re-throw to allow components to handle the error
    } finally {
      setLoading(false)
    }
  }

  return {
    downloadApplicationReceipt,
    loading,
    error,
  }
}
