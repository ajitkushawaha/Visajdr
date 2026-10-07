import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ServicesSection from "@/models/ServicesSection";

export const dynamic = 'force-dynamic';

// GET - Fetch service section (public, no auth required)
export async function GET() {
  try {
    await connectDB();
    
    // Find the active service section or return default
    let serviceSection = await ServicesSection.findOne({ status: 'active' });
    
    if (!serviceSection) {
      // Return default service section if none exists
      return NextResponse.json({
        success: true,
        serviceSection: {
          title: "Our Services",
          subtitle: "Comprehensive Solutions for Your European Journey",
          description: "We provide end-to-end visa and travel services to make your European adventure seamless.",
          status: "active",
          order: 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      serviceSection
    });

  } catch (error) {
    console.error('Error fetching service section:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch service section',
        serviceSection: {
          title: "Our Services",
          subtitle: "Comprehensive Solutions for Your European Journey",
          description: "We provide end-to-end visa and travel services to make your European adventure seamless.",
          status: "active",
          order: 0
        }
      },
      { status: 500 }
    );
  }
}

