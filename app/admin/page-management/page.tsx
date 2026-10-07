'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Eye, FileText, Menu } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import NavigationManagement from '@/components/navigation/NavigationManagement'

interface NavigationItem {
  _id: string
  label: string
  href: string
  icon: string
  order: number
  isActive: boolean
  target: '_self' | '_blank'
  hasDropdown: boolean
  dropdownItems: NavigationItem[]
  children: NavigationItem[]
  status: 'active' | 'inactive'
}

interface Navigation {
  _id: string
  name: string
  type: 'main' | 'footer' | 'mobile' | 'sidebar'
  items: NavigationItem[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export default function PagesManagement() {
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load navigations on component mount
  useEffect(() => {
    fetchNavigations()
  }, [])

  const fetchNavigations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/menu')
      if (response.ok) {
        const data = await response.json()
        setNavigations(data.navigations || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch navigation data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch navigation data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    total: navigations.length,
    main: navigations.filter(n => n.type === 'main').length,
    footer: navigations.filter(n => n.type === 'footer').length,
    mobile: navigations.filter(n => n.type === 'mobile').length,
  }

  if (loading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📄 Page Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your website pages and navigation
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="navigation" className="w-full">
          <TabsContent value="navigation" className="mt-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Menu className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Navigations
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Menu className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Main Navigation
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.main}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Footer Links
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.footer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Mobile Menu
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.mobile}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <NavigationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
