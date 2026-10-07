import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ServicesPage from '@/models/ServicesPage'

export async function GET() {
  try {
    await connectDB()
    
    let servicesPage = await ServicesPage.findOne()
    
    if (!servicesPage) {
      // Create default services page data
      servicesPage = new ServicesPage({
        heroTitle: "Trusted Visa Consultancy Services for Study, Work & Immigration",
        heroSubtitle: "Get expert guidance for student visas, work permits, PR, and business immigration with 100% support.",
        heroImage: "/world-map.jpg",
        heroImageAlt: "Global travelers and immigration",
        heroPrimaryButtonText: "Book Free Consultation",
        heroPrimaryButtonLink: "/apply",
        heroSecondaryButtonText: "Apply Now",
        heroSecondaryButtonLink: "/contact-us",
        heroStats: [
          { number: "50K+", label: "Successful Cases" },
          { number: "8+", label: "Years Experience" },
          { number: "98.5%", label: "Success Rate" }
        ],
        definitionTitle: "What is a Visa Consultancy Service?",
        definitionContent: "A visa consultancy service helps individuals and businesses with expert guidance for obtaining study, work, tourist, business, and immigration visas. Consultants provide eligibility checks, document preparation, application filing, and visa interview support. Our team of certified immigration consultants ensures a smooth and transparent process, maximizing your chances of visa approval while minimizing stress and delays.",
        whyChooseUsTitle: "Why Choose Our Visa Consultancy Services?",
        whyChooseUsSubtitle: "Registered consultancy with proven track record and client satisfaction",
        whyChooseUsItems: [
          { title: "Experienced Consultants", description: "Certified professionals with 15+ years in immigration law" },
          { title: "High Success Rate", description: "98.5% visa approval rate across all visa categories" },
          { title: "End-to-End Assistance", description: "Complete support from application to post-landing" },
          { title: "Personalized Guidance", description: "Customized solutions tailored to your unique situation" }
        ],
        servicesTitle: "Types of Visa Services We Offer",
        servicesSubtitle: "Comprehensive visa solutions for every immigration need",
        services: [
          { icon: "GraduationCap", title: "Student Visas", description: "Admission guidance, application support, SOP drafting, and visa filing for universities worldwide." },
          { icon: "Briefcase", title: "Work Visas", description: "Work permits, skilled worker visas, and corporate visa support for international employment." },
          { icon: "Plane", title: "Tourist & Visit Visas", description: "Short-term travel assistance for leisure, family visits, and business trips." },
          { icon: "TrendingUp", title: "Business & Investor Visas", description: "Support for entrepreneurs and investors exploring business opportunities abroad." },
          { icon: "Home", title: "Permanent Residency", description: "Immigration support for Canada, Australia, UK, and other PR destinations." },
          { icon: "Users", title: "Family Sponsorship", description: "Complete guidance for family reunification and dependent visa applications." }
        ],
        processTitle: "Our Simple & Transparent Process",
        processSubtitle: "Five easy steps to your visa approval",
        processSteps: [
          { number: "1", title: "Free Consultation", description: "Initial assessment of your visa requirements and eligibility" },
          { number: "2", title: "Eligibility Check", description: "Comprehensive evaluation of your qualifications and documents" },
          { number: "3", title: "Documentation & Application", description: "Preparation and filing of all required documents" },
          { number: "4", title: "Submission & Tracking", description: "Application submission with real-time status updates" },
          { number: "5", title: "Visa Approval & Support", description: "Post-approval guidance and landing assistance" }
        ],
        useCasesTitle: "Who Needs a Visa Consultant?",
        useCasesSubtitle: "We serve diverse clients with unique immigration goals",
        useCases: [
          { icon: "BookOpen", title: "Students Planning to Study Abroad", description: "Get admitted to top universities and secure your student visa with expert guidance." },
          { icon: "Briefcase", title: "Professionals Seeking Overseas Jobs", description: "Navigate work visa requirements and land your dream international career." },
          { icon: "Users", title: "Families Applying for Immigration", description: "Reunite with loved ones through family sponsorship and immigration programs." },
          { icon: "Home", title: "Entrepreneurs & Investors", description: "Explore business opportunities and establish your venture in new countries." }
        ],
        testimonialsTitle: "Success Stories & Testimonials",
        testimonialsSubtitle: "Real stories from our satisfied clients",
        testimonials: [
          { name: "Priya Sharma", destination: "Canada", text: "The team made my student visa process incredibly smooth. I got approved in just 3 months!", rating: 5 },
          { name: "Rajesh Kumar", destination: "Australia", text: "Excellent service for my PR application. Their expertise and support were invaluable.", rating: 5 },
          { name: "Ananya Patel", destination: "USA", text: "Professional, responsive, and results-driven. Highly recommend for any visa needs.", rating: 5 }
        ],
        differentiatorTitle: "Why Our Visa Consultants Are Different",
        differentiatorSubtitle: "Excellence in every aspect of immigration consulting",
        differentiatorItems: [
          "Personalized support tailored to your unique situation",
          "Latest immigration updates and policy changes",
          "Affordable consultation packages for all budgets",
          "High visa approval rate across all categories",
          "Transparent communication throughout the process",
          "Post-landing support and settlement assistance"
        ],
        countryServicesTitle: "Country-Specific Visa Services",
        countryServicesSubtitle: "Expert guidance for top immigration destinations",
        countryServices: [
          { name: "Canada", service: "Student Visa" },
          { name: "Australia", service: "PR Visa" },
          { name: "USA", service: "Work Visa" },
          { name: "UK", service: "Student Visa" },
          { name: "Dubai", service: "Work Visa" },
          { name: "New Zealand", service: "PR Visa" }
        ],
        faqTitle: "Frequently Asked Questions",
        faqSubtitle: "Find answers to common visa consultancy questions",
        faqs: [
          { question: "What documents are required for a student visa?", answer: "Required documents typically include passport, academic transcripts, proof of financial support, admission letter, and language test scores. Our consultants will provide a complete checklist based on your destination country." },
          { question: "How long does it take to process a work visa?", answer: "Processing times vary by country and visa type, typically ranging from 2-6 months. We provide realistic timelines and keep you updated throughout the process." },
          { question: "Do you provide post-landing support?", answer: "Yes! We offer comprehensive post-landing support including accommodation guidance, job search assistance, and settlement services." },
          { question: "Can you help with visa rejection cases?", answer: "Absolutely. We specialize in visa rejection appeals and reapplications, analyzing the reasons for rejection and strengthening your case." },
          { question: "What is your consultation fee?", answer: "Our consultation fees are transparent and affordable, starting from a free initial consultation. Detailed pricing depends on the visa type and complexity of your case." }
        ],
        ctaTitle: "Ready to Start Your Journey Abroad?",
        ctaSubtitle: "Let our expert consultants guide you through every step of your visa application process.",
        ctaPrimaryButtonText: "Book Free Consultation",
        ctaSecondaryButtonText: "Contact Us",
        ctaStats: [
          { number: "24/7", label: "Customer Support" },
          { number: "100%", label: "Transparent Process" },
          { number: "∞", label: "Lifetime Assistance" }
        ],
        seoTitle: "Visa Consultancy Services - Expert Immigration Guidance",
        seoDescription: "Professional visa consultancy services for study, work, and immigration. Expert guidance for student visas, work permits, and PR applications.",
        seoKeywords: ["visa consultancy", "immigration services", "student visa", "work visa", "PR visa", "visa application"]
      })
      
      await servicesPage.save()
    }

    return NextResponse.json({
      success: true,
      data: servicesPage
    })
  } catch (error) {
    console.error('Error fetching services page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const data = await request.json()
    
    let servicesPage = await ServicesPage.findOne()
    
    if (servicesPage) {
      // Update existing
      Object.assign(servicesPage, data)
      await servicesPage.save()
    } else {
      // Create new
      servicesPage = new ServicesPage(data)
      await servicesPage.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Services page updated successfully',
      data: servicesPage
    })
  } catch (error) {
    console.error('Error updating services page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update services page' },
      { status: 500 }
    )
  }
}
