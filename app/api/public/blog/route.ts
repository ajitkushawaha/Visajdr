import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Blog from '@/models/Blog';

// This route is dynamic because it handles query parameters (search, category, page, limit)
export const dynamic = 'force-dynamic'

// Helper function to safely format dates
const formatDate = (dateValue: any): string => {
  try {
    if (!dateValue) return 'Recently';

    const date = new Date(dateValue);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Recently';
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDb();

    // Get query parameters using Next.js request.nextUrl (doesn't trigger dynamic server usage)
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // Build query
    let query: any = { status: 'published' };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'All Posts') {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch blogs with pagination
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt content featuredImage author category tags publishedAt createdAt')
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    // Format blogs with date field
    const formattedBlogs = blogs.map(blog => ({
      ...blog,
      date: formatDate(blog.publishedAt || blog.createdAt),
      author: blog.author || 'Anonymous',
      excerpt: blog.excerpt || '',
      featuredImage: blog.featuredImage || '/visa/blog-placeholder.png'
    }));

    // Return with cache headers for better performance
    // Note: Search queries are cached but with shorter TTL for dynamic content
    const hasSearchParams = search || (category && category !== 'All Posts')
    const cacheControl = hasSearchParams
      ? 'public, s-maxage=300, stale-while-revalidate=3600' // 5 min for search results
      : 'public, s-maxage=3600, stale-while-revalidate=86400' // 1 hour for default list

    return NextResponse.json({
      blogs: formattedBlogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': cacheControl,
        'CDN-Cache-Control': cacheControl,
        'Vercel-CDN-Cache-Control': cacheControl,
      },
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
