import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import BrandCollaboration from '@/models/BrandCollaboration'

export async function GET() {
  try {
    await connectDB()
    
    let brandCollaboration = await BrandCollaboration.findOne({ status: 'active' })

    if (!brandCollaboration) {
      // Return default data if no section found
      brandCollaboration = {
        title: "Ascending To greater heights With Our Partnerships",
        subtitle: "",
        description: "",
        logos: [
          {
            name: "IXIGO",
            imagePath: "https://res.cloudinary.com/dosglhfhy/image/upload/v1757807686/brand-logos/ixigo-logo.png",
            website: "",
            status: "active",
            order: 0
          },
          {
            name: "ACKO", 
            imagePath: "https://res.cloudinary.com/dosglhfhy/image/upload/v1757807688/brand-logos/acko-logo.png",
            website: "",
            status: "active",
            order: 1
          },
          {
            name: "SpiceJet",
            imagePath: "https://res.cloudinary.com/dosglhfhy/image/upload/v1757807689/brand-logos/spicejet-logo.png",
            website: "",
            status: "active",
            order: 2
          },
          {
            name: "Razorpay",
            imagePath: "https://res.cloudinary.com/dosglhfhy/image/upload/v1757807690/brand-logos/razorpay-logo.png",
            website: "",
            status: "active",
            order: 3
          },
          {
            name: "Zomato",
            imagePath: "https://res.cloudinary.com/dosglhfhy/image/upload/v1757807692/brand-logos/zomato-logo.png",
            website: "",
            status: "active",
            order: 4
          }
        ],
        status: "active",
        order: 0
      } as any; // Cast to any to satisfy type checking for default object
    }

    return NextResponse.json({ success: true, brandCollaboration });
  } catch (error) {
    console.error("Error fetching brand collaboration content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brand collaboration content" }, { status: 500 });
  }
}