import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Visa from '@/models/Visa'

// GET - Fetch all visa SEO data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session?.user?.email || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get all visa SEO data from the database
    const visas = await Visa.find({}).sort({ country: 1, visaType: 1 })

    return NextResponse.json({
      success: true,
      visas: visas.map((visa: any) => ({
        _id: visa._id.toString(),
        country: visa.country,
        visaType: visa.visaType,
        title: `${visa.country} ${visa.visaType} Visa`,
        metaTitle: visa.metaTitle || `${visa.country} ${visa.visaType} Visa`,
        metaDescription: visa.metaDescription || '',
        metaKeywords: visa.metaKeyword ? visa.metaKeyword.split(',').map((k: string) => k.trim()) : [],
        ogTitle: visa.metaTitle || `${visa.country} ${visa.visaType} Visa`,
        ogDescription: visa.metaDescription || '',
        ogImage: visa.countryFlag || '',
        canonical: `/visa/${visa.country.toLowerCase()}/${visa.visaType.toLowerCase()}`,
        robots: visa.metaRobots || 'INDEX, FOLLOW',
        status: visa.status,
        lastModified: visa.updatedAt?.toISOString() || visa.createdAt?.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching visa SEO data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update visa SEO
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session?.user?.email || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { visaId, metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonical, robots, status } = body

    await connectDB()

    // Update existing visa
    const updatedVisa = await Visa.findByIdAndUpdate(
      visaId,
      {
        metaTitle,
        metaDescription,
        metaKeyword: metaKeywords ? metaKeywords.join(', ') : '',
        metaRobots: robots,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedVisa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Visa SEO updated successfully',
      visa: {
        _id: updatedVisa._id.toString(),
        country: updatedVisa.country,
        visaType: updatedVisa.visaType,
        title: `${updatedVisa.country} ${updatedVisa.visaType} Visa`,
        metaTitle: updatedVisa.metaTitle,
        metaDescription: updatedVisa.metaDescription,
        metaKeywords: updatedVisa.metaKeyword ? updatedVisa.metaKeyword.split(',').map((k: string) => k.trim()) : [],
        ogTitle: updatedVisa.metaTitle,
        ogDescription: updatedVisa.metaDescription,
        ogImage: updatedVisa.countryFlag,
        canonical: `/visa/${updatedVisa.country.toLowerCase()}/${updatedVisa.visaType.toLowerCase()}`,
        robots: updatedVisa.metaRobots,
        status: updatedVisa.status,
        lastModified: updatedVisa.updatedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Error saving visa SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
