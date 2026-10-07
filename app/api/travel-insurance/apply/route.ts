import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'
import TravelInsurance from '@/models/TravelInsurance'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const formData = await request.formData()
    console.log('Travel Insurance Form Data Keys:', Array.from(formData.keys()))
    console.log('Travel Insurance Form Data Values:', {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      destination: formData.get('destination'),
      insuranceId: formData.get('insuranceId'),
      planType: formData.get('planType'),
      totalPremium: formData.get('totalPremium'),
      passport: formData.get('passport') ? 'File present' : 'No file',
      photo: formData.get('photo') ? 'File present' : 'No file',
    })

    // Extract form data
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const nationality = formData.get('nationality') as string
    const passportNumber = formData.get('passportNumber') as string
    const passportExpiry = formData.get('passportExpiry') as string
    const destination = formData.get('destination') as string
    const purpose = formData.get('purpose') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const numberOfTravelers = parseInt(
      formData.get('numberOfTravelers') as string
    )
    const insuranceId = formData.get('insuranceId') as string
    const planType = formData.get('planType') as string
    const totalPremium = parseFloat(formData.get('totalPremium') as string)

    // Get files
    const passport = formData.get('passport') as File
    const photo = formData.get('photo') as File
    const visa = formData.get('visa') as File

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !nationality ||
      !passportNumber ||
      !passportExpiry ||
      !destination ||
      !purpose ||
      !startDate ||
      !endDate ||
      !numberOfTravelers ||
      !insuranceId ||
      !planType ||
      !totalPremium ||
      !passport ||
      !photo
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Get insurance plan details
    console.log('Looking for insurance plan with ID:', insuranceId)
    let insurance = await TravelInsurance.findById(insuranceId)
    console.log('Insurance plan found by ID:', insurance ? 'Yes' : 'No')

    // If not found by ID, try to find by country and planType as fallback
    if (!insurance && destination && planType) {
      console.log('Trying fallback search with:', { destination, planType })
      const fallbackInsurance = await TravelInsurance.findOne({
        country: destination,
        planType: planType.toLowerCase(),
        status: 'active',
      })

      if (fallbackInsurance) {
        console.log('Found insurance plan via fallback:', fallbackInsurance._id)
        insurance = fallbackInsurance
        // Update the insuranceId to use the found one
        insuranceId = fallbackInsurance._id.toString()
      }
    }

    if (!insurance) {
      console.error(
        'Insurance plan not found by ID or fallback. Searched for:',
        {
          insuranceId,
          destination,
          planType,
          allActivePlans: await TravelInsurance.find({
            status: 'active',
          }).select('_id country planType'),
        }
      )
      return NextResponse.json(
        {
          error: 'Insurance plan not found',
          debug: {
            searchedId: insuranceId,
            destination,
            planType,
            suggestion:
              'Please ensure the travel insurance plan exists in the database for this country and plan type',
          },
        },
        { status: 404 }
      )
    }

    // Upload documents to Cloudinary
    const passportResult = await uploadImage(passport, 'travel-insurance')
    const photoResult = await uploadImage(photo, 'travel-insurance')

    // Extract URLs from Cloudinary response
    const passportUrl =
      typeof passportResult === 'string' ? passportResult : passportResult.url
    const photoUrl =
      typeof photoResult === 'string' ? photoResult : photoResult.url

    let visaUrl = ''
    if (visa) {
      const visaResult = await uploadImage(visa, 'travel-insurance')
      visaUrl = typeof visaResult === 'string' ? visaResult : visaResult.url
    }

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Create travel insurance application
    const application = new TravelInsuranceApplication({
      userId: session.user.id,
      insuranceId,
      personalInfo: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        passportNumber,
        passportExpiry: new Date(passportExpiry),
      },
      tripDetails: {
        destination,
        purpose,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfTravelers,
      },
      documents: {
        passport: passportUrl,
        photo: photoUrl,
        visa: visaUrl || undefined,
      },
      selectedPlan: {
        planType,
        coverage: insurance.coverage,
        duration,
        totalPremium,
      },
      totalAmount: totalPremium,
    })

    await application.save()

    return NextResponse.json({
      success: true,
      message: 'Travel insurance application submitted successfully',
      trackingId: application.trackingId,
      applicationId: application._id,
      status: application.status,
    })
  } catch (error) {
    console.error('Travel insurance application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit travel insurance application' },
      { status: 500 }
    )
  }
}
