import { NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import Blog from '@/models/Blog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'

// Simple slugify helper (or use your existing util)
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// GET (list) stays the same if you already have it.
export async function GET() {
  try {
    await connectDb()
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json(blogs, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ✅ CREATE (POST)
export async function POST(req: Request) {
  try {
    await connectDb()

    // Auth guard (adjust to your auth)
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Debug: Log CTA data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Blog CTA data received:', {
        headerCTA: body.headerCTA,
        visaPlanCTA: body.visaPlanCTA,
        footerCTA: body.footerCTA,
        headerCTAType: typeof body.headerCTA,
        headerCTAKeys: body.headerCTA ? Object.keys(body.headerCTA) : null,
      })
    }

    // Basic validation
    const required = ['title', 'excerpt', 'content']
    for (const f of required) {
      if (!body[f] || typeof body[f] !== 'string' || !body[f].trim()) {
        return NextResponse.json(
          { error: `Field "${f}" is required` },
          { status: 400 }
        )
      }
    }

    // Slug logic (allow custom or auto-generate)
    const baseSlug = body.slug ? slugify(body.slug) : slugify(body.title)

    // Ensure unique slug: append -2, -3, ... if taken
    let uniqueSlug = baseSlug
    let i = 2
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${i++}`
    }

    const now = new Date()

    // Build blog data object
    const blogData: any = {
      title: body.title.trim(),
      slug: uniqueSlug,
      excerpt: body.excerpt.trim(),
      content: body.content, // HTML (or store markdown if you prefer)
      featuredImage: body.featuredImage || '',
      featuredImageAlt: body.featuredImageAlt || '',
      author: body.author || (session.user as any)?.name || 'Admin',
      status: body.status === 'draft' ? 'draft' : 'published',
      category: body.category || 'General',
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || body.excerpt,
      metaKeywords: body.metaKeywords || '',
      publishedAt:
        body.status === 'draft'
          ? null
          : body.publishedAt
            ? new Date(body.publishedAt)
            : now,
    }

    // Add CTA configurations if they exist
    if (
      body.headerCTA &&
      typeof body.headerCTA === 'object' &&
      Object.keys(body.headerCTA).length > 0
    ) {
      blogData.headerCTA = body.headerCTA
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding headerCTA to blogData:', blogData.headerCTA)
      }
    }
    if (
      body.visaPlanCTA &&
      typeof body.visaPlanCTA === 'object' &&
      Object.keys(body.visaPlanCTA).length > 0
    ) {
      blogData.visaPlanCTA = body.visaPlanCTA
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding visaPlanCTA to blogData:', blogData.visaPlanCTA)
      }
    }
    if (
      body.footerCTA &&
      typeof body.footerCTA === 'object' &&
      Object.keys(body.footerCTA).length > 0
    ) {
      blogData.footerCTA = body.footerCTA
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding footerCTA to blogData:', blogData.footerCTA)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Final blogData before create:',
        JSON.stringify(blogData, null, 2)
      )
    }

    try {
      const blog = await Blog.create(blogData)

      return NextResponse.json(blog, { status: 201 })
    } catch (createError: any) {
      // Handle duplicate key error (E11000) - slug already exists in database index
      // This can happen if a blog was deleted but the unique index still has the slug
      if (createError.code === 11000 && createError.keyPattern?.slug) {
        // Slug conflict - try with incremented number
        let conflictSlug = `${baseSlug}-2`
        let j = 3
        let conflictBlog = await Blog.findOne({ slug: conflictSlug })

        while (conflictBlog) {
          conflictSlug = `${baseSlug}-${j++}`
          conflictBlog = await Blog.findOne({ slug: conflictSlug })
        }

        // Retry creation with new slug - use same blogData but update slug
        const retryBlogData = { ...blogData, slug: conflictSlug }
        const blog = await Blog.create(retryBlogData)

        return NextResponse.json(blog, { status: 201 })
      }

      // Re-throw if it's not a duplicate key error
      throw createError
    }
  } catch (error) {
    console.error('❌ Error creating blog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
