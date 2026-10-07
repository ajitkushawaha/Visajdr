import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import HeroSection from "@/models/HeroSection";

// GET - Fetch hero section
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    
    // Find the active hero section or create a default one
    let heroSection = await HeroSection.findOne({ status: 'active' });
    
    if (!heroSection) {
      // Create default hero section if none exists
      heroSection = new HeroSection({
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
        ],
        status: "active",
        order: 0
      });
      await heroSection.save();
    }

    return NextResponse.json({
      success: true,
      heroSection
    });

  } catch (error) {
    console.error('Error fetching hero section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero section' },
      { status: 500 }
    );
  }
}

// POST/PUT - Update hero section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      highlightedText,
      highlightedTextColor,
      backgroundImage,
      mainImage,
      mainImageAlt,
      bottomLabel,
      searchPlaceholder,
      floatingCountries,
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

    // Find existing hero section or create new one
    let heroSection = await HeroSection.findOne({ status: 'active' });
    
    if (heroSection) {
      // Update existing hero section
      heroSection.title = title;
      heroSection.description = description || heroSection.description;
      heroSection.highlightedText = highlightedText || heroSection.highlightedText;
      heroSection.highlightedTextColor = highlightedTextColor || heroSection.highlightedTextColor;
      heroSection.backgroundImage = backgroundImage || heroSection.backgroundImage;
      heroSection.mainImage = mainImage || heroSection.mainImage;
      heroSection.mainImageAlt = mainImageAlt || heroSection.mainImageAlt;
      heroSection.bottomLabel = bottomLabel || heroSection.bottomLabel;
      heroSection.searchPlaceholder = searchPlaceholder || heroSection.searchPlaceholder;
      heroSection.floatingCountries = floatingCountries || heroSection.floatingCountries;
      heroSection.status = status;
      heroSection.order = order;
      
      await heroSection.save();
    } else {
      // Create new hero section
      heroSection = new HeroSection({
        title,
        description,
        highlightedText,
        highlightedTextColor,
        backgroundImage,
        mainImage,
        mainImageAlt,
        bottomLabel,
        searchPlaceholder,
        floatingCountries: floatingCountries || [],
        status,
        order
      });
      
      await heroSection.save();
    }

    return NextResponse.json({
      success: true,
      heroSection,
      message: 'Hero section updated successfully'
    });

  } catch (error) {
    console.error('Error updating hero section:', error);
    return NextResponse.json(
      { error: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}
