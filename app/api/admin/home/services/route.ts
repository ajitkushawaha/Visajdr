import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import ServicesSection from "@/models/ServicesSection";

// GET - Fetch service section
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    
    // Find the active service section or create a default one
    let serviceSection = await ServicesSection.findOne({ status: 'active' });
    
    if (!serviceSection) {
      // Create default service section if none exists
      serviceSection = new ServicesSection({
        title: "Our Services",
        subtitle: "Comprehensive Solutions for Your European Journey",
        description: "We provide end-to-end visa and travel services to make your European adventure seamless.",
        status: "active",
        order: 0
      });
      await serviceSection.save();
    }

    return NextResponse.json({
      success: true,
      serviceSection
    });

  } catch (error) {
    console.error('Error fetching service section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service section' },
      { status: 500 }
    );
  }
}

// POST/PUT - Update service section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      status = "active",
      order = 0
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find existing service section or create new one
    let serviceSection = await ServicesSection.findOne({ status: 'active' });
    
    if (serviceSection) {
      // Update existing service section
      serviceSection.title = title;
      serviceSection.subtitle = subtitle || serviceSection.subtitle;
      serviceSection.description = description || serviceSection.description;
      serviceSection.status = status;
      serviceSection.order = order;
      
      await serviceSection.save();
    } else {
      // Create new service section
      serviceSection = new ServicesSection({
        title,
        subtitle,
        description,
        status,
        order
      });
      
      await serviceSection.save();
    }

    return NextResponse.json({
      success: true,
      serviceSection,
      message: 'Service section updated successfully'
    });

  } catch (error) {
    console.error('Error updating service section:', error);
    return NextResponse.json(
      { error: 'Failed to update service section' },
      { status: 500 }
    );
  }
}
