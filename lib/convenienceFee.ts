// Removed unused IVisaApplication import

export interface ConvenienceFeeSettings {
  isActive: boolean
  fees: {
    onlineProcessing: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
    paymentMethod: {
      razorpay: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      stripe: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      upi: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      cashfree: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      card: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
    }
    expressService: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
    documentProcessing: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
  }
}

export interface FeeBreakdown {
  onlineProcessing: number
  paymentMethod: number
  expressService: number
  documentProcessing: number
  total: number
  baseAmount: number
  totalAmount: number
}

export function calculateConvenienceFees(
  baseAmount: number,
  paymentMethod: string,
  settings: ConvenienceFeeSettings,
  options?: {
    expressService?: boolean
    documentProcessing?: boolean
    visaProcessingFee?: number // Visa-specific processing fee (overrides global onlineProcessing fee)
  }
): FeeBreakdown {
  if (!settings.isActive && !options?.visaProcessingFee) {
    return {
      onlineProcessing: options?.visaProcessingFee || 0,
      paymentMethod: 0,
      expressService: 0,
      documentProcessing: 0,
      total: options?.visaProcessingFee || 0,
      baseAmount,
      totalAmount: baseAmount + (options?.visaProcessingFee || 0),
    }
  }

  let onlineProcessingFee = 0
  let paymentMethodFee = 0
  let expressServiceFee = 0
  let documentProcessingFee = 0

  // Calculate online processing fee
  // Priority: Use visa-specific processing fee if provided, otherwise use global onlineProcessing fee
  if (options?.visaProcessingFee && options.visaProcessingFee > 0) {
    // Use visa-specific processing fee (ALWAYS override global fee when visa-specific fee is provided)
    onlineProcessingFee = options.visaProcessingFee
  } else if (settings.isActive && settings.fees.onlineProcessing.isActive) {
    // Use global online processing fee (only if visa-specific fee is NOT provided)
    if (settings.fees.onlineProcessing.type === 'percentage') {
      onlineProcessingFee =
        (baseAmount * settings.fees.onlineProcessing.amount) / 100
    } else {
      onlineProcessingFee = settings.fees.onlineProcessing.amount
    }
  }

  // Calculate payment method fee (only if global settings are active)
  if (settings.isActive) {
    const paymentMethodKey =
      paymentMethod.toLowerCase() as keyof typeof settings.fees.paymentMethod
    if (settings.fees.paymentMethod[paymentMethodKey]?.isActive) {
      const feeConfig = settings.fees.paymentMethod[paymentMethodKey]
      if (feeConfig.type === 'percentage') {
        paymentMethodFee = (baseAmount * feeConfig.amount) / 100
      } else {
        paymentMethodFee = feeConfig.amount
      }
    }

    // Calculate express service fee
    if (options?.expressService && settings.fees.expressService.isActive) {
      if (settings.fees.expressService.type === 'percentage') {
        expressServiceFee =
          (baseAmount * settings.fees.expressService.amount) / 100
      } else {
        expressServiceFee = settings.fees.expressService.amount
      }
    }

    // Calculate document processing fee
    if (
      options?.documentProcessing &&
      settings.fees.documentProcessing.isActive
    ) {
      if (settings.fees.documentProcessing.type === 'percentage') {
        documentProcessingFee =
          (baseAmount * settings.fees.documentProcessing.amount) / 100
      } else {
        documentProcessingFee = settings.fees.documentProcessing.amount
      }
    }
  }

  const totalFees =
    onlineProcessingFee +
    paymentMethodFee +
    expressServiceFee +
    documentProcessingFee
  const totalAmount = baseAmount + totalFees

  return {
    onlineProcessing: Math.round(onlineProcessingFee * 100) / 100,
    paymentMethod: Math.round(paymentMethodFee * 100) / 100,
    expressService: Math.round(expressServiceFee * 100) / 100,
    documentProcessing: Math.round(documentProcessingFee * 100) / 100,
    total: Math.round(totalFees * 100) / 100,
    baseAmount,
    totalAmount: Math.round(totalAmount * 100) / 100,
  }
}

export function formatFeeAmount(
  amount: number,
  type: 'fixed' | 'percentage'
): string {
  if (type === 'percentage') {
    return `${amount}%`
  }
  return `₹${amount.toFixed(2)}`
}

export function getFeeDescription(settings: ConvenienceFeeSettings): string[] {
  const descriptions: string[] = []

  if (settings.isActive) {
    if (settings.fees.onlineProcessing.isActive) {
      descriptions.push(
        `${settings.fees.onlineProcessing.description}: ${formatFeeAmount(settings.fees.onlineProcessing.amount, settings.fees.onlineProcessing.type)}`
      )
    }

    Object.entries(settings.fees.paymentMethod).forEach(([method, fee]) => {
      if (fee.isActive) {
        descriptions.push(
          `${fee.description}: ${formatFeeAmount(fee.amount, fee.type)}`
        )
      }
    })

    if (settings.fees.expressService.isActive) {
      descriptions.push(
        `${settings.fees.expressService.description}: ${formatFeeAmount(settings.fees.expressService.amount, settings.fees.expressService.type)}`
      )
    }

    if (settings.fees.documentProcessing.isActive) {
      descriptions.push(
        `${settings.fees.documentProcessing.description}: ${formatFeeAmount(settings.fees.documentProcessing.amount, settings.fees.documentProcessing.type)}`
      )
    }
  }

  return descriptions
}
