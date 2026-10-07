import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Visa from '@/models/Visa'
import ConvenienceFee from '@/models/ConvenienceFee'
import { calculateConvenienceFees } from '@/lib/convenienceFee'
import { emailService } from '@/lib/emailService'

// Pre-create a visa application as a draft/pending prior to payment.
// Returns trackingId and server-calculated amounts to be used for payment order creation.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const contentType = request.headers.get('content-type') || ''
    let formData: FormData | null = null
    let jsonBody: any = null

    if (contentType.includes('application/json')) {
      jsonBody = await request.json()
      // Temporary debug log to see full request body
      console.log('🔍 DEBUG Full Request Body:', jsonBody)
    } else {
      formData = await request.formData()
    }

    // Extract core fields
    const firstName = formData
      ? (formData.get('firstName') as string)
      : (jsonBody?.firstName as string)
    const lastName = formData
      ? (formData.get('lastName') as string)
      : (jsonBody?.lastName as string)
    const email = formData
      ? (formData.get('email') as string)
      : (jsonBody?.email as string)
    const phone = formData
      ? (formData.get('phone') as string)
      : (jsonBody?.phone as string)
    const nationality = formData
      ? (formData.get('nationality') as string)
      : (jsonBody?.nationality as string)
    const occupation = formData
      ? (formData.get('occupation') as string)
      : (jsonBody?.occupation as string)
    const purpose = formData
      ? (formData.get('purpose') as string)
      : (jsonBody?.purpose as string)
    const countryId = formData
      ? (formData.get('countryId') as string)
      : (jsonBody?.countryId as string)
    const additionalInfo = formData
      ? (formData.get('additionalInfo') as string) || ''
      : (jsonBody?.additionalInfo as string) || ''
    const startDate = formData
      ? (formData.get('startDate') as string)
      : (jsonBody?.startDate as string)
    const endDate = formData
      ? (formData.get('endDate') as string)
      : (jsonBody?.endDate as string)

    const passportNumber = formData
      ? (formData.get('passportNumber') as string)
      : (jsonBody?.passportNumber as string)
    const passportExpiry = formData
      ? (formData.get('passportExpiry') as string)
      : (jsonBody?.passportExpiry as string)

    const passportUrl = formData
      ? (formData.get('passportUrl') as string | null)
      : (jsonBody?.passportUrl as string | null)
    const photoUrl = formData
      ? (formData.get('photoUrl') as string | null)
      : (jsonBody?.photoUrl as string | null)

    // Optional flag to save as draft (not yet submitted)
    const draft = formData
      ? (formData.get('draft') as string) === 'true'
      : Boolean(jsonBody?.draft)

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nationality ||
      !countryId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Documents are optional during pre-create/draft. They can be uploaded later.

    // Get visa details and convenience fees
    const visa = await Visa.findById(countryId)
    if (!visa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    // Get convenience fees from ConvenienceFee collection
    const convenienceFeeDoc = await ConvenienceFee.findOne({})
    const convenienceFeeSettings = convenienceFeeDoc
      ? {
          isActive: convenienceFeeDoc.isActive,
          fees: convenienceFeeDoc.fees,
        }
      : null

    const baseAmount = parseFloat(visa.adultPrice || visa.price || '0')
    const paymentMethod = formData
      ? (formData.get('paymentMethod') as string) || 'cashfree'
      : (jsonBody?.paymentMethod as string) || 'cashfree'

    // Get visa-specific processing fee (if visa has a processing fee set, use it - always takes priority over global fee)
    // Note: processingFeeEnabled only controls UI visibility, not whether the fee is used
    const visaProcessingFee =
      visa.processingFee && parseFloat(visa.processingFee) > 0
        ? parseFloat(visa.processingFee)
        : undefined

    const feeBreakdown = calculateConvenienceFees(
      baseAmount,
      paymentMethod,
      convenienceFeeSettings ||
        ({
          isActive: false,
          fees: {
            onlineProcessing: {
              isActive: false,
              amount: 0,
              type: 'fixed' as const,
              description: '',
            },
            paymentMethod: {
              razorpay: {
                isActive: false,
                amount: 0,
                type: 'fixed' as const,
                description: '',
              },
              stripe: {
                isActive: false,
                amount: 0,
                type: 'fixed' as const,
                description: '',
              },
              upi: {
                isActive: false,
                amount: 0,
                type: 'fixed' as const,
                description: '',
              },
              card: {
                isActive: false,
                amount: 0,
                type: 'fixed' as const,
                description: '',
              },
            },
            expressService: {
              isActive: false,
              amount: 0,
              type: 'fixed' as const,
              description: '',
            },
            documentProcessing: {
              isActive: false,
              amount: 0,
              type: 'fixed' as const,
              description: '',
            },
          },
        } as any),
      {
        visaProcessingFee:
          visaProcessingFee && visaProcessingFee > 0
            ? visaProcessingFee
            : undefined,
      }
    )

    // Extract coupon discount from request
    let couponDiscount = null
    try {
      if (formData?.get('couponDiscount')) {
        const couponStr = formData.get('couponDiscount') as string
        couponDiscount = couponStr ? JSON.parse(couponStr) : null
      } else if (jsonBody && 'couponDiscount' in jsonBody) {
        // Check if couponDiscount exists in jsonBody (even if null)
        couponDiscount = jsonBody.couponDiscount
        // Handle case where couponDiscount might be a string
        if (typeof couponDiscount === 'string') {
          try {
            couponDiscount = JSON.parse(couponDiscount)
          } catch (e) {
            couponDiscount = null
          }
        }
      }
    } catch (error) {
      couponDiscount = null
    }

    // Temporary debug log to trace coupon issue
    console.log('🔍 DEBUG Pre-create Coupon:', {
      hasFormData: !!formData?.get('couponDiscount'),
      hasJsonBody: !!jsonBody?.couponDiscount,
      couponDiscount,
      couponDiscountType: typeof couponDiscount,
      couponKeys: couponDiscount ? Object.keys(couponDiscount) : null,
    })

    // Calculate final amount with discount
    // feeBreakdown.totalAmount already includes baseAmount + all fees
    const discountAmount = couponDiscount
      ? Number(couponDiscount.discountAmount || couponDiscount.discount || 0)
      : 0

    const finalAmount = Math.round(
      discountAmount > 0 && discountAmount < feeBreakdown.totalAmount
        ? feeBreakdown.totalAmount - discountAmount
        : feeBreakdown.totalAmount
    )

    // Temporary debug log to trace amount calculation
    console.log('🔍 DEBUG Pre-create Amount:', {
      baseAmount,
      feeBreakdownTotal: feeBreakdown.totalAmount,
      discountAmount,
      finalAmount,
      calculation: `${feeBreakdown.totalAmount} - ${discountAmount} = ${finalAmount}`,
    })

    // Check if an application already exists for this user with the same countryId
    // If it exists and is in pending/draft status, update it with new amounts and discount
    const existingApplication = await VisaApplication.findOne({
      userId: (session.user as any).id,
      visaId: countryId,
      paymentStatus: { $ne: 'completed' },
      status: { $in: ['Pending', 'draft', 'pending'] },
    }).sort({ createdAt: -1 })

    let application
    if (existingApplication) {
      // Store old totalAmount for logging before updating
      const oldTotalAmount = existingApplication.totalAmount

      // Update existing application with new amounts and discount
      existingApplication.totalAmount = finalAmount
      existingApplication.convenienceFees = {
        onlineProcessing: feeBreakdown.onlineProcessing,
        paymentMethod: feeBreakdown.paymentMethod,
        expressService: feeBreakdown.expressService,
        documentProcessing: feeBreakdown.documentProcessing,
        total: feeBreakdown.total,
      }
      existingApplication.baseAmount = baseAmount
      existingApplication.paymentMethod = paymentMethod as any
      if (couponDiscount) {
        existingApplication.couponDiscount = {
          couponCode: couponDiscount.code || couponDiscount.couponCode || '',
          discountAmount: discountAmount,
          discountType: couponDiscount.discountType || 'fixed',
        }
      } else {
        // Clear discount if no coupon provided
        existingApplication.couponDiscount = undefined
      }
      // Update personal info if provided
      if (firstName) existingApplication.personalInfo.firstName = firstName
      if (lastName) existingApplication.personalInfo.lastName = lastName
      if (email) existingApplication.personalInfo.email = email
      if (phone) existingApplication.personalInfo.phone = phone
      if (nationality)
        existingApplication.personalInfo.nationality = nationality
      if (occupation) existingApplication.personalInfo.occupation = occupation
      if (purpose) existingApplication.personalInfo.purpose = purpose
      if (startDate)
        existingApplication.personalInfo.startDate = new Date(startDate)
      if (endDate) existingApplication.personalInfo.endDate = new Date(endDate)
      if (passportNumber)
        existingApplication.personalInfo.passportNumber = passportNumber
      if (passportExpiry)
        existingApplication.personalInfo.passportExpiry = new Date(
          passportExpiry
        )
      if (additionalInfo)
        existingApplication.documents.additionalInfo = additionalInfo
      if (passportUrl) {
        existingApplication.documents.passport = {
          url: passportUrl,
          originalName: 'passport',
        }
      }
      if (photoUrl) {
        existingApplication.documents.photo = {
          url: photoUrl,
          originalName: 'photo',
        }
      }
      await existingApplication.save()
      application = existingApplication
    } else {
      // Create a new pending application (no email, no status history to submitted yet)
      application = new VisaApplication({
        userId: (session.user as any).id,
        visaId: countryId,
        personalInfo: {
          firstName,
          lastName,
          email,
          phone,
          nationality,
          occupation,
          purpose,
          passportNumber,
          passportExpiry: passportExpiry ? new Date(passportExpiry) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
        documents: {
          passport: passportUrl
            ? { url: passportUrl, originalName: 'passport' }
            : undefined,
          photo: photoUrl
            ? { url: photoUrl, originalName: 'photo' }
            : undefined,
          additionalInfo,
        },
        visaDetails: {
          country: visa.country,
          visaType: visa.visaType,
          price: baseAmount,
          processingTime:
            visa.processingTimeValue || visa.processingTime || 'N/A',
          stayPeriod: visa.stayPeriod || 'N/A',
          validity: visa.validity || 'N/A',
        },
        paymentMethod,
        totalAmount: finalAmount,
        status: draft ? 'draft' : 'Pending', // NEW: unpaid booking
        convenienceFees: {
          onlineProcessing: feeBreakdown.onlineProcessing,
          paymentMethod: feeBreakdown.paymentMethod,
          expressService: feeBreakdown.expressService,
          documentProcessing: feeBreakdown.documentProcessing,
          total: feeBreakdown.total,
        },
        baseAmount,
        couponDiscount: couponDiscount
          ? {
              couponCode:
                couponDiscount.code || couponDiscount.couponCode || '',
              discountAmount: discountAmount,
              discountType: couponDiscount.discountType || 'fixed',
            }
          : undefined,
        estimatedProcessingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentStatus: 'pending',
      })

      await application.save()

      // Record initial status history
      await VisaApplication.findByIdAndUpdate(application._id, {
        $push: {
          statusHistory: {
            status: draft ? 'draft' : 'pending',
            changedBy: (session.user as any).id,
            changedByRole: 'user',
            changedByName: `${firstName} ${lastName}`,
            timestamp: new Date(),
            notes: draft
              ? 'Draft saved'
              : 'Application pre-created, awaiting payment',
            reason: '',
          },
        },
      })
    }

    // Send email reminder if not a draft (i.e. proceeding to payment)
    // NOTE: Email is now handled by cron job (15 min delay) to avoid premature notifications

    return NextResponse.json({
      success: true,
      message: 'Application pre-created successfully',
      trackingId: application.trackingId,
      applicationId: (application as any)._id.toString(), // Convert to string for storage
      status: application.status,
      amounts: {
        baseAmount,
        convenience: feeBreakdown.total,
        finalAmount,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to pre-create application' },
      { status: 500 }
    )
  }
}
