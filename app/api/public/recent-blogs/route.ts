import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Blog from '@/models/Blog';

export const revalidate = 3600 // Revalidate every hour

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

export async function GET() {
  try {
    await connectDb();

    // Fetch recent published blogs (limit to 3 for the home page)
    const blogs = await Blog.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .select('_id title slug excerpt featuredImage author publishedAt createdAt')
      .lean();

    // Transform the data to match the expected format
    const formattedBlogs = blogs.map(blog => ({
      title: blog.title,
      date: formatDate(blog.publishedAt || blog.createdAt),
      author: blog.author || 'Anonymous',
      excerpt: blog.excerpt || '',
      image: blog.featuredImage || '/visa/blog-placeholder.png',
      href: `/blog/${blog.slug}`
    }));

    // Return with cache headers for better performance
    return NextResponse.json({
      success: true,
      blogs: formattedBlogs
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent blogs' },
      { status: 500 }
    );
  }
}
