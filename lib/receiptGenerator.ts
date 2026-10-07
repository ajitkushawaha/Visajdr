// Dynamic import for jsPDF to avoid build issues
const getJsPDF = async () => {
  const jsPDF = (await import('jspdf')).default
  return jsPDF
}

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
  couponDiscount?: {
    couponCode?: string
    discountAmount: number
    discountType?: 'percentage' | 'fixed'
  }
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
}

export function generateReceiptText(receiptData: ReceiptData): string {
  try {
    console.log('Generating receipt text for:', receiptData.trackingId)

    const formatCurrency = (amount: number) => {
      // Ensure proper Indian Rupee symbol for PDF
      return `₹${amount.toLocaleString('en-IN')}`
    }
    const formatDate = (date: string) => {
      try {
        return new Date(date).toLocaleDateString('en-IN')
      } catch (error) {
        console.warn('Date formatting error:', error)
        return date || 'N/A'
      }
    }

    const receiptText = `
    ─────────────────────────────────────────────────────────────
                    VISA APPLICATION RECEIPT
    ─────────────────────────────────────────────────────────────
    Company: ${receiptData.company?.name || 'Visa4 Visa Services'}
    
    📄 APPLICATION DETAILS
    ─────────────────────────────────────────────────────────────
    Tracking ID:          ${receiptData.trackingId || 'N/A'}
    Application ID:       ${receiptData.applicationId || 'N/A'}
    Status:               ${(receiptData.status || 'N/A').toUpperCase()}
    Submitted Date:       ${formatDate(receiptData.submittedDate)}
    Est. Processing:      ${formatDate(receiptData.estimatedProcessingDate)}
    ${receiptData.actualProcessingDate ? `Actual Processing:     ${formatDate(receiptData.actualProcessingDate)}` : ''}
    
    👤 APPLICANT INFORMATION
    ─────────────────────────────────────────────────────────────
    Name:                 ${receiptData.personalInfo?.firstName || 'N/A'} ${receiptData.personalInfo?.lastName || ''}
    Email:                ${receiptData.personalInfo?.email || 'N/A'}
    Phone:                ${receiptData.personalInfo?.phone || 'N/A'}
    Nationality:          ${receiptData.personalInfo?.nationality || 'N/A'}
    Purpose:              ${receiptData.personalInfo?.purpose || 'N/A'}
    
    🛂 VISA DETAILS
    ─────────────────────────────────────────────────────────────
    Country:              ${receiptData.visaDetails?.country || 'N/A'}
    Visa Type:            ${receiptData.visaDetails?.visaType || 'N/A'}
    Processing Time:      ${receiptData.visaDetails?.processingTime || 'N/A'}
    Stay Period:          ${receiptData.visaDetails?.stayPeriod || 'N/A'}
    Validity:             ${receiptData.visaDetails?.validity || 'N/A'}
    
    💰 PAYMENT SUMMARY
    ─────────────────────────────────────────────────────────────
    Base Amount:          ${formatCurrency(receiptData.payment?.baseAmount || 0)}
    
    Convenience Fees:
    ${receiptData.payment?.convenienceFees?.onlineProcessing > 0 ? `  • Online Processing:   ${formatCurrency(receiptData.payment.convenienceFees.onlineProcessing)}` : ''}
    ${receiptData.payment?.convenienceFees?.paymentMethod > 0 ? `  • Payment Gateway Fee: ${formatCurrency(receiptData.payment.convenienceFees.paymentMethod)}` : ''}
    ${receiptData.payment?.convenienceFees?.expressService > 0 ? `  • Express Service:     ${formatCurrency(receiptData.payment.convenienceFees.expressService)}` : ''}
    ${receiptData.payment?.convenienceFees?.documentProcessing > 0 ? `  • Document Processing: ${formatCurrency(receiptData.payment.convenienceFees.documentProcessing)}` : ''}
    
    Total Convenience Fees: ${formatCurrency(receiptData.payment?.convenienceFees?.total || 0)}
    ${
      receiptData.couponDiscount
        ? `
    Coupon Discount:
      • Coupon Code:        ${receiptData.couponDiscount.couponCode || 'N/A'}
      • Discount Amount:    -${formatCurrency(receiptData.couponDiscount.discountAmount || 0)}
    `
        : ''
    }
    ─────────────────────────────────────────────────────────────
    TOTAL AMOUNT PAID:    ${formatCurrency(receiptData.payment?.totalAmount || 0)}
    ─────────────────────────────────────────────────────────────
    Payment Method:       ${(receiptData.payment?.paymentMethod || 'N/A').toUpperCase()}
    Payment Status:       ${(receiptData.payment?.paymentStatus || 'N/A').toUpperCase()}
    
    📞 CONTACT INFORMATION
    ─────────────────────────────────────────────────────────────
    ${receiptData.company?.name || 'Visa4 Visa Services'}
    ${receiptData.company?.address || 'Your Company Address'}
    Phone: ${receiptData.company?.phone || '+91-XXXXXXXXXX'}
    Email: ${receiptData.company?.email || 'support@visa4.com'}
    
    📝 NOTES
    ─────────────────────────────────────────────────────────────
    • Keep this receipt for your records.
    • Use the Tracking ID to check your application status.
    • Processing times may vary by embassy workload.
    • For queries, contact our support team.
    
    ─────────────────────────────────────────────────────────────
    Thank you for choosing ${receiptData.company?.name || 'Visa4 Visa Services'}!
    Generated on: ${new Date().toLocaleString('en-IN')}
    ─────────────────────────────────────────────────────────────
    `

    console.log(
      'Receipt text generated successfully, length:',
      receiptText.length
    )
    return receiptText
  } catch (error) {
    console.error('Error generating receipt text:', error)
    throw new Error('Failed to generate receipt text')
  }
}

// Test function to verify download functionality
export function testDownload() {
  console.log('=== TESTING RECEIPT DOWNLOAD ===')

  const testData: ReceiptData = {
    trackingId: 'TEST-12345',
    applicationId: 'test-app-id',
    status: 'completed',
    submittedDate: new Date().toISOString(),
    estimatedProcessingDate: new Date().toISOString(),
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+91-1234567890',
      nationality: 'Indian',
      purpose: 'Tourism',
    },
    visaDetails: {
      country: 'United States',
      visaType: 'Tourist Visa',
      price: 200,
      processingTime: '7-10 days',
      stayPeriod: '30 days',
      validity: '1 year',
    },
    payment: {
      baseAmount: 200,
      convenienceFees: {
        onlineProcessing: 50,
        paymentMethod: 25,
        expressService: 0,
        documentProcessing: 0,
        total: 75,
      },
      totalAmount: 275,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
    },
    company: {
      name: 'Visa4 Visa Services',
      address: 'Test Address',
      phone: '+91-XXXXXXXXXX',
      email: 'support@visa4.com',
    },
  }

  console.log('Test data created:', testData)
  console.log('Starting PDF download test...')

  try {
    downloadReceipt(testData, 'test-receipt.pdf')
    console.log('=== TEST COMPLETED ===')
  } catch (error) {
    console.error('=== TEST FAILED ===', error)
  }
}

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).testReceiptDownload = testDownload
}

export async function generateReceiptPDF(
  receiptData: ReceiptData
): Promise<any> {
  try {
    console.log('Generating PDF receipt for:', receiptData.trackingId)

    const jsPDF = await getJsPDF()
    const doc = new jsPDF({
      compress: true,
      precision: 2,
    })
    // Set UTF-8 encoding for proper currency symbol support
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper function to add text with word wrap
    const addText = (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
      fontSize: number = 10
    ) => {
      doc.setFontSize(fontSize)
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * fontSize * 0.4
      } else {
        doc.text(text, x, y)
        return y + fontSize * 0.4
      }
    }

    // Helper function to add line
    const addLine = (y: number) => {
      doc.setLineWidth(0.5)
      doc.line(20, y, pageWidth - 20, y)
      return y + 5
    }

    // Header
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, pageWidth, 30, 'F')

    doc.setTextColor(255, 255, 255)
    yPosition = addText(
      'VISA APPLICATION RECEIPT',
      pageWidth / 2,
      15,
      undefined,
      16
    )
    doc.setTextColor(0, 0, 0)

    yPosition = addText(
      receiptData.company?.name || 'Visa4 Visa Services',
      pageWidth / 2,
      25,
      undefined,
      12
    )
    doc.setTextColor(0, 0, 0)

    yPosition += 10

    // Application Details
    yPosition = addText('APPLICATION DETAILS', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    const formatDate = (date: string) => {
      try {
        return new Date(date).toLocaleDateString('en-IN')
      } catch (error) {
        return date || 'N/A'
      }
    }

    yPosition = addText(
      `Tracking ID: ${receiptData.trackingId || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Application ID: ${receiptData.applicationId || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Status: ${(receiptData.status || 'N/A').toUpperCase()}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Submitted Date: ${formatDate(receiptData.submittedDate)}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Estimated Processing: ${formatDate(receiptData.estimatedProcessingDate)}`,
      20,
      yPosition
    )
    if (receiptData.actualProcessingDate) {
      yPosition = addText(
        `Actual Processing: ${formatDate(receiptData.actualProcessingDate)}`,
        20,
        yPosition
      )
    }

    yPosition += 10

    // Applicant Information
    yPosition = addText('APPLICANT INFORMATION', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    yPosition = addText(
      `Name: ${receiptData.personalInfo?.firstName || 'N/A'} ${receiptData.personalInfo?.lastName || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Email: ${receiptData.personalInfo?.email || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Phone: ${receiptData.personalInfo?.phone || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Nationality: ${receiptData.personalInfo?.nationality || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Purpose: ${receiptData.personalInfo?.purpose || 'N/A'}`,
      20,
      yPosition
    )

    yPosition += 10

    // Visa Details
    yPosition = addText('VISA DETAILS', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    yPosition = addText(
      `Country: ${receiptData.visaDetails?.country || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Visa Type: ${receiptData.visaDetails?.visaType || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Processing Time: ${receiptData.visaDetails?.processingTime || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Stay Period: ${receiptData.visaDetails?.stayPeriod || 'N/A'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Validity: ${receiptData.visaDetails?.validity || 'N/A'}`,
      20,
      yPosition
    )

    yPosition += 10

    // Payment Breakdown
    yPosition = addText('PAYMENT BREAKDOWN', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    const formatCurrency = (amount: number) => {
      // Use "Rs." as fallback for better PDF compatibility
      // The ₹ symbol may not render correctly in all PDF readers/fonts
      const formatted = amount.toLocaleString('en-IN')
      return `Rs. ${formatted}`
    }

    yPosition = addText(
      `Base Amount: ${formatCurrency(receiptData.payment?.baseAmount || 0)}`,
      20,
      yPosition
    )

    yPosition = addText('Convenience Fees:', 20, yPosition)
    if (receiptData.payment?.convenienceFees?.onlineProcessing > 0) {
      yPosition = addText(
        `  • Online Processing: ${formatCurrency(receiptData.payment.convenienceFees.onlineProcessing)}`,
        20,
        yPosition
      )
    }
    if (receiptData.payment?.convenienceFees?.paymentMethod > 0) {
      yPosition = addText(
        `  • Payment Gateway Fee: ${formatCurrency(receiptData.payment.convenienceFees.paymentMethod)}`,
        20,
        yPosition
      )
    }
    if (receiptData.payment?.convenienceFees?.expressService > 0) {
      yPosition = addText(
        `  • Express Service: ${formatCurrency(receiptData.payment.convenienceFees.expressService)}`,
        20,
        yPosition
      )
    }
    if (receiptData.payment?.convenienceFees?.documentProcessing > 0) {
      yPosition = addText(
        `  • Document Processing: ${formatCurrency(receiptData.payment.convenienceFees.documentProcessing)}`,
        20,
        yPosition
      )
    }

    yPosition = addText(
      `Total Convenience Fees: ${formatCurrency(receiptData.payment?.convenienceFees?.total || 0)}`,
      20,
      yPosition
    )

    // Coupon Discount (if applicable)
    if (receiptData.couponDiscount) {
      const discountAmount = receiptData.couponDiscount.discountAmount || 0
      // Show coupon discount if it exists, even if amount is 0 (to show coupon was used)
      if (receiptData.couponDiscount.couponCode || discountAmount > 0) {
        yPosition += 5
        yPosition = addText('Coupon Discount:', 20, yPosition)
        if (receiptData.couponDiscount.couponCode) {
          yPosition = addText(
            `  • Coupon Code: ${receiptData.couponDiscount.couponCode}`,
            20,
            yPosition
          )
        }
        if (discountAmount > 0) {
          yPosition = addText(
            `  • Discount Amount: -${formatCurrency(discountAmount)}`,
            20,
            yPosition
          )
        }
      }
    }

    yPosition = addLine(yPosition)
    yPosition = addText(
      `TOTAL AMOUNT PAID: ${formatCurrency(receiptData.payment?.totalAmount || 0)}`,
      20,
      yPosition,
      undefined,
      12
    )

    yPosition += 5
    yPosition = addText(
      `Payment Method: ${(receiptData.payment?.paymentMethod || 'N/A').toUpperCase()}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Payment Status: ${(receiptData.payment?.paymentStatus || 'N/A').toUpperCase()}`,
      20,
      yPosition
    )

    yPosition += 10

    // Contact Information
    yPosition = addText('CONTACT INFORMATION', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    yPosition = addText(
      receiptData.company?.name || 'Visa4 Visa Services',
      20,
      yPosition
    )
    yPosition = addText(
      receiptData.company?.address || 'Your Company Address',
      20,
      yPosition
    )
    yPosition = addText(
      `Phone: ${receiptData.company?.phone || '+91-XXXXXXXXXX'}`,
      20,
      yPosition
    )
    yPosition = addText(
      `Email: ${receiptData.company?.email || 'support@visa4.com'}`,
      20,
      yPosition
    )

    yPosition += 10

    // Important Notes
    yPosition = addText('IMPORTANT NOTES', 20, yPosition, undefined, 12)
    yPosition = addLine(yPosition)

    const notes = [
      '• Keep this receipt safe for your records',
      '• Use the Tracking ID to monitor your application status',
      '• Contact us if you have any questions about your application',
      '• Processing times are estimates and may vary based on embassy workload',
    ]

    notes.forEach(note => {
      yPosition = addText(note, 20, yPosition, pageWidth - 40)
    })

    yPosition += 10
    yPosition = addText(
      `Thank you for choosing ${receiptData.company?.name || 'Visa4 Visa Services'} for your visa services!`,
      20,
      yPosition,
      pageWidth - 40
    )

    yPosition += 10
    yPosition = addText(
      `Generated on: ${new Date().toLocaleString('en-IN')}`,
      20,
      yPosition
    )

    console.log('PDF generated successfully')
    return doc
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF receipt')
  }
}

export async function downloadReceipt(
  receiptData: ReceiptData,
  filename?: string
) {
  try {
    console.log('Generating PDF receipt for:', receiptData.trackingId)
    console.log('Receipt data:', receiptData)

    const doc = await generateReceiptPDF(receiptData)
    const downloadFilename =
      filename || `visa-receipt-${receiptData.trackingId}.pdf`

    console.log('Download filename:', downloadFilename)

    // Save the PDF
    doc.save(downloadFilename)

    console.log('PDF receipt downloaded successfully')
  } catch (error) {
    console.error('Error downloading PDF receipt:', error)

    // Fallback to text receipt
    try {
      console.log('Falling back to text receipt...')
      const receiptText = generateReceiptText(receiptData)
      const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download =
        filename?.replace('.pdf', '.txt') ||
        `visa-receipt-${receiptData.trackingId}.txt`
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      console.log('Text receipt downloaded as fallback')
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError)
      throw new Error(
        'Failed to download receipt. Please try again or contact support.'
      )
    }
  }
}
