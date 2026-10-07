import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import Page from "@/models/Page";
import connectDB from "@/lib/db";

// GET - Fetch all pages with ordering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    const pages = await Page.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      pages, 
      total: pages.length 
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageData = await request.json();
    
    if (!pageData.title || !pageData.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    // Check for duplicate slug
    const existingPage = await Page.findOne({ slug: pageData.slug });
    if (existingPage) {
      return NextResponse.json({ error: "Page with this slug already exists" }, { status: 409 });
    }

    // Get the highest order number and add 1
    const maxOrder = await Page.findOne().sort({ order: -1 });
    const newOrder = maxOrder ? maxOrder.order + 1 : 1;

    const newPage = new Page({
      ...pageData,
      order: newOrder,
      author: session.user.name || session.user.email,
      publishedAt: pageData.status === 'active' ? new Date() : null
    });

    await newPage.save();

    return NextResponse.json({ 
      message: "Page created successfully", 
      page: newPage 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
