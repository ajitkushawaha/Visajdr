import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Page from '@/models/Page'

// GET - Fetch specific page SEO data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session?.user?.email || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    await connectDB()

    const page = await Page.findById(id)

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      page: {
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
        lastModified: page.updatedAt?.toISOString() || page.createdAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching page SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update specific page SEO data
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session?.user?.email || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonical, robots, status } = body

    await connectDB()

    const updatedPage = await Page.findByIdAndUpdate(
      id,
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
    console.error('Error updating page SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific page SEO data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session?.user?.email || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    await connectDB()

    const deletedPage = await Page.findByIdAndDelete(id)

    if (!deletedPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting page SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
