import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import BlogImage from '@/components/blog/BlogImage'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import BlogSearch from '@/components/blog/BlogSearch'
import connectDb from '@/lib/db'
import Blog from '@/models/Blog'

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/blog')
  return generateSEOMetadata(seoData)
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Get search and category parameters
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const category =
    typeof params.category === 'string' ? params.category : 'All Posts'
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const postsPerPage = 6

  // Call API directly (server-side)
  let blogPosts = []
  let totalPages = 1

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Build query parameters
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'All Posts')
      params.append('category', category)
    params.append('page', page.toString())
    params.append('limit', postsPerPage.toString())

    const res = await fetch(`${baseUrl}/api/public/blog?${params}`, {
      cache: 'no-store', // ensures fresh data, not cached
    })

    if (res.ok) {
      const data = await res.json()
      blogPosts = data.blogs || []
      totalPages = data.pagination?.pages || 1
    } else {
      console.error('Failed to fetch blogs:', res.status)
    }
  } catch (error) {
    console.error('Error fetching blogs:', error)
    blogPosts = []
  }

  // Ensure blogPosts is an array and has at least one item
  if (!Array.isArray(blogPosts) || blogPosts.length === 0) {
    blogPosts = []
  }

  // Since we're now using server-side filtering and pagination,
  // we don't need client-side filtering anymore
  const filteredPosts = blogPosts
  const paginatedPosts = blogPosts

  // Fetch unique categories from published blogs
  let allCategories: string[] = []
  try {
    await connectDb()
    const categories = await Blog.distinct('category', { status: 'published' })
    // Filter out null/undefined/empty categories and sort
    allCategories = categories
      .filter((cat): cat is string => Boolean(cat && cat.trim()))
      .sort()
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback to default categories if database fetch fails
    allCategories = [
      'Visa Guides',
      'Travel Tips',
      'Student Visas',
      'Business Travel',
      'Our Updates',
    ]
  }

  // Add 'All Posts' at the beginning for the filter
  const filterCategories = ['All Posts', ...allCategories]

  // Fetch recent blogs for the grid section (exclude already displayed posts)
  let recentBlogs = []
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const recentRes = await fetch(`${baseUrl}/api/public/blog?limit=20`, {
      cache: 'no-store',
    })

    if (recentRes.ok) {
      const recentData = await recentRes.json()
      const allRecentBlogs = recentData.blogs || []

      // Get IDs of already displayed posts to exclude them
      const displayedPostIds = new Set(
        paginatedPosts.map((post: any) => post._id?.toString())
      )

      // Filter out already displayed posts and take first 8
      recentBlogs = allRecentBlogs
        .filter((blog: any) => !displayedPostIds.has(blog._id?.toString()))
        .slice(0, 8)
    }
  } catch (error) {
    console.error('Error fetching recent blogs:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50  ">
      <div className="w-full pb-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden  bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 mb-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 p-24 sm:px-16 sm:pt-32 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Visa & Travel
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Insights
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest visa requirements, travel tips, and
              immigration news from our expert team
            </p>
            <BlogSearch />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        </div>
        {/* Search and Categories */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {filterCategories.map(cat => (
              <Link
                key={cat}
                href={
                  cat === 'All Posts'
                    ? '/blog'
                    : `/blog?category=${encodeURIComponent(cat)}`
                }
              >
                <Button
                  variant={cat === category ? 'default' : 'outline'}
                  size="lg"
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    cat === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="w-[90%] mx-auto">
          {/* Results Count */}
          {search && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Found {filteredPosts.length} result
                {filteredPosts.length !== 1 ? 's' : ''} for "{search}"
              </p>
            </div>
          )}

          {/* Blog Posts Grid */}
          {paginatedPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map(post => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post._id}
                  className="bg-white p-2 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <BlogImage
                      src={post.featuredImage || '/placeholder.svg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-2xl"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-medium">
                        {post.date}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-4 overflow-hidden">
                    {/* <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium">{post.date}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {calculateReadingTime(post.content)} min read
                            </span>
                          </div>
                        </div>
                      </div> */}

                    <h3 className="text-lg font-semibold text-gray-900 py-2 line-clamp-2 group-hover:text-blue-600 transition-colors break-words">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed break-words">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16">
              {/* Previous Button */}
              {page > 1 && (
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(search && { search }),
                    ...(category !== 'All Posts' && { category }),
                    page: (page - 1).toString(),
                  }).toString()}`}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    {'<<'}
                  </Button>
                </Link>
              )}

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  pageNum => {
                    // Show first page, last page, current page, and pages around current
                    const shouldShow =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - page) <= 1

                    if (!shouldShow) {
                      // Show ellipsis for gaps
                      if (pageNum === 2 && page > 4) {
                        return (
                          <span
                            key={pageNum}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        )
                      }
                      if (pageNum === totalPages - 1 && page < totalPages - 3) {
                        return (
                          <span
                            key={pageNum}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/blog?${new URLSearchParams({
                          ...(search && { search }),
                          ...(category !== 'All Posts' && { category }),
                          page: pageNum.toString(),
                        }).toString()}`}
                      >
                        <Button
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="lg"
                          className={`px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                            pageNum === page
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                              : 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    )
                  }
                )}
              </div>

              {/* Next Button */}
              {page < totalPages && (
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(search && { search }),
                    ...(category !== 'All Posts' && { category }),
                    page: (page + 1).toString(),
                  }).toString()}`}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    {'>>'}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Recent Blogs Grid - 4 columns with 8 items */}
          {recentBlogs.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Recent Blogs
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentBlogs.map((post: any) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={post._id}
                    className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <BlogImage
                        src={post.featuredImage || '/placeholder.svg'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 text-xs font-medium">
                          {new Date(
                            post.publishedAt || post.createdAt
                          ).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4 overflow-hidden">
                      <h3 className="text-base font-semibold text-gray-900 py-2 line-clamp-2 group-hover:text-blue-600 transition-colors break-words">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed break-words">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our comprehensive visa guides and travel resources
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {allCategories.length > 0 ? (
                allCategories.map(cat => (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                  >
                    <Button
                      variant="outline"
                      className="px-4 py-2 rounded-full font-medium transition-all duration-200 border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 bg-white shadow-sm hover:shadow-md"
                    >
                      {cat}
                    </Button>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">No categories available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
