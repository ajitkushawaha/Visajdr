"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  FileText,
  Globe,
  Edit,
  Eye,
  Plus,
  Settings,
  Search as SearchIcon,
  Filter,
  MoreVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface PageSEO {
  _id: string
  path: string
  title: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
  robots: string
  status: 'active' | 'inactive' | 'draft'
  lastModified: string
  type: 'page'
}

interface VisaSEO {
  _id: string
  country: string
  visaType: string
  title: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
  robots: string
  status: 'active' | 'inactive'
  lastModified: string
}

export default function SEOManagement() {
  const [pages, setPages] = useState<PageSEO[]>([])
  const [visas, setVisas] = useState<VisaSEO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pages")
  const { toast } = useToast()

  useEffect(() => {
    fetchPages()
    fetchVisas()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/seo/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pages data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVisas = async () => {
    try {
      const response = await fetch('/api/admin/seo/visas')
      if (response.ok) {
        const data = await response.json()
        setVisas(data.visas || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch visa data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch visa data",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.metaTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVisas = visas.filter(visa =>
    visa.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-600 mt-1">Manage SEO settings for pages and visa quotations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Global SEO
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search pages or visas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Pages ({filteredPages.length})</span>
          </TabsTrigger>
          <TabsTrigger value="visas" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Country Quotation SEO ({filteredVisas.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="mt-6">
          <div className="grid gap-4">
            {filteredPages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pages Found</h3>
                  <p className="text-gray-600">No pages match your search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPages.map((page) => (
                <Card key={page._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{page.path}</span>
                            <Badge className={getStatusColor(page.status)}>
                              {page.status}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(page.path, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/admin/page-management/seo/edit/${page._id}`, '_blank')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit SEO
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Meta Title:</span>
                        <p className="text-sm text-gray-600 truncate">{page.metaTitle || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Meta Description:</span>
                        <p className="text-sm text-gray-600 line-clamp-2">{page.metaDescription || 'Not set'}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last modified: {new Date(page.lastModified).toLocaleDateString()}</span>
                        <span>{page.metaKeywords?.length || 0} keywords</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Visas Tab */}
        <TabsContent value="visas" className="mt-6">
          <div className="grid gap-4">
            {filteredVisas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visas Found</h3>
                  <p className="text-gray-600">No visa quotations match your search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredVisas.map((visa) => (
                <Card key={visa._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{visa.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{visa.country} - {visa.visaType}</span>
                            <Badge className={getStatusColor(visa.status)}>
                              {visa.status}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/visa/${visa.country.toLowerCase()}/${visa.visaType.toLowerCase()}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/admin/page-management/seo/edit/visa/${visa._id}`, '_blank')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit SEO
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Meta Title:</span>
                        <p className="text-sm text-gray-600 truncate">{visa.metaTitle || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Meta Description:</span>
                        <p className="text-sm text-gray-600 line-clamp-2">{visa.metaDescription || 'Not set'}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last modified: {new Date(visa.lastModified).toLocaleDateString()}</span>
                        <span>{visa.metaKeywords?.length || 0} keywords</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}