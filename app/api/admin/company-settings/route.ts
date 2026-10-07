// app/api/company-settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import CompanySettings from '@/models/CompanySettings'
import { clearGoogleOAuthCache } from '@/lib/googleOAuthConfig'
import { revalidatePath } from 'next/cache'

const DEFAULT_SETTINGS = {
  companyName: 'Visa4',
  gstNo: '',
  cinNo: 'Visa4',
  supportNo: '+919822553417',
  tollfreeNo: '7618529630',
  whatsappNo: '9822553417',
  supportEmail: 'sales@eu-world.com',
  panName: 'Dev tiwari',
  panNumber: 'AHHPT5361F',
  streetAddress: 'F-34 1st Floor Arfran Plaza Near D',
  country: 'india',
  state: 'Goa',
  city: 'Panjim',
  zipCode: '403001',
  copyright: 'Copyright',
  googleAnalyticsHead: '',
  googleAnalyticsBody: '',
  googleSiteVerification: '',
  googlePlacesApi: 'AIzaSyDxaN.......',
  googleApiKey: '',
  googleClientSecret: '',
  logoUrl: '/placeholder.svg?height=60&width=120&text=EURO+WORLD',
  faviconUrl: '/favicon_io/favicon-32x32.png',
  selectedTheme: 'theme-one',
  facebookLink: 'https://www.facebook.com/',
  linkedinLink: 'https://www.linkedin.com/home',
  instagramLink: 'https://www.instagram.com/acco',
  twitterLink: 'https://twitter.com/i/flow/login',
  youtubeLink: 'https://www.youtube.com/',
  mailer: 'smtp',
  smtpServer: 'smtpout.secureserver.net',
  portNumber: '465',
  fromEmail: 'sales@eu-world.com',
  emailId: 'sales@eu-world.com',
  emailPassword: '',
  ccEmail: '',
  bccEmail: '',
  sendgridApiKey: '',
  twilioSettings: {
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    whatsappNumber: '',
    messagingServiceSid: '',
  },
  androidAppUrl: '',
  iosAppUrl: '',
  metaRobots: 'index_follow',
  metaTitle: 'Top Visa Agents in Goa | Visa Consultants Goa - Visa4',
  metaKeyword: '',
  metaDescription:
    'Visa4 is your premier choice for visa services in Goa. Our expert consultants provide tailored solutions for all your visa needs. Call now and book your visa!',
  // Default Payment Gateway Settings
  paymentGateways: {
    razorpay: { isActive: false, keyId: '', keySecret: '', webhookSecret: '' },
    stripe: {
      isActive: false,
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    paypal: {
      isActive: false,
      clientId: '',
      clientSecret: '',
      mode: 'sandbox',
    },
    upi: { isActive: false, upiId: '', merchantName: '' },
    cashfree: {
      isActive: false,
      appId: '',
      secretKey: '',
      environment: 'sandbox',
      webhookSecret: '',
    },
  },
  // Default Convenience Fee Settings
  convenienceFees: {
    isActive: false,
    fees: {
      onlineProcessing: {
        isActive: false,
        amount: 0,
        type: 'fixed',
        description: 'Online processing convenience fee',
      },
      paymentMethod: {
        razorpay: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Razorpay payment convenience fee',
        },
        stripe: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Stripe payment convenience fee',
        },
        upi: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'UPI payment convenience fee',
        },
        card: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Card payment convenience fee',
        },
        cashfree: {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Cashfree payment convenience fee',
        },
      },
      expressService: {
        isActive: false,
        amount: 0,
        type: 'fixed',
        description: 'Express processing service fee',
      },
      documentProcessing: {
        isActive: false,
        amount: 0,
        type: 'fixed',
        description: 'Document processing convenience fee',
      },
    },
  },
}

async function getOrCreateSettings() {
  // try to find existing doc (we assume a single doc for settings)
  let doc = await CompanySettings.findOne({})
  if (!doc) {
    // seed default
    doc = new CompanySettings(DEFAULT_SETTINGS)
    await doc.save()
    console.log('✅ Created new CompanySettings document with Cashfree')
  } else {
    let needsSave = false

    // Ensure paymentGateways exists in existing document
    if (!doc.paymentGateways) {
      console.log('⚠️ paymentGateways missing, initializing...')
      doc.paymentGateways = {
        razorpay: {
          isActive: false,
          keyId: '',
          keySecret: '',
          webhookSecret: '',
        },
        stripe: {
          isActive: false,
          publishableKey: '',
          secretKey: '',
          webhookSecret: '',
        },
        paypal: {
          isActive: false,
          clientId: '',
          clientSecret: '',
          mode: 'sandbox',
        },
        upi: { isActive: false, upiId: '', merchantName: '' },
        cashfree: {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        },
      } as any
      doc.markModified('paymentGateways')
      needsSave = true
      console.log('✅ Initialized paymentGateways with Cashfree')
    } else {
      // Ensure cashfree exists in paymentGateways - CRITICAL for PATCH to work
      if (!(doc.paymentGateways as any).cashfree) {
        console.log('⚠️ Cashfree missing in paymentGateways, initializing...')
        ;(doc.paymentGateways as any).cashfree = {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        }
        doc.markModified('paymentGateways')
        doc.markModified('paymentGateways.cashfree')
        needsSave = true
        console.log('✅ Initialized Cashfree in existing document')
      } else {
        console.log('✅ Cashfree already exists in document')
      }
    }

    if (needsSave) {
      console.log('💾 Saving document to ensure Cashfree exists in database...')
      await doc.save()
      console.log('✅ Saved document with Cashfree initialization')

      // Verify it was saved
      const verifyDoc = await CompanySettings.findOne({})
      if (verifyDoc && (verifyDoc.paymentGateways as any)?.cashfree) {
        console.log('✅ Verified: Cashfree exists in database')
      } else {
        console.error('❌ ERROR: Cashfree was not saved to database!')
      }
    }
  }
  return doc
}

export async function GET() {
  try {
    await connectDb()

    // Force fresh fetch - bypass any Mongoose caching
    const settings = await CompanySettings.findOne({}).lean()

    if (!settings) {
      // Create new settings if none exist
      const newSettings = new CompanySettings(DEFAULT_SETTINGS)
      await newSettings.save()
      return NextResponse.json({ success: true, data: newSettings })
    }

    // Ensure Cashfree exists (migration check)
    let needsUpdate = false
    if (!settings.paymentGateways) {
      settings.paymentGateways = {
        razorpay: {
          isActive: false,
          keyId: '',
          keySecret: '',
          webhookSecret: '',
        },
        stripe: {
          isActive: false,
          publishableKey: '',
          secretKey: '',
          webhookSecret: '',
        },
        paypal: {
          isActive: false,
          clientId: '',
          clientSecret: '',
          mode: 'sandbox',
        },
        upi: { isActive: false, upiId: '', merchantName: '' },
        cashfree: {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        },
      } as any
      needsUpdate = true
    } else if (!(settings.paymentGateways as any).cashfree) {
      ;(settings.paymentGateways as any).cashfree = {
        isActive: false,
        appId: '',
        secretKey: '',
        environment: 'sandbox',
        webhookSecret: '',
      }
      needsUpdate = true
    }

    // If update needed, save it
    if (needsUpdate) {
      await CompanySettings.findOneAndUpdate(
        { _id: settings._id },
        { $set: { paymentGateways: settings.paymentGateways } },
        { new: true }
      )
    }

    // Debug: Check if there are multiple documents
    const allSettings = await CompanySettings.find({})
    if (allSettings.length > 1) {
      console.warn(
        `⚠️ Warning: Found ${allSettings.length} CompanySettings documents. Using the first one.`
      )
    }

    return NextResponse.json({
      success: true,
      data: settings,
      // Add cache control headers to prevent caching
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('GET company settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // basic validation
    const requiredFields = ['companyName', 'supportEmail']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    await connectDb()
    const settings = await getOrCreateSettings()

    // update allowed fields only (whitelist)
    const allowedFields = [
      'companyName',
      'gstNo',
      'cinNo',
      'supportNo',
      'tollfreeNo',
      'whatsappNo',
      'supportEmail',
      'panName',
      'panNumber',
      'streetAddress',
      'country',
      'state',
      'city',
      'zipCode',
      'copyright',
      'googleAnalyticsHead',
      'googleAnalyticsBody',
      'googleSiteVerification',
      'googlePlacesApi',
      'googleApiKey',
      'googleClientSecret',
      'logoUrl',
      'faviconUrl',
      'selectedTheme',
      'facebookLink',
      'linkedinLink',
      'instagramLink',
      'twitterLink',
      'youtubeLink',
      'mailer',
      'smtpServer',
      'portNumber',
      'fromEmail',
      'emailId',
      'emailPassword',
      'ccEmail',
      'bccEmail',
      'sendgridApiKey',
      'twilioSettings',
      'androidAppUrl',
      'iosAppUrl',
      'metaRobots',
      'metaTitle',
      'metaKeyword',
      'metaDescription',
      'notificationSettings',
    ]

    // Check if Google OAuth settings are being updated
    const googleFields = ['googleApiKey', 'googleClientSecret']
    const isGoogleSettingsUpdated = googleFields.some(field =>
      body.hasOwnProperty(field)
    )

    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        // @ts-ignore
        settings[key] = body[key]
      }
    }
    settings.updatedAt = new Date()
    await settings.save()

    // Clear Google OAuth cache if Google settings were updated
    if (isGoogleSettingsUpdated) {
      clearGoogleOAuthCache()
      console.log('Google OAuth cache cleared due to settings update')
    }

    // Revalidate the entire site layout so the new favicon and settings reflect immediately
    revalidatePath('/', 'layout')

    return NextResponse.json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings,
    })
  } catch (error) {
    console.error('PUT company settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update company settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    await connectDb()
    const settings = await getOrCreateSettings()

    console.log('📥 PATCH request body:', JSON.stringify(body, null, 2))
    console.log(
      '📥 PATCH - Cashfree in request:',
      JSON.stringify(body.paymentGateways?.cashfree, null, 2)
    )

    // CRITICAL: Ensure Cashfree exists in document before PATCH (PATCH only updates, doesn't create)
    if (body.paymentGateways?.cashfree) {
      if (!settings.paymentGateways) {
        console.log('⚠️ paymentGateways missing, initializing...')
        settings.paymentGateways = {
          razorpay: {
            isActive: false,
            keyId: '',
            keySecret: '',
            webhookSecret: '',
          },
          stripe: {
            isActive: false,
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
          },
          paypal: {
            isActive: false,
            clientId: '',
            clientSecret: '',
            mode: 'sandbox',
          },
          upi: { isActive: false, upiId: '', merchantName: '' },
          cashfree: {
            isActive: false,
            appId: '',
            secretKey: '',
            environment: 'sandbox',
            webhookSecret: '',
          },
        } as any
        settings.markModified('paymentGateways')
      }

      if (!(settings.paymentGateways as any).cashfree) {
        console.log(
          '⚠️ Cashfree missing in document, creating it first (PATCH requires existing object)...'
        )
        ;(settings.paymentGateways as any).cashfree = {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        }
        settings.markModified('paymentGateways')
        settings.markModified('paymentGateways.cashfree')

        // Save to create Cashfree in database before PATCH update
        await settings.save()
        console.log('✅ Created Cashfree in database, now PATCH can update it')

        // Re-fetch to get the updated document
        const updatedSettings = await CompanySettings.findOne({})
        if (updatedSettings) {
          Object.assign(settings, updatedSettings)
        }
      }
    }

    // Handle payment gateways update
    if (body.paymentGateways) {
      // Ensure paymentGateways exists
      if (!settings.paymentGateways) {
        settings.paymentGateways = {
          razorpay: {
            isActive: false,
            keyId: '',
            keySecret: '',
            webhookSecret: '',
          },
          stripe: {
            isActive: false,
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
          },
          paypal: {
            isActive: false,
            clientId: '',
            clientSecret: '',
            mode: 'sandbox',
          },
          upi: { isActive: false, upiId: '', merchantName: '' },
          cashfree: {
            isActive: false,
            appId: '',
            secretKey: '',
            environment: 'sandbox',
            webhookSecret: '',
          },
        } as any
      }

      // Ensure cashfree exists in paymentGateways before updating
      if (!(settings.paymentGateways as any).cashfree) {
        ;(settings.paymentGateways as any).cashfree = {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        }
        console.log('✅ Initialized Cashfree in paymentGateways')
      }

      // Deep merge each gateway individually to ensure all fields are preserved
      if (body.paymentGateways.razorpay) {
        settings.paymentGateways!.razorpay = {
          ...settings.paymentGateways!.razorpay,
          ...body.paymentGateways.razorpay,
        }
      }
      if (body.paymentGateways.stripe) {
        settings.paymentGateways!.stripe = {
          ...settings.paymentGateways!.stripe,
          ...body.paymentGateways.stripe,
        }
      }
      if (body.paymentGateways.paypal) {
        settings.paymentGateways!.paypal = {
          ...settings.paymentGateways!.paypal,
          ...body.paymentGateways.paypal,
        }
      }
      if (body.paymentGateways.upi) {
        settings.paymentGateways!.upi = {
          ...settings.paymentGateways!.upi,
          ...body.paymentGateways.upi,
        }
      }
      if (body.paymentGateways.cashfree) {
        console.log('🔄 Processing Cashfree update:', {
          incoming: body.paymentGateways.cashfree,
          current: (settings.paymentGateways as any).cashfree,
        })

        // Get current Cashfree data or use defaults
        const currentCashfree = (settings.paymentGateways as any).cashfree || {
          isActive: false,
          appId: '',
          secretKey: '',
          environment: 'sandbox',
          webhookSecret: '',
        }

        // Merge incoming data with current data
        const updatedCashfree = {
          isActive:
            body.paymentGateways.cashfree.isActive !== undefined
              ? body.paymentGateways.cashfree.isActive
              : currentCashfree.isActive,
          appId:
            body.paymentGateways.cashfree.appId !== undefined
              ? body.paymentGateways.cashfree.appId
              : currentCashfree.appId,
          secretKey:
            body.paymentGateways.cashfree.secretKey !== undefined
              ? body.paymentGateways.cashfree.secretKey
              : currentCashfree.secretKey,
          environment:
            body.paymentGateways.cashfree.environment !== undefined
              ? body.paymentGateways.cashfree.environment
              : currentCashfree.environment,
          webhookSecret:
            body.paymentGateways.cashfree.webhookSecret !== undefined
              ? body.paymentGateways.cashfree.webhookSecret
              : currentCashfree.webhookSecret,
        }

        // CRITICAL: Use direct MongoDB $set to bypass Mongoose change detection issues
        // First update in memory for consistency
        ;(settings.paymentGateways as any).cashfree.isActive =
          updatedCashfree.isActive
        ;(settings.paymentGateways as any).cashfree.appId =
          updatedCashfree.appId
        ;(settings.paymentGateways as any).cashfree.secretKey =
          updatedCashfree.secretKey
        ;(settings.paymentGateways as any).cashfree.environment =
          updatedCashfree.environment
        ;(settings.paymentGateways as any).cashfree.webhookSecret =
          updatedCashfree.webhookSecret

        // Use Mongoose set() method
        settings.set('paymentGateways.cashfree', updatedCashfree)

        console.log('✅ Cashfree updated in memory:', updatedCashfree)
        console.log(
          '✅ Cashfree in settings object:',
          JSON.stringify((settings.paymentGateways as any).cashfree, null, 2)
        )
      } else {
        console.log('⚠️ No Cashfree data in request body')
      }

      // Mark paymentGateways as modified to ensure Mongoose saves nested changes
      settings.markModified('paymentGateways')
      settings.markModified('paymentGateways.cashfree')

      console.log(
        '💾 Updated payment gateways before save:',
        JSON.stringify(settings.paymentGateways, null, 2)
      )
      console.log(
        '💾 Cashfree details:',
        JSON.stringify((settings.paymentGateways as any).cashfree, null, 2)
      )
    }

    // Handle convenience fees update
    if (body.convenienceFees) {
      if (!settings.convenienceFees) {
        // Initialize with default structure
        settings.convenienceFees = {
          isActive: false,
          fees: {
            onlineProcessing: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
            paymentMethod: {
              razorpay: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              stripe: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              upi: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              card: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              cashfree: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
            },
            expressService: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
            documentProcessing: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
          },
        }
      }

      // Ensure paymentMethod object exists
      if (
        settings.convenienceFees?.fees &&
        !settings.convenienceFees!.fees!.paymentMethod
      ) {
        settings.convenienceFees!.fees!.paymentMethod = {
          razorpay: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: '',
          },
          stripe: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: '',
          },
          upi: { isActive: false, amount: 0, type: 'fixed', description: '' },
          card: { isActive: false, amount: 0, type: 'fixed', description: '' },
          cashfree: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: '',
          },
        }
      }

      // Ensure paymentMethod.cashfree exists before merging
      if (
        settings.convenienceFees?.fees?.paymentMethod &&
        !settings.convenienceFees!.fees!.paymentMethod!.cashfree
      ) {
        settings.convenienceFees!.fees!.paymentMethod!.cashfree = {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Cashfree payment convenience fee',
        }
      }

      // Deep merge convenience fees - ensure nested objects are properly merged
      if (body.convenienceFees.isActive !== undefined) {
        settings.convenienceFees!.isActive = body.convenienceFees.isActive
      }

      if (body.convenienceFees.fees) {
        // Merge fees object
        if (body.convenienceFees.fees.onlineProcessing) {
          Object.assign(
            settings.convenienceFees!.fees!.onlineProcessing!,
            body.convenienceFees.fees.onlineProcessing!
          )
        }
        if (body.convenienceFees.fees.expressService) {
          Object.assign(
            settings.convenienceFees!.fees!.expressService!,
            body.convenienceFees.fees.expressService!
          )
        }
        if (body.convenienceFees.fees.documentProcessing) {
          Object.assign(
            settings.convenienceFees!.fees!.documentProcessing!,
            body.convenienceFees.fees.documentProcessing!
          )
        }

        // Deep merge paymentMethod fees
        if (body.convenienceFees.fees.paymentMethod) {
          // Ensure paymentMethod object exists
          if (!settings.convenienceFees!.fees!.paymentMethod) {
            settings.convenienceFees!.fees!.paymentMethod = {
              razorpay: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              stripe: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              upi: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              card: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
              cashfree: {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              },
            }
          }

          // Ensure each payment method exists before merging
          if (body.convenienceFees.fees.paymentMethod.razorpay) {
            if (!settings.convenienceFees!.fees!.paymentMethod.razorpay) {
              settings.convenienceFees!.fees!.paymentMethod.razorpay = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              }
            }
            Object.assign(
              settings.convenienceFees!.fees!.paymentMethod.razorpay,
              body.convenienceFees.fees.paymentMethod.razorpay
            )
          }
          if (body.convenienceFees.fees.paymentMethod.stripe) {
            if (!settings.convenienceFees!.fees!.paymentMethod.stripe) {
              settings.convenienceFees!.fees!.paymentMethod.stripe = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              }
            }
            Object.assign(
              settings.convenienceFees!.fees!.paymentMethod.stripe,
              body.convenienceFees.fees.paymentMethod.stripe
            )
          }
          if (body.convenienceFees.fees.paymentMethod.upi) {
            if (!settings.convenienceFees!.fees!.paymentMethod.upi) {
              settings.convenienceFees!.fees!.paymentMethod.upi = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              }
            }
            Object.assign(
              settings.convenienceFees!.fees!.paymentMethod.upi,
              body.convenienceFees.fees.paymentMethod.upi
            )
          }
          if (body.convenienceFees.fees.paymentMethod.card) {
            if (!settings.convenienceFees!.fees!.paymentMethod.card) {
              settings.convenienceFees!.fees!.paymentMethod.card = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: '',
              }
            }
            Object.assign(
              settings.convenienceFees!.fees!.paymentMethod.card,
              body.convenienceFees.fees.paymentMethod.card
            )
          }

          // CRITICAL: Always merge cashfree if it exists in the request, or ensure it exists with defaults
          if (body.convenienceFees.fees.paymentMethod.cashfree) {
            if (!settings.convenienceFees!.fees!.paymentMethod!.cashfree) {
              settings.convenienceFees!.fees!.paymentMethod!.cashfree = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: 'Cashfree payment convenience fee',
              }
            }
            Object.assign(
              settings.convenienceFees!.fees!.paymentMethod!.cashfree,
              body.convenienceFees.fees.paymentMethod.cashfree
            )
          } else {
            // If cashfree is not in the request but exists in settings, ensure it's preserved
            // This handles cases where only other payment methods are being updated
            if (!settings.convenienceFees!.fees!.paymentMethod!.cashfree) {
              settings.convenienceFees!.fees!.paymentMethod!.cashfree = {
                isActive: false,
                amount: 0,
                type: 'fixed',
                description: 'Cashfree payment convenience fee',
              }
            }
          }

          // ALWAYS ensure cashfree exists in paymentMethod (even if not in request body)
          // This prevents it from being lost during updates
          if (!settings.convenienceFees!.fees!.paymentMethod!.cashfree) {
            settings.convenienceFees!.fees!.paymentMethod!.cashfree = {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Cashfree payment convenience fee',
            }
          }
        }
      }

      // FINAL CHECK: ALWAYS ensure cashfree exists in paymentMethod before saving
      if (!settings.convenienceFees!.fees!.paymentMethod) {
        settings.convenienceFees!.fees!.paymentMethod = {
          razorpay: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: '',
          },
          stripe: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: '',
          },
          upi: { isActive: false, amount: 0, type: 'fixed', description: '' },
          card: { isActive: false, amount: 0, type: 'fixed', description: '' },
          cashfree: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: 'Cashfree payment convenience fee',
          },
        }
      }
      if (!settings.convenienceFees!.fees!.paymentMethod!.cashfree) {
        settings.convenienceFees!.fees!.paymentMethod!.cashfree = {
          isActive: false,
          amount: 0,
          type: 'fixed',
          description: 'Cashfree payment convenience fee',
        }
        console.log('✅ FINAL CHECK: Created cashfree before save')
      }

      // Mark as modified to ensure Mongoose saves nested changes
      settings.markModified('convenienceFees')
      settings.markModified('convenienceFees.fees')
      settings.markModified('convenienceFees.fees.paymentMethod')
      settings.markModified('convenienceFees.fees.paymentMethod.cashfree')

      console.log(
        'Updated convenience fees:',
        JSON.stringify(settings.convenienceFees, null, 2)
      )
      console.log(
        'PaymentMethod keys:',
        Object.keys(settings.convenienceFees!.fees!.paymentMethod || {})
      )
      console.log(
        'Cashfree fee in convenience fees:',
        JSON.stringify(
          settings.convenienceFees!.fees!.paymentMethod?.cashfree,
          null,
          2
        )
      )
    }

    // Handle other specific updates
    if (body.companyName) settings.companyName = body.companyName
    if (body.supportEmail) settings.supportEmail = body.supportEmail
    if (body.logoUrl) settings.logoUrl = body.logoUrl
    if (body.faviconUrl) settings.faviconUrl = body.faviconUrl

    settings.updatedAt = new Date()

    console.log('💾 Saving settings to database...')
    console.log(
      '💾 PaymentGateways before save:',
      JSON.stringify(settings.paymentGateways, null, 2)
    )
    console.log(
      '💾 Cashfree before save:',
      JSON.stringify((settings.paymentGateways as any)?.cashfree, null, 2)
    )
    console.log(
      '💾 ConvenienceFees before save:',
      JSON.stringify(settings.convenienceFees, null, 2)
    )

    // Build update object for findOneAndUpdate
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Add convenience fees to update if they were modified
    if (body.convenienceFees) {
      // CRITICAL: Ensure cashfree exists in paymentMethod before saving
      // Get existing convenience fees from database to preserve cashfree if not in request
      const existingConvenienceFees = settings.convenienceFees
      const existingPaymentMethod = existingConvenienceFees?.fees
        ?.paymentMethod as any

      // Merge request data with existing data to preserve cashfree
      if (settings.convenienceFees && settings.convenienceFees!.fees) {
        const pm = settings.convenienceFees!.fees!.paymentMethod as any

        // If paymentMethod exists in request but cashfree is missing, add it from existing or create default
        if (pm && !pm.cashfree) {
          if (existingPaymentMethod?.cashfree) {
            // Preserve existing cashfree from database
            pm.cashfree = existingPaymentMethod.cashfree
            console.log(
              '✅ PRE-SAVE: Preserved existing cashfree from database'
            )
          } else {
            // Create default cashfree
            pm.cashfree = {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Cashfree payment convenience fee',
            }
            console.log('✅ PRE-SAVE: Created default cashfree')
          }
        } else if (!pm) {
          // If paymentMethod doesn't exist, create it with cashfree
          settings.convenienceFees!.fees!.paymentMethod = {
            razorpay: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
            stripe: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
            upi: { isActive: false, amount: 0, type: 'fixed', description: '' },
            card: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: '',
            },
            cashfree: existingPaymentMethod?.cashfree || {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Cashfree payment convenience fee',
            },
          } as any
          console.log('✅ PRE-SAVE: Created paymentMethod with cashfree')
        }
      }

      updateData.convenienceFees = settings.convenienceFees
      console.log('💾 Including convenience fees in update')
      if (settings.convenienceFees?.fees?.paymentMethod) {
        const pm = settings.convenienceFees!.fees!.paymentMethod as any
        console.log('💾 PaymentMethod keys in update:', Object.keys(pm || {}))
        console.log(
          '💾 Cashfree in update:',
          JSON.stringify(pm?.cashfree, null, 2)
        )
      }
    }

    // If Cashfree payment gateway was updated, include it
    if (body.paymentGateways?.cashfree) {
      updateData['paymentGateways.cashfree'] = {
        isActive: (settings.paymentGateways as any).cashfree.isActive,
        appId: (settings.paymentGateways as any).cashfree.appId,
        secretKey: (settings.paymentGateways as any).cashfree.secretKey,
        environment: (settings.paymentGateways as any).cashfree.environment,
        webhookSecret: (settings.paymentGateways as any).cashfree.webhookSecret,
      }
      console.log('💾 Including paymentGateways.cashfree in update')
    }

    // Use findOneAndUpdate to ensure nested objects are saved
    if (body.convenienceFees || body.paymentGateways?.cashfree) {
      console.log('💾 Using findOneAndUpdate to save nested objects')

      // CRITICAL: If convenience fees are being updated, ensure cashfree is preserved
      if (body.convenienceFees && updateData.convenienceFees) {
        // Fetch current document to get existing cashfree
        const currentDoc = await CompanySettings.findOne({
          _id: settings._id,
        }).lean()
        const currentPaymentMethod = (currentDoc?.convenienceFees as any)?.fees
          ?.paymentMethod as any

        // If cashfree exists in database but not in update, preserve it
        if (currentPaymentMethod?.cashfree) {
          const updatePaymentMethod = (updateData.convenienceFees as any)?.fees
            ?.paymentMethod as any
          if (!updatePaymentMethod) {
            ;(updateData.convenienceFees as any).fees.paymentMethod = {}
          }
          const pm = (updateData.convenienceFees as any).fees
            .paymentMethod as any
          if (!pm.cashfree) {
            pm.cashfree = currentPaymentMethod.cashfree
            console.log(
              '✅ PRESERVED: Added existing cashfree from database to update'
            )
          }
        } else if (!currentPaymentMethod?.cashfree) {
          // Cashfree doesn't exist in database either, create default
          const updatePaymentMethod = (updateData.convenienceFees as any)?.fees
            ?.paymentMethod as any
          if (!updatePaymentMethod) {
            ;(updateData.convenienceFees as any).fees.paymentMethod = {}
          }
          const pm = (updateData.convenienceFees as any).fees
            .paymentMethod as any
          if (!pm.cashfree) {
            pm.cashfree = {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Cashfree payment convenience fee',
            }
            console.log('✅ CREATED: Added default cashfree to update')
          }
        }
      }

      const updated = await CompanySettings.findOneAndUpdate(
        { _id: settings._id },
        { $set: updateData },
        { new: true, runValidators: false }
      )

      if (updated) {
        console.log('✅ Settings saved using findOneAndUpdate')
        // Update settings object with the updated document
        Object.assign(settings, updated)
      } else {
        console.warn(
          '⚠️ findOneAndUpdate returned null, falling back to save()'
        )
        await settings.save()
      }
    } else {
      // Save normally for other updates
      await settings.save()
    }

    console.log('✅ Settings saved successfully')

    // Fetch the saved document to ensure we return the latest data (use lean to bypass Mongoose caching)
    let savedSettings = await CompanySettings.findOne({}).lean()

    if (!savedSettings) {
      console.error('❌ Failed to fetch saved settings')
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch saved settings',
        },
        { status: 500 }
      )
    }

    // Convert to plain object to check properly
    const savedPg = (savedSettings.paymentGateways as any)?.toObject
      ? (savedSettings.paymentGateways as any).toObject()
      : savedSettings.paymentGateways

    console.log('📥 Fetched saved settings:', JSON.stringify(savedPg, null, 2))
    console.log(
      '📥 Cashfree in saved settings:',
      JSON.stringify((savedPg as any)?.cashfree, null, 2)
    )
    console.log(
      '📥 paymentGateways type:',
      typeof savedSettings.paymentGateways
    )
    console.log(
      '📥 paymentGateways keys:',
      savedPg ? Object.keys(savedPg) : 'null'
    )

    // Verify convenience fees were saved (especially cashfree payment method fee)
    if (body.convenienceFees) {
      const savedConvenienceFees = savedSettings.convenienceFees
      console.log(
        '📥 Convenience fees in saved settings:',
        JSON.stringify(savedConvenienceFees, null, 2)
      )

      if (body.convenienceFees.fees?.paymentMethod?.cashfree) {
        const savedCashfreeFee =
          savedConvenienceFees?.fees?.paymentMethod?.cashfree
        console.log(
          '📥 Cashfree payment method fee in saved settings:',
          JSON.stringify(savedCashfreeFee, null, 2)
        )

        if (!savedCashfreeFee) {
          console.error(
            '❌ CRITICAL: Cashfree payment method fee was not saved to database!'
          )
          console.error(
            '❌ Attempting to save Cashfree payment method fee again using direct MongoDB update...'
          )

          // Use findOneAndUpdate to ensure it's saved
          const cashfreeFeeData =
            settings.convenienceFees!.fees!.paymentMethod!.cashfree

          const updatedDoc = await CompanySettings.findOneAndUpdate(
            { _id: savedSettings._id },
            {
              $set: {
                'convenienceFees.fees.paymentMethod.cashfree': cashfreeFeeData,
              },
            },
            { new: true, runValidators: false, lean: true }
          )

          if (
            updatedDoc &&
            (updatedDoc.convenienceFees as any)?.fees?.paymentMethod?.cashfree
          ) {
            console.log('✅ Cashfree payment method fee saved on retry')
            savedSettings = updatedDoc
          } else {
            console.error(
              '❌ ERROR: Cashfree payment method fee still not saved after retry!'
            )
          }
        } else {
          console.log('✅ Cashfree payment method fee was successfully saved')
        }
      }
    }

    // Verify Cashfree payment gateway was saved
    if (body.paymentGateways?.cashfree) {
      const savedCashfree = (savedPg as any)?.cashfree
      if (!savedCashfree) {
        console.error(
          '❌ CRITICAL: Cashfree payment gateway was not saved to database!'
        )
        console.error(
          '❌ Attempting to save Cashfree again using direct MongoDB update...'
        )

        // Use findOneAndUpdate to ensure it's saved
        const cashfreeData = {
          isActive:
            body.paymentGateways.cashfree.isActive !== undefined
              ? body.paymentGateways.cashfree.isActive
              : false,
          appId: body.paymentGateways.cashfree.appId || '',
          secretKey: body.paymentGateways.cashfree.secretKey || '',
          environment: body.paymentGateways.cashfree.environment || 'sandbox',
          webhookSecret: body.paymentGateways.cashfree.webhookSecret || '',
        }

        // Use findOneAndUpdate with $set to ensure nested object is saved
        const updatedDoc = await CompanySettings.findOneAndUpdate(
          { _id: savedSettings._id },
          {
            $set: {
              'paymentGateways.cashfree': cashfreeData,
            },
          },
          { new: true, runValidators: false, lean: true } // Return plain object, skip validation
        )

        if (updatedDoc && (updatedDoc.paymentGateways as any)?.cashfree) {
          console.log('✅ Cashfree saved on retry using findOneAndUpdate')
          console.log(
            '📥 Cashfree after retry:',
            JSON.stringify(
              (updatedDoc.paymentGateways as any).cashfree,
              null,
              2
            )
          )

          // Update savedSettings to return the correct data
          savedSettings = updatedDoc
        } else {
          console.log(
            '📥 Updated doc paymentGateways:',
            JSON.stringify(updatedDoc?.paymentGateways, null, 2)
          )
          console.log(
            '📥 Updated doc paymentGateways keys:',
            updatedDoc?.paymentGateways
              ? Object.keys(updatedDoc.paymentGateways)
              : 'null'
          )
          console.error('❌ ERROR: Cashfree still not saved after retry!')

          // Last resort: try one more direct MongoDB update
          const finalUpdate = await CompanySettings.findOneAndUpdate(
            { _id: savedSettings._id },
            {
              $set: {
                'paymentGateways.cashfree': cashfreeData,
              },
            },
            { new: true, runValidators: false, lean: true }
          )

          if (finalUpdate && (finalUpdate.paymentGateways as any)?.cashfree) {
            console.log('✅ Cashfree saved on final retry')
            savedSettings = finalUpdate
          } else {
            console.error(
              '❌ FATAL: Cashfree could not be saved after all retries!'
            )
          }
        }
      } else {
        console.log('✅ Cashfree was successfully saved')
      }
    }

    // Revalidate the entire site layout so the new favicon and settings reflect immediately
    revalidatePath('/', 'layout')

    return NextResponse.json(
      {
        success: true,
        message: 'Settings updated successfully',
        data: savedSettings,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('PATCH company settings error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
      },
      { status: 500 }
    )
  }
}
