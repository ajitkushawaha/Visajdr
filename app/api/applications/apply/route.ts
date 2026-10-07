import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Visa from '@/models/Visa'
import { uploadImage } from '@/lib/cloudinary'
import CompanySettings from '@/models/CompanySettings'
import { calculateConvenienceFees } from '@/lib/convenienceFee'
import { emailService } from '@/lib/emailService'
import User from '@/models/User'
import Traveler from '@/models/Traveler'
import Notification from '@/models/Notification'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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
    } else {
      formData = await request.formData()
    }
    console.log('formData', formData)
    // Extract form data
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

    // Extract files
    const passportFile = formData?.get('passport') as File | undefined
    const photoFile = formData?.get('photo') as File | undefined
    const passportUrl = formData
      ? (formData.get('passportUrl') as string | null)
      : (jsonBody?.passportUrl as string | null)
    const photoUrl = formData
      ? (formData.get('photoUrl') as string | null)
      : (jsonBody?.photoUrl as string | null)

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

    if (!passportFile && !passportUrl) {
      return NextResponse.json(
        { error: 'Passport is required' },
        { status: 400 }
      )
    }
    if (!photoFile && !photoUrl) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 })
    }

    // Get visa details
    const visa = await Visa.findById(countryId)
    console.log('visa', visa)
    if (!visa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    // Log the extracted values for debugging
    const extractedPrice = parseFloat(visa.adultPrice || visa.price || '0')
    const extractedProcessingTime =
      visa.processingTimeValue || visa.processingTime || 'N/A'
    console.log('Extracted values:', {
      price: extractedPrice,
      processingTime: extractedProcessingTime,
      adultPrice: visa.adultPrice,
      price_field: visa.price,
      processingTimeValue: visa.processingTimeValue,
      processingTime_field: visa.processingTime,
    })

    // Get company settings for convenience fees
    const companySettings = await CompanySettings.findOne({})
    const convenienceFeeSettings = companySettings?.convenienceFees

    // Get convenience fee document to check processingFeeEnabled
    const ConvenienceFee = (await import('@/models/ConvenienceFee')).default
    const convenienceFeeDoc = await ConvenienceFee.findOne({})

    // Calculate convenience fees
    const baseAmount = extractedPrice
    const paymentMethod = formData
      ? (formData.get('paymentMethod') as string) || 'razorpay'
      : (jsonBody?.paymentMethod as string) || 'razorpay'

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

    // Get coupon discount information from form data if provided
    const couponDiscount = formData?.get('couponDiscount')
      ? JSON.parse(formData?.get('couponDiscount') as string)
      : jsonBody?.couponDiscount || null

    console.log('Coupon discount from form:', couponDiscount)
    console.log('Fee breakdown:', feeBreakdown)

    // Upload images to Cloudinary
    let passportUpload: any
    let photoUpload: any
    if (passportFile && photoFile) {
      ;[passportUpload, photoUpload] = await Promise.all([
        uploadImage(
          passportFile,
          `visa-applications/${(session.user as any).id}`
        ),
        uploadImage(photoFile, `visa-applications/${(session.user as any).id}`),
      ])
    } else {
      passportUpload = passportUrl
        ? { url: passportUrl, originalName: 'passport' }
        : undefined
      photoUpload = photoUrl
        ? { url: photoUrl, originalName: 'photo' }
        : undefined
    }

    // Handle additional dynamic documents from formData (keys starting with doc_)
    const additionalDocs: Record<string, any> = {}
    if (formData) {
      const entries = Array.from(formData.entries())
      const docEntries = entries.filter(
        ([k, v]) => k.startsWith('doc_') && v instanceof File
      )
      for (const [k, v] of docEntries) {
        const key = k.replace('doc_', '')
        const uploadRes = await uploadImage(
          v as File,
          `visa-applications/${(session.user as any).id}`
        )
        const url = typeof uploadRes === 'string' ? uploadRes : uploadRes.url
        const publicId =
          typeof uploadRes === 'string' ? '' : (uploadRes as any).publicId
        additionalDocs[key] = {
          url,
          publicId,
          originalName: (v as File).name,
        }
      }
    }

    // Create visa application
    const application = new VisaApplication({
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
      },
      documents: {
        passport: passportUpload,
        photo: photoUpload,
        additionalInfo,
        additionalDocs: additionalDocs,
      },
      visaDetails: {
        country: visa.country,
        visaType: visa.visaType,
        price: parseFloat(visa.adultPrice || visa.price || '0'),
        processingTime:
          visa.processingTimeValue || visa.processingTime || 'N/A',
        stayPeriod: visa.stayPeriod || 'N/A',
        validity: visa.validity || 'N/A',
      },
      paymentMethod: paymentMethod,
      totalAmount: Math.round(
        couponDiscount
          ? feeBreakdown.totalAmount - couponDiscount.discountAmount
          : feeBreakdown.totalAmount
      ),
      status: 'submitted',
      convenienceFees: {
        onlineProcessing: feeBreakdown.onlineProcessing,
        paymentMethod: feeBreakdown.paymentMethod,
        expressService: feeBreakdown.expressService,
        documentProcessing: feeBreakdown.documentProcessing,
        total: feeBreakdown.total,
      },
      baseAmount: baseAmount,
      couponDiscount: couponDiscount
        ? {
            couponCode: couponDiscount.code || couponDiscount.couponCode || '',
            discountAmount: couponDiscount.discountAmount || 0,
            discountType: couponDiscount.discountType || 'fixed',
          }
        : undefined,
      estimatedProcessingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })

    await application.save()

    // Add initial status history entry
    const user = await User.findById((session.user as any).id)
    const statusHistoryEntry = {
      status: 'submitted',
      changedBy: (session.user as any).id,
      changedByRole: 'user' as const,
      changedByName: user?.name || `${firstName} ${lastName}`,
      timestamp: new Date(),
      notes: 'Application submitted',
      reason: '',
    }

    await VisaApplication.findByIdAndUpdate(application._id, {
      $push: { statusHistory: statusHistoryEntry },
    })

    // Send confirmation email
    try {
      await emailService.sendApplicationSubmitted(
        email,
        application.trackingId,
        {
          country: visa.country,
          visaType: visa.visaType,
          processingTime: visa.processingTime,
        }
      )
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the request if email fails
    }

    // Notify Admins about new application
    try {
      const admins = await User.find({ role: 'admin' })
      const adminNotifications = admins.map(admin => ({
        recipient: admin._id,
        type: 'application',
        title: 'New Visa Application',
        message: `User ${firstName} ${lastName} has submitted a new visa application (${application.trackingId}).`,
        relatedId: application._id,
        relatedType: 'visa-application',
        isRead: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications)
      }
    } catch (notificationError) {
      console.error('Admin notification error:', notificationError)
    }

    // Auto-save traveler for future use
    try {
      // Check if traveler already exists
      const existingTraveler = await Traveler.findOne({
        userId: (session.user as any).id,
        'personalInfo.firstName': firstName,
        'personalInfo.lastName': lastName,
      })

      if (existingTraveler) {
        // Update existing traveler
        existingTraveler.personalInfo = {
          ...existingTraveler.personalInfo,
          email,
          phone,
          nationality,
        }
        if (passportUpload) {
          existingTraveler.documents = {
            ...existingTraveler.documents,
            passportFront: passportUpload,
          }
        }
        await existingTraveler.save()
      } else {
        // Create new traveler
        await Traveler.create({
          userId: (session.user as any).id,
          relation: 'Other', // Default relation
          personalInfo: {
            firstName,
            lastName,
            email,
            phone,
            nationality,
          },
          documents: {
            passportFront: passportUpload,
          },
        })
      }
    } catch (travelerError) {
      console.error('Auto-save traveler error:', travelerError)
      // Don't fail the application if auto-save fails
    }

    // Return success with tracking ID
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      trackingId: application.trackingId,
      applicationId: application._id,
      status: application.status,
      estimatedProcessingDate: application.estimatedProcessingDate,
    })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// Get user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const query: any = { userId: (session.user as any).id }
    if (status) query.status = status

    const applications = await VisaApplication.find(query)
      .populate('visaId', 'country visaType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await VisaApplication.countDocuments(query)

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
