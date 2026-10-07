import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import Blog from '@/models/Blog'

export const revalidate = 3600 // Revalidate every hour

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const client = await clientPromise
    await client.connect() // ensure connected
    const post = await Blog.findOne({ slug: slug, status: 'published' }).lean()
   
    if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    
    // Return with cache headers for better performance
    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (e) {
    console.error('Public blog fetch error:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}