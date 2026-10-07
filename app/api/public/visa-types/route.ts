import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import mongoose from "mongoose";

// Allow ISR with revalidation
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET() {
  try {
    await connectDb();
    const db = mongoose.connection.db;
    
    // Fetch visa types from the visatypes collection (same as admin API)
    const visaTypes = await db.collection('visatypes')
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .toArray();
    
    // Transform the data to include only necessary fields for public display
    const transformedVisaTypes = visaTypes.map(item => ({
      id: item._id.toString(),
      name: item.name,
      slug: item.slug,
      displayName: item.displayName,
      description: item.description,
      image: item.image || null, // Explicitly set to null if undefined
      icon: item.icon || null,
      order: item.order
    }));
    
    // Use caching for better performance with revalidation
    const response = NextResponse.json({ visaTypes: transformedVisaTypes });
    // 60-second cache with stale-while-revalidate for better UX
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error) {
    console.error("Error fetching visa types:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
