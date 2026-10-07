import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TravelInsurancePage from '@/models/TravelInsurancePage'

export async function GET() {
  try {
    await connectDB()
    let travelInsurancePage = await TravelInsurancePage.findOne().lean()

    // Migration: Convert old heroPoweredByLogoText to heroPoweredByLogoUrl if needed
    if (travelInsurancePage) {
      const doc = travelInsurancePage as any
      let needsUpdate = false
      const setFields: any = {}
      const unsetFields: any = {}

      // If old field exists and new field doesn't, migrate
      if (doc.heroPoweredByLogoText && !doc.heroPoweredByLogoUrl) {
        setFields.heroPoweredByLogoUrl = ''
        unsetFields.heroPoweredByLogoText = ''
        needsUpdate = true
      }

      // Ensure new field exists with default
      if (
        doc.heroPoweredByLogoUrl === undefined ||
        doc.heroPoweredByLogoUrl === null
      ) {
        setFields.heroPoweredByLogoUrl = ''
        needsUpdate = true
      }

      if (needsUpdate) {
        // Use updateOne to avoid validation issues
        const updateQuery: any = {}
        if (Object.keys(setFields).length > 0) {
          updateQuery.$set = setFields
        }
        if (Object.keys(unsetFields).length > 0) {
          updateQuery.$unset = unsetFields
        }

        await TravelInsurancePage.updateOne({ _id: doc._id }, updateQuery)
        // Refetch the document after update
        travelInsurancePage = await TravelInsurancePage.findById(doc._id).lean()
      }
    }

    if (!travelInsurancePage) {
      // Create default data if no page exists
      travelInsurancePage = await TravelInsurancePage.create({
        // Hero Section
        heroTitle: 'TAKE THE WORRY OUT OF YOUR TRAVEL WITH',
        heroSubtitle:
          "Life's an adventure, but sometimes even the most intrepid explorers need a safety net.",
        heroDescription:
          'Comprehensive travel insurance coverage for all your adventures',
        heroPriceText: 'Insurance Plans starting at just',
        heroPriceValue: '₹149*',
        heroPoweredByText: 'Insurance Powered By',
        heroPoweredByLogoUrl: '',
        heroClaimRatioValue: '99%',
        heroClaimRatioDescription:
          'Claim Ratio - With unwavering dedication to customer satisfaction',

        // Form Section
        formTitle: 'Get Your Travel Insurance Quote',
        formSubtitle: 'Fill in your details to get an instant quote',

        // Features Section
        featuresSectionTitle: 'Why Choose Our Travel Insurance?',
        featuresSectionSubtitle:
          'Comprehensive coverage for all your travel needs',

        // Insurance Plans
        insurancePlansTitle: 'Choose Your Protection Plan',
        insurancePlansSubtitle: 'Select the perfect coverage for your journey',
        plans: [
          {
            name: 'Basic Plan',
            price: '₹149',
            duration: 'per day',
            features: [
              'Medical coverage up to ₹5 Lakhs',
              'Trip cancellation coverage',
              'Baggage loss protection',
              '24/7 emergency assistance',
              'COVID-19 coverage included',
            ],
            popular: false,
            order: 0,
            status: 'active',
          },
          {
            name: 'Standard Plan',
            price: '₹299',
            duration: 'per day',
            features: [
              'Medical coverage up to ₹10 Lakhs',
              'Trip cancellation & interruption',
              'Baggage & personal effects',
              'Emergency medical evacuation',
              '24/7 multilingual support',
              'COVID-19 coverage included',
            ],
            popular: true,
            order: 1,
            status: 'active',
          },
          {
            name: 'Premium Plan',
            price: '₹499',
            duration: 'per day',
            features: [
              'Medical coverage up to ₹25 Lakhs',
              'Comprehensive trip protection',
              'Adventure sports coverage',
              'Pre-existing condition coverage',
              'VIP emergency assistance',
              'COVID-19 coverage included',
            ],
            popular: false,
            order: 2,
            status: 'active',
          },
        ],

        // Coverage Details
        coverageDetailsTitle: "What's Covered",
        coverageDetailsSubtitle:
          'Comprehensive protection for every aspect of your journey',
        coverageDetails: [
          {
            icon: 'Shield',
            title: 'Medical Emergency',
            description:
              'Coverage for medical expenses, hospitalization, and emergency treatment during your trip',
            coverage: 'Up to ₹25 Lakhs',
            order: 0,
            status: 'active',
          },
          {
            icon: 'Clock',
            title: 'Trip Cancellation',
            description:
              'Reimbursement for non-refundable trip costs due to covered reasons',
            coverage: 'Up to ₹2 Lakhs',
            order: 1,
            status: 'active',
          },
          {
            icon: 'Globe',
            title: 'Emergency Evacuation',
            description:
              'Medical evacuation to nearest suitable medical facility or home country',
            coverage: 'Unlimited',
            order: 2,
            status: 'active',
          },
          {
            icon: 'Heart',
            title: 'Pre-existing Conditions',
            description:
              'Coverage for pre-existing medical conditions (with waiting period)',
            coverage: 'Up to ₹5 Lakhs',
            order: 3,
            status: 'active',
          },
        ],

        // Testimonials
        testimonialsTitle: 'What Our Customers Say',
        testimonialsSubtitle: 'Real experiences from satisfied travelers',
        testimonials: [
          {
            name: 'Priya Sharma',
            location: 'Mumbai',
            rating: 5,
            text: 'Excellent service! Got my claim processed within 24 hours when I had a medical emergency in Thailand.',
            order: 0,
            status: 'active',
          },
          {
            name: 'Rajesh Kumar',
            location: 'Delhi',
            rating: 5,
            text: 'The 24/7 support team was amazing. They helped me with everything during my trip to Europe.',
            order: 1,
            status: 'active',
          },
          {
            name: 'Anita Patel',
            location: 'Bangalore',
            rating: 5,
            text: 'Great value for money. The coverage was comprehensive and the claims process was hassle-free.',
            order: 2,
            status: 'active',
          },
        ],

        // Stats Section
        statsSectionTitle: 'Why Choose Our Travel Insurance?',
        statsSectionSubtitle: 'Trusted by thousands of travelers worldwide',
        stats: [
          {
            value: '99%',
            label: 'Claim Settlement Ratio',
            order: 0,
            status: 'active',
          },
          {
            value: '24/7',
            label: 'Support',
            order: 1,
            status: 'active',
          },
          {
            value: '50,000+',
            label: 'Customers',
            order: 2,
            status: 'active',
          },
          {
            value: '60+',
            label: 'Countries',
            order: 3,
            status: 'active',
          },
        ],

        // CTA Section
        ctaTitle: 'Ready to Protect Your Journey?',
        ctaSubtitle:
          'Get your travel insurance quote today and travel with confidence',
        ctaButton1Text: 'Get Quote Now',
        ctaButton1Link: '#travel-insurance-form',
        ctaButton2Text: 'Call Us',
        ctaButton2Link: 'tel:+919876543210',

        // SEO Fields
        metaTitle:
          'Travel Insurance - Comprehensive Coverage for Your Journey | Visa4',
        metaDescription:
          'Get comprehensive travel insurance coverage starting from ₹149. Medical coverage, trip cancellation, emergency assistance, and more. Travel with confidence with Visa4.',
        metaKeywords: [
          'travel insurance',
          'medical coverage',
          'trip cancellation',
          'emergency assistance',
          'travel protection',
          'Visa4',
        ],
        ogTitle: 'Travel Insurance - Comprehensive Coverage for Your Journey',
        ogDescription:
          'Get comprehensive travel insurance coverage starting from ₹149. Medical coverage, trip cancellation, emergency assistance, and more.',
        ogImage: '/images/travel-insurance-og.jpg',
        twitterTitle:
          'Travel Insurance - Comprehensive Coverage for Your Journey',
        twitterDescription:
          'Get comprehensive travel insurance coverage starting from ₹149. Medical coverage, trip cancellation, emergency assistance, and more.',
        twitterImage: '/images/travel-insurance-twitter.jpg',
        canonicalUrl: 'https://euroworld.com/travel-insurance',

        status: 'active',
        order: 0,
      })
    }

    return NextResponse.json({ success: true, travelInsurancePage })
  } catch (error) {
    console.error('Error fetching travel insurance page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch travel insurance page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { _id, ...updateData } = body

    // Remove any undefined or null values that might cause issues
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key]
      }
    })

    // Handle migration: remove old field name if present
    if ('heroPoweredByLogoText' in updateData) {
      delete (updateData as any).heroPoweredByLogoText
    }

    // Ensure heroPoweredByLogoUrl has a default value if missing (empty string is allowed)
    if (
      updateData.heroPoweredByLogoUrl === undefined ||
      updateData.heroPoweredByLogoUrl === null
    ) {
      updateData.heroPoweredByLogoUrl = ''
    }

    let travelInsurancePage
    if (_id) {
      travelInsurancePage = await TravelInsurancePage.findByIdAndUpdate(
        _id,
        updateData,
        {
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: false,
        }
      )
    } else {
      // Ensure default value for new documents
      if (!updateData.heroPoweredByLogoUrl) {
        updateData.heroPoweredByLogoUrl = ''
      }
      travelInsurancePage = await TravelInsurancePage.create(updateData)
    }

    if (!travelInsurancePage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Travel insurance page not found or could not be created',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      travelInsurancePage,
      message: 'Travel Insurance content saved successfully',
    })
  } catch (error: any) {
    console.error('Error saving travel insurance page:', error)

    // Provide more detailed error messages
    let errorMessage = 'Failed to save travel insurance page'
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {})
        .map((err: any) => err.message)
        .join(', ')
      errorMessage = `Validation error: ${validationErrors || error.message}`
      console.error('Validation errors:', error.errors)
    } else if (error.name === 'CastError') {
      errorMessage = `Invalid data format: ${error.message}`
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
                errors: error.errors,
              }
            : undefined,
      },
      { status: 500 }
    )
  }
}
