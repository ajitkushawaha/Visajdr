import TravelInsuranceForm from '@/components/travel-insurance/TravelInsuranceForm'
import TravelFeatures from '@/components/travel-insurance/TravelFeatures'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import connectDB from '@/lib/db'
import TravelInsurancePage from '@/models/TravelInsurancePage'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Clock,
  Globe,
  Heart,
  Phone,
  CheckCircle,
  Star,
  Users,
  Award,
} from 'lucide-react'
import Link from 'next/link'

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Shield,
  Clock,
  Globe,
  Heart,
  Users,
  Award,
  CheckCircle,
  Star,
}

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/travel-insurance')
  return generateSEOMetadata(seoData)
}

export default async function TravelInsurancePage() {
  // Fetch content directly from database (server-side)
  let pageData: any = null
  try {
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    const travelInsurancePage = await TravelInsurancePage.findOne({
      status: 'active',
    }).lean()
    if (travelInsurancePage) {
      // Convert to plain object to remove any Mongoose-specific properties
      pageData = JSON.parse(JSON.stringify(travelInsurancePage))
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback data if CMS is not available
  const fallbackData = {
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
    formTitle: 'Get Your Travel Insurance Quote',
    formSubtitle: 'Fill in your details to get an instant quote',
    featuresSectionTitle: 'Why Choose Our Travel Insurance?',
    featuresSectionSubtitle: 'Comprehensive coverage for all your travel needs',
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
        status: 'active',
      },
    ],
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
        status: 'active',
      },
      {
        icon: 'Clock',
        title: 'Trip Cancellation',
        description:
          'Reimbursement for non-refundable trip costs due to covered reasons',
        coverage: 'Up to ₹2 Lakhs',
        status: 'active',
      },
      {
        icon: 'Globe',
        title: 'Emergency Evacuation',
        description:
          'Medical evacuation to nearest suitable medical facility or home country',
        coverage: 'Unlimited',
        status: 'active',
      },
      {
        icon: 'Heart',
        title: 'Pre-existing Conditions',
        description:
          'Coverage for pre-existing medical conditions (with waiting period)',
        coverage: 'Up to ₹5 Lakhs',
        status: 'active',
      },
    ],
    testimonialsTitle: 'What Our Customers Say',
    testimonialsSubtitle: 'Real experiences from satisfied travelers',
    testimonials: [
      {
        name: 'Priya Sharma',
        location: 'Mumbai',
        rating: 5,
        text: 'Excellent service! Got my claim processed within 24 hours when I had a medical emergency in Thailand.',
        status: 'active',
      },
      {
        name: 'Rajesh Kumar',
        location: 'Delhi',
        rating: 5,
        text: 'The 24/7 support team was amazing. They helped me with everything during my trip to Europe.',
        status: 'active',
      },
      {
        name: 'Anita Patel',
        location: 'Bangalore',
        rating: 5,
        text: 'Great value for money. The coverage was comprehensive and the claims process was hassle-free.',
        status: 'active',
      },
    ],
    statsSectionTitle: 'Why Choose Our Travel Insurance?',
    statsSectionSubtitle: 'Trusted by thousands of travelers worldwide',
    stats: [
      {
        value: '99%',
        label: 'Claim Settlement Ratio',
        status: 'active',
      },
      {
        value: '24/7',
        label: 'Support',
        status: 'active',
      },
      {
        value: '50,000+',
        label: 'Customers',
        status: 'active',
      },
      {
        value: '60+',
        label: 'Countries',
        status: 'active',
      },
    ],
    ctaTitle: 'Ready to Protect Your Journey?',
    ctaSubtitle:
      'Get your travel insurance quote today and travel with confidence',
    ctaButton1Text: 'Get Quote Now',
    ctaButton1Link: '#travel-insurance-form',
    ctaButton2Text: 'Call Us',
    ctaButton2Link: 'tel:+919876543210',
  }

  const content = pageData || fallbackData

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen py-24  w-full from-brand-primary via-brand-dark to-brand-secondary bg-gradient-to-br overflow-hidden ">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/15 rounded-full"></div>
        </div>

        <div className="relative w-4/5  max-[600px]:w-[90%] mx-auto z-10">
          {/* Geometric Lines Pattern */}
          <div className="absolute inset-0 opacity-20 ">
            <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
              <defs>
                <pattern
                  id="lines"
                  patternUnits="userSpaceOnUse"
                  width="40"
                  height="40"
                >
                  <path
                    d="M0 40L40 0M-10 10L10 -10M30 50L50 30"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lines)" />
            </svg>
          </div>

          <div className="relative mx-auto flex items-center ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center w-full">
              {/* Left Content */}
              <div className="text-white space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="space-y-3 md:space-y-4">
                  <p className="text-sm md:text-lg opacity-90 text-balance leading-relaxed">
                    {content.heroSubtitle}
                  </p>

                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    {content.heroTitle}
                  </h1>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-1 sm:gap-2">
                    <span className="text-sm md:text-xl">
                      {content.heroPriceText}
                    </span>
                    <div className="flex items-baseline md:items-center gap-1">
                      <span className="text-2xl md:text-3xl font-bold">
                        {content.heroPriceValue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Powered By Branding */}
                {content.heroPoweredByLogoUrl && (
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 mt-8 md:mt-16">
                    <span className="text-xs md:text-sm opacity-90">
                      {content.heroPoweredByText}
                    </span>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm w-fit">
                      <img
                        src={content.heroPoweredByLogoUrl}
                        alt="Powered By Logo"
                        className="h-6 md:h-8 lg:h-10 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Form Card */}
              <div
                id="travel-insurance-form"
                className="flex justify-center lg:justify-end relative z-20"
              >
                <TravelInsuranceForm />
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="relative bottom-24 left-0 hidden xl:flex items-center gap-6">
            <div className="bg-brand-primary text-white py-3 px-4 rounded-lg text-center min-w-[140px]">
              <div className="text-xl font-bold">
                {content.heroClaimRatioValue}
              </div>
              <div className="text-xs opacity-90">Claim Ratio</div>
              <div className="text-xs opacity-75 mt-1 leading-tight">
                {content.heroClaimRatioDescription}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      {/* <TravelFeatures /> */}

      {/* Insurance Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-brand-primary">
              {content.insurancePlansTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.insurancePlansSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.plans
              .filter((plan: any) => plan.status === 'active')
              .map((plan: any, index: number) => (
                <Card
                  key={index}
                  className={`relative ${plan.popular ? 'ring-2 ring-brand-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-brand-primary">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {plan.duration}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map(
                        (feature: string, featureIndex: number) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Coverage Details Section */}
      <section className="py-20">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-brand-primary">
              {content.coverageDetailsTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.coverageDetailsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.coverageDetails
              .filter((coverage: any) => coverage.status === 'active')
              .map((coverage: any, index: number) => {
                const IconComponent = iconMap[coverage.icon]
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        {IconComponent && (
                          <IconComponent className="h-8 w-8 text-brand-primary" />
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {coverage.title}
                      </CardTitle>
                      <Badge variant="secondary" className="w-fit mx-auto">
                        {coverage.coverage}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {coverage.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-brand-primary">
              {content.testimonialsTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.testimonialsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.testimonials
              .filter((testimonial: any) => testimonial.status === 'active')
              .map((testimonial: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {content.statsSectionTitle}
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {content.statsSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {content.stats
              .filter((stat: any) => stat.status === 'active')
              .map((stat: any, index: number) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="w-4/5 max-[600px]:w-[90%] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-brand-primary">
            {content.ctaTitle}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {content.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-secondary hover:bg-brand-accent"
              asChild
            >
              <Link href="#travel-insurance-form">
                {content.ctaButton1Text}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
              asChild
            >
              <a href={content.ctaButton2Link}>
                <Phone className="h-4 w-4 mr-2" />
                {content.ctaButton2Text}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
