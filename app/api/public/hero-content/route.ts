import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HeroSection from "@/models/HeroSection";

// Disable caching to show latest updates immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    
    // Find the active hero section
    const heroSection = await HeroSection.findOne({ status: 'active' });
    
    if (!heroSection) {
      // Return default data if no hero section found
      return NextResponse.json({
        success: true,
        heroSection: {
          title: "Apply for Your Visa Online with Visa4 - Fast, Secure & Hassle-Free",
          description: "Professional visa and travel services to help you explore Europe with confidence.",
          highlightedText: "Visa4",
          highlightedTextColor: "text-red-500",
          backgroundImage: "/visa/Vector.png",
          mainImage: "/visa/Rectangle.png",
          mainImageAlt: "Dubai City",
          bottomLabel: "Get Appointment Picked Within 72 Hours",
          searchPlaceholder: "Search for your destination...",
          floatingCountries: [
            {
              country: "China",
              flag: "🇨🇳",
              position: "top-left"
            },
            {
              country: "Albania", 
              flag: "🇦🇱",
              position: "top-right"
            },
            {
              country: "India",
              flag: "🇮🇳", 
              position: "center-left"
            },
            {
              country: "Germany",
              flag: "🇩🇪",
              position: "bottom-left"
            },
            {
              country: "UAE",
              flag: "🇦🇪",
              position: "bottom-right"
            }
          ]
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      heroSection
    });
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
