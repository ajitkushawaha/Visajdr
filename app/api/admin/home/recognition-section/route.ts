import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import RecognitionSection from '@/models/RecognitionSection'
import { revalidatePath } from 'next/cache'

// GET: Fetch Recognition Section data
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    let section = await RecognitionSection.findOne()

    // If no section exists, return default data (optional, or handle in frontend)
    if (!section) {
      // Create a default structure if needed, or just return null
      // For admin, we might want to return a default structure to populate the form
      return NextResponse.json({
        success: true,
        recognitionSection: null,
      })
    }

    return NextResponse.json({
      success: true,
      recognitionSection: section,
    })
  } catch (error) {
    console.error('Error fetching Recognition Section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Recognition Section data' },
      { status: 500 }
    )
  }
}

// POST: Update or Create Recognition Section data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await connectDB()

    // Find the existing section or create a new one
    // Since we typically only have one home page recognition section, we can use findOneAndUpdate
    // with upsert: true. Ideally, we might want to ensure only one document exists.

    // Using findOne to check existence first might be safer if we want to preserve _id
    let section = await RecognitionSection.findOne()

    if (section) {
      // Update existing
      section.title = body.title
      section.partners = body.partners
      section.status = body.status
      await section.save()
    } else {
      // Create new
      section = await RecognitionSection.create(body)
    }

    // Revalidate the home page to reflect changes immediately
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      recognitionSection: section,
      message: 'Recognition Section updated successfully',
    })
  } catch (error) {
    console.error('Error updating Recognition Section:', error)
    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'ValidationError'
    ) {
      // @ts-ignore
      const validationErrors = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ')
      return NextResponse.json(
        { success: false, error: `Validation Error: ${validationErrors}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update Recognition Section data' },
      { status: 500 }
    )
  }
}
