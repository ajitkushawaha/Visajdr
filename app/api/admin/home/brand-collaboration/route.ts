import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import BrandCollaboration from '@/models/BrandCollaboration'

export async function GET() {
  try {
    await connectDB()
    
    let brandCollaboration = await BrandCollaboration.findOne({ status: 'active' })

    if (!brandCollaboration) {
      // Create default data if no active section exists
      brandCollaboration = await BrandCollaboration.create({
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
      });
    }

    return NextResponse.json({ success: true, brandCollaboration });
  } catch (error) {
    console.error("Error fetching brand collaboration section:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brand collaboration section" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const data = await req.json()
    
    // Find existing active section or create new one
    let brandCollaboration = await BrandCollaboration.findOne({ status: 'active' })
    
    if (brandCollaboration) {
      // Update existing section
      brandCollaboration.title = data.title
      brandCollaboration.subtitle = data.subtitle
      brandCollaboration.description = data.description
      brandCollaboration.logos = data.logos
      brandCollaboration.status = data.status
      brandCollaboration.order = data.order
      
      await brandCollaboration.save()
    } else {
      // Create new section
      brandCollaboration = await BrandCollaboration.create(data)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Brand collaboration section updated successfully",
      brandCollaboration 
    });
  } catch (error) {
    console.error("Error updating brand collaboration section:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update brand collaboration section" 
    }, { status: 500 });
  }
}