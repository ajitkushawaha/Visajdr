import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Visa from "@/models/Visa";

export async function GET(request: Request) {
  try {
    await connectDb();
    
    // Get country filter from query parameters
    const { searchParams } = new URL(request.url);
    const countryFilter = searchParams.get('country');
    
    // Build query - filter by country if provided
    const query: { status: string; country?: RegExp } = { status: "active" };
    if (countryFilter) {
      // Case-insensitive country matching
      query.country = new RegExp(`^${countryFilter}$`, 'i');
    }
    
    // Fetch active visas with optional country filter
    const visas = await Visa.find(query).sort({ createdAt: -1 });
    
    // Transform the data to include only necessary fields for public display
    const publicVisas = visas.map(visa => ({
      id: visa._id,
      country: visa.country,
      flag: visa.countryFlag || "",  // ✅ Match HeroSection interface
      countryFlag: visa.countryFlag || "",  // ✅ Match VisaSelectionWizard interface
      countryCode: visa.countryCode || "",
      countryImage: visa.countryImage || "",
      visaType: visa.visaType || "",
      adultPrice: visa.adultPrice || 0,
      childPrice: visa.childPrice || 0,
      processingTimeValue: visa.processingTimeValue || "",
      processingTimeDays: visa.processingTimeDays || "in-days",
      stayPeriod: visa.stayPeriod || "",
      validity: visa.validity || "",  
      occupancyType: visa.occupancyType || "",    
      purpose: visa.visaType || "",
      category: visa.category || "standard",
      processingTimeQuote: visa.processingTimeQuote || "",
      hotListed: visa.hotListed || "false",
      visaSchedule: visa.visaSchedule || null,
    }));
    
    // For unique countries list (used by hero section) - only when no country filter
    const uniqueCountries = countryFilter ? [] : Array.from(
      new Map(publicVisas.map(v => [v.country.toLowerCase(), v]))
    ).map(([_, v]) => {
      const processingUnit = v.processingTimeDays === 'schengen' ? 'Weeks' : 'Days';
      const processingTime = v.processingTimeValue
        ? `Visa in ${v.processingTimeValue} ${processingUnit}`
        : 'Visa Available';
        
      return {
        id: v.id,
        country: v.country,
        flag: v.flag,
        image: v.countryImage,
        processingTime
      };
    });
    
    // Use short-term caching (60 seconds) for better performance
    const response = NextResponse.json({ 
      visas: publicVisas, 
      uniqueCountries: uniqueCountries,
      total: publicVisas.length 
    });
    
    // 60-second cache for filtered results, immediate revalidation for stale data
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    
    return response;
  } catch (error) {
    console.error("Error fetching visas:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
