import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CTASection from '@/models/CTASection';

export async function GET() {
  try {
    await connectDB();
    const ctaSection = await CTASection.findOne({ status: 'active' });

    if (!ctaSection) {
      // Return default data if no active section exists
      return NextResponse.json({
        success: true,
        ctaSection: {
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
        }
      });
    }

    return NextResponse.json({ success: true, ctaSection });
  } catch (error) {
    console.error("Error fetching CTA section content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch CTA section content" }, { status: 500 });
  }
}
