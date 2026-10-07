// app/api/public/visa-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

// Cache for 10 minutes since this data changes infrequently
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// GET - Fetch active visa configurations for public use
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }
   
    // Fetch all configurations in parallel with optimized queries
    // Using .project() to only fetch needed fields for better performance
    const [visaTypes, documentTypes, visaCategories, processingTimeTypes, occupancyTypes] = await Promise.all([
      db.collection('visatypes').find({ isActive: true }).sort({ order: 1, name: 1 }).project({ _id: 1, name: 1, slug: 1, order: 1 }).toArray(),
      db.collection('documenttypes').find({ isActive: true }).sort({ order: 1, name: 1 }).project({ _id: 1, name: 1, slug: 1, displayName: 1, order: 1, exampleImage: 1, icon: 1 }).toArray(),
      db.collection('visacategories').find({ isActive: true }).sort({ order: 1, name: 1 }).project({ _id: 1, name: 1, slug: 1, order: 1 }).toArray(),
      db.collection('processingtimetypes').find({ isActive: true }).sort({ order: 1, name: 1 }).project({ _id: 1, name: 1, slug: 1, order: 1 }).toArray(),
      db.collection('occupancytypes').find({ isActive: true }).sort({ order: 1, name: 1 }).project({ _id: 1, name: 1, slug: 1, order: 1 }).toArray()
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        visaTypes,
        documentTypes,
        visaCategories,
        processingTimeTypes,
        occupancyTypes
      }
    });

    // Add caching headers - cache for 10 minutes
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=1200'
    );

    return response;
  } catch (error) {
    console.error("Error fetching public visa configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch visa configurations" },
      { status: 500 }
    );
  }
} 