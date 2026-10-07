import connectDB from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { NextResponse } from "next/server";
import Visa from "@/models/Visa";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    console.log('[DEBUG] Document requirements API called:', { id })
    
    if (!id) {
      console.error('[DEBUG] Missing visa id')
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('[DEBUG] Unauthorized request')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[DEBUG] Fetching visa:', id)
    const visa = await Visa.findById(id);
    if (!visa) {
      console.error('[DEBUG] Visa not found:', id)
      return NextResponse.json({ error: "Visa not found" }, { status: 404 });
    }

    // Get document types from config to include metadata
    // Using mongoose connection to access the collection directly
    const db = mongoose.connection.db;
    let documentTypes: any[] = [];
    
    if (db) {
      documentTypes = await db.collection('documenttypes')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray();
     
    } else {
      console.error('[DEBUG] Database connection not available')
    }
    
    // Create a map of document metadata
    const documentMetadata: Record<string, any> = {};
    documentTypes.forEach((doc: any) => {
      if (doc.isActive) {
        documentMetadata[doc.slug] = {
          displayName: doc.displayName || doc.name,
          description: doc.description,
          isRequired: doc.isRequired,
          formats: doc.formats || ['pdf', 'jpg', 'png'],
          maxSizeMB: doc.maxSizeMB || 5,
          imageSpec: doc.imageSpec,
          exampleImage: doc.exampleImage, // Add example image from document type config
        };
      }
    });


    // Return documents with metadata
    const documents = visa.documents || {};
    const result: Record<string, any> = {};
    
    Object.entries(documents).forEach(([key, value]) => {
      if (value === true) {
        result[key] = {
          required: true,
          ...documentMetadata[key],
        };
      }
    });

   

    return NextResponse.json(result);
  } catch (error) {
    console.error('[DEBUG] Document requirements API error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
