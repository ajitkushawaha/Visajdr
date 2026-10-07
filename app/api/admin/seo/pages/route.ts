import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Page from '@/models/Page'

// GET - Fetch all pages with SEO data
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

    // Get all pages from the database
    const pages = await Page.find({}).sort({ order: 1 })

    return NextResponse.json({
      success: true,
      pages: pages.map((page: any) => ({
        _id: page._id.toString(),
        path: `/${page.slug}`,
        title: page.title,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        metaKeywords: page.metaKeywords ? page.metaKeywords.split(',').map((k: string) => k.trim()) : [],
        ogTitle: page.metaTitle || '',
        ogDescription: page.metaDescription || '',
        ogImage: page.featuredImage || '',
        canonical: `/${page.slug}`,
        robots: 'index, follow',
        status: page.status,
        lastModified: page.updatedAt?.toISOString() || page.createdAt?.toISOString(),
        type: 'page'
      }))
    })

  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update page SEO
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
    const { pageId, metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonical, robots, status } = body

    await connectDB()

    // Update existing page
    const updatedPage = await Page.findByIdAndUpdate(
      pageId,
      {
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords ? metaKeywords.join(', ') : '',
        featuredImage: ogImage,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page SEO updated successfully',
      page: {
        _id: updatedPage._id.toString(),
        path: `/${updatedPage.slug}`,
        title: updatedPage.title,
        metaTitle: updatedPage.metaTitle,
        metaDescription: updatedPage.metaDescription,
        metaKeywords: updatedPage.metaKeywords ? updatedPage.metaKeywords.split(',').map((k: string) => k.trim()) : [],
        ogTitle: updatedPage.metaTitle,
        ogDescription: updatedPage.metaDescription,
        ogImage: updatedPage.featuredImage,
        canonical: `/${updatedPage.slug}`,
        robots: 'index, follow',
        status: updatedPage.status,
        lastModified: updatedPage.updatedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Error saving page SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
