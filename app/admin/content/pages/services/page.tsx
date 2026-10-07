'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowLeft,
  FileText,
  List,
  Plus,
  Settings,
  Eye,
  Edit,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ServicesHomePage() {
  const [serviceDetailsCount, setServiceDetailsCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)
  const [draftCount, setDraftCount] = useState(0)

  useEffect(() => {
    fetchServiceDetailsStats()
  }, [])

  const fetchServiceDetailsStats = async () => {
    try {
      const response = await fetch('/api/admin/service-details')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const services = data.serviceDetails || []
          setServiceDetailsCount(services.length)
          setPublishedCount(
            services.filter((s: any) => s.status === 'published').length
          )
          setDraftCount(
            services.filter((s: any) => s.status === 'draft').length
          )
        }
      }
    } catch (error) {
      console.error('Error fetching service details stats:', error)
    }
  }

  const managementOptions = [
    {
      title: 'Main Services Page',
      description:
        'Edit the main services page content, hero section, and service cards',
      href: '/admin/content/pages/services/edit',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Service Detail Pages',
      description:
        'Create and manage individual service detail pages (e.g., Student Visas, Work Visas)',
      href: '/admin/content/pages/services/list',
      icon: List,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badge: serviceDetailsCount > 0 ? `${serviceDetailsCount} pages` : null,
    },
  ]

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/content">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 bg-white hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Content
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Services Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your services page and individual service detail pages
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('/services', '_blank')}
              className="flex items-center gap-2 text-gray-900 bg-white hover:bg-gray-200"
            >
              <Eye className="h-4 w-4" />
              Preview Services Page
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Service Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {serviceDetailsCount}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Individual service detail pages
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {publishedCount}
              </div>
              <p className="text-sm text-gray-500 mt-1">Live on website</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {draftCount}
              </div>
              <p className="text-sm text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <Link key={index} href={option.href}>
                <Card
                  className={`hover:shadow-lg transition-all cursor-pointer border-2 ${option.borderColor} hover:border-opacity-100`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${option.bgColor} w-fit`}>
                        <Icon className={`h-6 w-6 ${option.color}`} />
                      </div>
                      {option.badge && (
                        <Badge variant="secondary">{option.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-xl">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for managing services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/content/pages/services/list">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Service Page
                </Button>
              </Link>
              <Link href="/admin/content/pages/services/edit">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Main Services Page
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.open('/services', '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Main Services Page:</strong> Edit the overall services
                page layout, hero section, and the grid of service cards that
                appear on /services
              </li>
              <li>
                <strong>Service Detail Pages:</strong> Create individual pages
                for each service (e.g., /services/student-visas) with full
                content including benefits, requirements, FAQs, and more
              </li>
              <li>
                <strong>Service Cards:</strong> The service cards on the main
                services page automatically link to their detail pages based on
                the service title or custom slug
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
