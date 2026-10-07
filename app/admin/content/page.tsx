'use client'

import { useState } from 'react'
import {
  Image,
  Settings,
  BarChart3,
  Plus,
  ArrowRight,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Home,
  Star,
  Shield,
  HelpCircle,
  Briefcase,
  FileText,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DashboardStats {
  mediaFiles: number
  homeSections: number
  testimonials: number
  whyChooseUs: number
  statistics: number
  faqs: number
  recentMedia: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
  }>
  recentHomeUpdates: Array<{
    id: string
    section: string
    status: string
    updatedAt: string
  }>
}

export default function ContentManagementPage() {
  const [stats] = useState<DashboardStats>({
    mediaFiles: 45,
    homeSections: 4,
    testimonials: 12,
    whyChooseUs: 5,
    statistics: 6,
    faqs: 7,
    recentMedia: [
      {
        id: '1',
        name: 'hero-banner.jpg',
        type: 'image',
        uploadedAt: '2 hours ago',
      },
      {
        id: '2',
        name: 'service-icon.svg',
        type: 'image',
        uploadedAt: '1 day ago',
      },
      {
        id: '3',
        name: 'testimonial-bg.png',
        type: 'image',
        uploadedAt: '3 days ago',
      },
      {
        id: '4',
        name: 'company-logo.png',
        type: 'image',
        uploadedAt: '1 week ago',
      },
    ],
    recentHomeUpdates: [
      {
        id: '1',
        section: 'Hero Section',
        status: 'updated',
        updatedAt: '2 hours ago',
      },
      {
        id: '2',
        section: 'Testimonials',
        status: 'updated',
        updatedAt: '1 day ago',
      },
      {
        id: '3',
        section: 'Statistics',
        status: 'updated',
        updatedAt: '3 days ago',
      },
      {
        id: '4',
        section: 'Services',
        status: 'updated',
        updatedAt: '1 week ago',
      },
    ],
  })

  const cmsSections = [
    {
      title: 'Home Content',
      description: 'Manage homepage sections and content',
      icon: Home,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/admin/content/home',
      stats: stats.homeSections,
      actions: [
        { label: 'Manage Hero', href: '/admin/content/home/hero' },

        {
          label: 'Manage Brand Collaboration',
          href: '/admin/content/home/brand-collaboration',
        },
        {
          label: 'Manage CTA Section',
          href: '/admin/content/home/cta-section',
        },
        {
          label: 'Manage Testimonials',
          href: '/admin/content/home/testimonials',
        },
        {
          label: 'Manage Recognition Section',
          href: '/admin/content/home/recognition-section',
        },

        { label: 'Manage FAQs', href: '/admin/content/faq' },
      ],
    },
    {
      title: 'About Page Content Management',
      description: 'Manage static pages and public content',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/content/pages',
      stats: 8,
      actions: [
        { label: 'About Us', href: '/admin/content/pages/about-us' },
        {
          label: 'Manage Scrolling Services',
          href: '/admin/content/home/scrolling-services',
        },
        {
          label: 'Manage Why Choose Us',
          href: '/admin/content/home/why-choose-us',
        },

        {
          label: 'Manage Trust Visa Agent',
          href: '/admin/content/home/trust-visa-agent',
        },

        {
          label: 'Manage Google Reviews',
          href: '/admin/settings/google-reviews',
        },
        { label: 'Manage Statistics', href: '/admin/content/home/statistics' },

        { label: 'Manage FAQs', href: '/admin/content/faq' },
      ],
    },
    {
      title: 'Public Page Content Management',
      description: 'Manage static pages and public content',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/content/pages',
      stats: 8,
      actions: [
        { label: 'Contact Us', href: '/admin/content/pages/contact-us' },
        { label: 'Services', href: '/admin/content/pages/services' },
        { label: 'Career', href: '/admin/content/pages/career' },
        {
          label: 'Travel Insurance',
          href: '/admin/content/pages/travel-insurance',
        },
        { label: 'Select Plan Page', href: '/admin/content/select-plan' },
        { label: 'Policies', href: '/admin/content/policies' },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Content Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your website content, media, and homepage sections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Media Files
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.mediaFiles}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Image className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Home Sections
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.homeSections}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Testimonials
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.testimonials}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Statistics
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.statistics}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CMS Sections */}
        <div className="grid grid-cols-1  gap-6 mb-8">
          {cmsSections.map(section => (
            <Card
              key={section.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{section.stats}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.actions.map(action => (
                    <Link key={action.label} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-gray-700 hover:text-gray-900"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Recent Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentMedia.map(media => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{media.name}</p>
                      <p className="text-sm text-gray-500">
                        {media.type} • {media.uploadedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{media.type}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Home Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Recent Home Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentHomeUpdates.map(update => (
                  <div
                    key={update.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {update.section}
                      </p>
                      <p className="text-sm text-gray-500">
                        Updated {update.updatedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(update.status)}>
                        {update.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
