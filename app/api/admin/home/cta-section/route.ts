import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import connectDB from '@/lib/db';
import CTASection from '@/models/CTASection';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let ctaSection = await CTASection.findOne();

    if (!ctaSection) {
      // Create default data if no active section exists
      ctaSection = await CTASection.create({
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
    }

    return NextResponse.json({ success: true, ctaSection });
  } catch (error) {
    console.error("Error fetching CTA section:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch CTA section" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    let ctaSection;
    if (_id) {
      ctaSection = await CTASection.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    } else {
      ctaSection = await CTASection.create(updateData);
    }

    if (!ctaSection) {
      return NextResponse.json({ success: false, error: "CTA section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ctaSection });
  } catch (error) {
    console.error("Error saving CTA section:", error);
    return NextResponse.json({ success: false, error: "Failed to save CTA section" }, { status: 500 });
  }
}
