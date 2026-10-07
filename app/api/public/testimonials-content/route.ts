import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TestimonialsSection from '@/models/TestimonialsSection';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const testimonialsSection = await TestimonialsSection.findOne({ status: 'active' });

    if (!testimonialsSection) {
      // Return default data if no active section exists
      return NextResponse.json({
        success: true,
        testimonialsSection: {
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
        }
      });
    }

    return NextResponse.json({ success: true, testimonialsSection });
  } catch (error) {
    console.error("Error fetching testimonials content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials content" }, { status: 500 });
  }
}
