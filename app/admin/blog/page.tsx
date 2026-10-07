'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: string
  status: 'published' | 'draft'
  category: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch blogs and categories from API
  useEffect(() => {
    fetchBlogsList()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog-config', {
        cache: 'no-store',
      })
      const data = await response.json()
      if (data.success && data.data?.categories) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  const fetchBlogsList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blog/create')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data || [])
      } else {
        console.error(
          'Failed to fetch blogs:',
          response.status,
          response.statusText
        )
        // You could set an error state here to show to the user
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      // You could set an error state here to show to the user
    } finally {
      setLoading(false)
    }
  }
  // Filter blogs based on search and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter
    const matchesCategory =
      categoryFilter === 'all' || blog.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = async (blogId: string, blogTitle: string) => {
    setDeletingId(blogId)

    try {
      const response = await fetch(`/api/admin/blog/${blogId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== blogId))
        alert(`"${blogTitle}" deleted successfully!`)
        fetchBlogsList()
      } else {
        throw new Error('Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Error deleting blog. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-blue-100 mt-2">
              Create, edit, and manage your blog posts
            </p>
          </div>
          <Link href="/admin/blog/create">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Create New Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem
                        key={category._id || category.slug}
                        value={category.name}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredBlogs.length} of {blogs.length} blogs
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog List */}
        {filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No blogs found
              </h3>
              <p className="text-gray-600 mb-6">
                {blogs.length === 0
                  ? 'Get started by creating your first blog post.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {blogs.length === 0 && (
                <Link href="/admin/blog/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Blog
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredBlogs.map(blog => (
              <Card
                key={blog._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                          <Link href={`/admin/blog/edit/${blog._id}`}>
                            {blog.title}
                          </Link>
                        </h3>
                        <Badge className={getStatusColor(blog.status)}>
                          {blog.status}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {blog.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {blog.publishedAt
                            ? formatDate(blog.publishedAt)
                            : formatDate(blog.createdAt)}
                        </div>
                        <div className="text-xs">Category: {blog.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {blog.status === 'published' ? (
                        <Link href={`/blog/${blog.slug}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <Button variant="outline" size="sm" disabled>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Publish the blog to view it</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Link href={`/admin/blog/edit/${blog._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            disabled={deletingId === blog._id}
                          >
                            {deletingId === blog._id ? (
                              <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Blog Post
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{blog.title}"?
                              This action cannot be undone and will permanently
                              remove the blog post from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(blog._id, blog.title)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === blog._id}
                            >
                              {deletingId === blog._id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Deleting...
                                </div>
                              ) : (
                                'Delete Blog'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
