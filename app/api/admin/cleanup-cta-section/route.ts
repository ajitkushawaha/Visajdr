import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CTASection from '@/models/CTASection';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Remove all existing CTA section records
    await CTASection.deleteMany({});

    // Create a new default record with the correct schema
    const newCTASection = await CTASection.create({
      iconPath: "/visa/Frame.png",
      badgeText: "Process Overview",
      title: "We Trust The Process do you?",
      subtitle: "",
      backgroundImagePath: "/visa/trustbg.png",
      backgroundColor: "#F8F7FA",
      stats: [
        {
          title: "Google Rating",
          value: "4.8",
          description: "Google Rating",
          backgroundColor: "#EC3237",
          textColor: "white",
          order: 0,
          status: "active"
        },
        {
          title: "Visa Approval Rate",
          value: "99.3%",
          description: "Visa Approval Rate",
          backgroundColor: "#07034F",
          textColor: "white",
          order: 1,
          status: "active"
        },
        {
          title: "Visa Processed",
          value: "40000+",
          description: "Visa Processed",
          backgroundColor: "#F58634",
          textColor: "white",
          order: 2,
          status: "active"
        }
      ],
      status: "active",
      order: 0
    });

    return NextResponse.json({ 
      success: true, 
      message: "Cleaned up CTA section. Created new default record.", 
      ctaSection: newCTASection 
    });
  } catch (error) {
    console.error("Error cleaning up CTA section:", error);
    return NextResponse.json({ success: false, error: "Failed to cleanup CTA section" }, { status: 500 });
  }
}
