import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import connectDB from '@/lib/db';
import TestimonialsSection from '@/models/TestimonialsSection';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let testimonialsSection = await TestimonialsSection.findOne();

    if (!testimonialsSection) {
      // Create default data if no active section exists
      testimonialsSection = await TestimonialsSection.create({
        badgeText: "Client Testimonials",
        title: "what people say about us",
        description: "Don't just take our word for it. Hear it straight from the jet-setters themselves.",
        backgroundImagePath: "/visa/map.png",
        backgroundColor: "#ffffff",
        stats: [
          {
            title: "Happy Users",
            value: "100K+",
            description: "Happy Users",
            backgroundColor: "#DC2626",
            textColor: "white",
            position: "left",
            order: 0,
            status: "active"
          },
          {
            title: "Google Rating",
            value: "4.8",
            description: "Google Rating",
            backgroundColor: "#1E3A8A",
            textColor: "white",
            position: "right",
            order: 1,
            status: "active"
          }
        ],
        testimonials: [
          {
            text: "Had a great experience here. Jewellery designs were amazing also the staff assisted us so well, especially Aliya. Been so kind enough to help us in choosing the design; she was really very good at her work. Also it was really good experience shopping at the place.",
            name: "Ulhas Jewellers",
            date: "04 Jul 2024",
            rating: 5,
            order: 0,
            status: "active"
          },
          {
            text: "The visa process was super smooth and efficient. The team was helpful throughout the documentation.",
            name: "Mohit Sharma",
            date: "15 Jul 2024",
            rating: 5,
            order: 1,
            status: "active"
          }
        ],
        status: "active",
        order: 0
      });
    }

    return NextResponse.json({ success: true, testimonialsSection });
  } catch (error) {
    console.error("Error fetching testimonials section:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials section" }, { status: 500 });
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

    let testimonialsSection;
    if (_id) {
      testimonialsSection = await TestimonialsSection.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    } else {
      testimonialsSection = await TestimonialsSection.create(updateData);
    }

    if (!testimonialsSection) {
      return NextResponse.json({ success: false, error: "Testimonials section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, testimonialsSection });
  } catch (error) {
    console.error("Error saving testimonials section:", error);
    return NextResponse.json({ success: false, error: "Failed to save testimonials section" }, { status: 500 });
  }
}