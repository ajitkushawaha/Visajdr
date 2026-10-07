import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Visa from "@/models/Visa";

export async function GET() {
  try {
    await connectDb();
    
    // Fetch active visas only
    const visas = await Visa.find({ status: "active" });
    
    // Group visas by country to create service categories
    const countryGroups = visas.reduce((acc: any, visa) => {
      const country = visa.country;
      if (!acc[country]) {
        acc[country] = {
          country: country,
          countryFlag: visa.countryFlag || "",
          countryCode: visa.countryCode || "",
          countryImage: visa.countryImage || "",
          visaTypes: [],
          totalVisas: 0,
          minPrice: Infinity,
          maxPrice: 0
        };
      }
      
      // Calculate dynamic pricing based on occupancy type
      const basePrice = parseInt(visa.adultPrice) || 0;
      let pricingOptions = {
        day: basePrice,
        week: basePrice,
        schengen: basePrice
      };

      // If occupancy type is single, calculate different pricing options
      if (visa.occupancyType === "single") {
        pricingOptions = {
          day: Math.round(basePrice * 1.5), // 50% premium for same day
          week: Math.round(basePrice * 1.2), // 20% premium for week
          schengen: visa.category === "schengen" ? Math.round(basePrice * 1.3) : basePrice // 30% premium for schengen
        };
      }

      acc[country].visaTypes.push({
        type: visa.visaType,
        price: visa.adultPrice,
        pricingOptions: pricingOptions,
        processingTime: visa.processingTimeValue || visa.processingTimeQuote,
        processingTimeDays: visa.processingTimeDays,
        stayPeriod: visa.stayPeriod,
        validity: visa.validity,
        category: visa.category,
        hotListed: visa.hotListed === "true",
        occupancyType: visa.occupancyType,
        eVisa: visa.eVisa === "true"
      });
      
      acc[country].totalVisas++;
      const price = parseInt(visa.adultPrice) || 0;
      acc[country].minPrice = Math.min(acc[country].minPrice, price);
      acc[country].maxPrice = Math.max(acc[country].maxPrice, price);
      
      return acc;
    }, {});
    
    // Convert to array and sort by hotlisted visas first, then by total visas (popularity)
    const popularDestinations = Object.values(countryGroups)
      .map((country: any) => ({
        ...country,
        minPrice: country.minPrice === Infinity ? 0 : country.minPrice,
        maxPrice: country.maxPrice,
        hotlistedCount: country.visaTypes.filter((vt: any) => vt.hotListed).length
      }))
      .sort((a: any, b: any) => {
        // First sort by hotlisted count (descending)
        if (b.hotlistedCount !== a.hotlistedCount) {
          return b.hotlistedCount - a.hotlistedCount;
        }
        // Then by total visas (descending)
        return b.totalVisas - a.totalVisas;
      })
      .slice(0, 12); // Top 12 popular destinations
    
    // Get unique visa types across all countries
    const allVisaTypes = [...new Set(visas.map(visa => visa.visaType))];
    
    // Service categories based on visa types and additional services
    const serviceCategories = [
      {
        id: "visa-services",
        title: "Visa Application Services",
        description: "Comprehensive visa applications for various countries and purposes",
        icon: "🛂",
        services: allVisaTypes.map(type => ({
          name: type.charAt(0).toUpperCase() + type.slice(1) + " Visa",
          description: `Professional ${type} visa application services`
        })),
        features: [
          "Expert document preparation",
          "Application form completion",
          "Document verification",
          "Interview preparation"
        ]
      },
      {
        id: "documentation",
        title: "Document Preparation",
        description: "Complete document preparation and verification services",
        icon: "📄",
        services: [
          { name: "Application Forms", description: "Professional form completion" },
          { name: "Document Translation", description: "Certified translation services" },
          { name: "Photo Requirements", description: "Visa-compliant photographs" },
          { name: "Financial Documentation", description: "Bank statements and financial proof" }
        ],
        features: [
          "Certified translations",
          "Document verification",
          "Compliance checking",
          "Express processing"
        ]
      },
      {
        id: "consultation",
        title: "Consultation Services",
        description: "Expert guidance and personalized consultation",
        icon: "💼",
        services: [
          { name: "Eligibility Assessment", description: "Determine your visa eligibility" },
          { name: "Country Requirements", description: "Country-specific guidance" },
          { name: "Processing Time Estimates", description: "Accurate timeline planning" },
          { name: "Strategy Planning", description: "Optimized application strategy" }
        ],
        features: [
          "Free initial consultation",
          "Personalized advice",
          "Success rate optimization",
          "24/7 support"
        ]
      }
    ];
    
    return NextResponse.json({
      success: true,
      services: popularDestinations
    });
    
  } catch (error) {
    console.error("Error fetching services data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
