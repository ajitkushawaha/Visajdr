import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import BrandCollaboration from '@/models/BrandCollaboration'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    // Find the brand collaboration section
    const brandCollaboration = await BrandCollaboration.findOne({ status: 'active' })
    
    if (!brandCollaboration) {
      return NextResponse.json({ success: false, error: "No brand collaboration section found" }, { status: 404 })
    }

    // Filter out logos with SVG content (keep only PNG logos)
    const cleanLogos = brandCollaboration.logos.filter(logo => 
      logo.svg && !logo.svg.includes('<svg') // Keep logos that have svg field but no SVG content
    )

    // Update the section with only clean logos
    const updatedSection = await BrandCollaboration.findByIdAndUpdate(
      brandCollaboration._id,
      { logos: cleanLogos },
      { new: true }
    )

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up brand logos. Removed ${brandCollaboration.logos.length - cleanLogos.length} SVG logos, kept ${cleanLogos.length} PNG logos.`,
      brandCollaboration: updatedSection
    })
  } catch (error) {
    console.error("Error cleaning up brand logos:", error)
    return NextResponse.json({ success: false, error: "Failed to clean up brand logos" }, { status: 500 })
  }
}
