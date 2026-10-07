'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  Globe,
  Clock,
  FileText,
  Shield,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Building,
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import Link from 'next/link'

interface VisaFormData {
  // Basic Information
  country: string
  countryFlag: string
  countryCode: string
  countryImage: string
  visaType: string
  adultPrice: string
  childPrice: string
  status: string

  // Processing Information
  processingTimeDays: string
  processingTimeValue: string
  processingTimeQuote: string
  stayPeriod: string
  validity: string
  eVisa: string
  category: string
  hotListed: string
  occupancyType: string

  // Schedule Information

  // Documents
  documents: {
    tl: boolean
    dl: boolean
    birthCertificate: boolean
    schoolMarksheet: boolean
    panCard: boolean
    test: boolean
    aadharCard: boolean
    id: boolean
    passport: boolean
  }

  // Content Tabs
  visaDetail: string
  visaDocument: string
  planDisclaimer: string
  inclusions: string
  importantInformation: string

  // SEO Meta
  metaRobots: string
  metaTitle: string
  metaKeyword: string
  metaDescription: string
}

export default function ViewVisaPage() {
  const { symbol: currencySymbol } = useCurrency()
  const router = useRouter()
  // Safely read dynamic route param `id`
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('visa-detail')
  const [visaData, setVisaData] = useState<any>('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/admin/visa/${id}/view`)
      .then(res => res.json())
      .then(data => setVisaData(data))
      .finally(() => setLoading(false)) // stop loading
  }, [id])
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
  if (!visaData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Visa Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The visa you're looking for doesn't exist.
            </p>
            <Link href="/admin/visa/list">
              <Button className="text-gray-700 hover:text-gray-900">
                Back to Visa List
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatCountryName = (country: string) => {
    if (!country) return ''
    return country.charAt(0).toUpperCase() + country.slice(1)
  }

  const formatVisaType = (type: string) => {
    if (!type) return ''
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'express':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'premium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'standard':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const requiredDocuments = Object.entries(visaData.documents || {})
    .filter(([_, required]) => required)
    .map(([doc]) => doc)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <Link href="/admin/visa/list">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  {visaData.countryFlag && (
                    <div className="relative">
                      <img
                        src={visaData.countryFlag}
                        alt={visaData.country}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                      />
                      {visaData.hotListed === 'true' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                          <CheckCircle className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {formatCountryName(visaData.country)}{' '}
                        {formatVisaType(visaData.visaType)}
                      </h1>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        className={`${getStatusColor(visaData.status)} font-semibold px-3 py-1`}
                      >
                        {visaData.status.toUpperCase()}
                      </Badge>
                      <Badge
                        className={`${getCategoryColor(visaData.category)} font-semibold px-3 py-1`}
                      >
                        {visaData.category.toUpperCase()}
                      </Badge>
                      {visaData.hotListed === 'true' && (
                        <Badge className="bg-yellow-100 text-yellow-800 font-semibold px-3 py-1">
                          ⭐ Hot Listed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/visa/${visaData._id}/edit`}>
                  <Button className="bg-brand-primary hover:bg-brand-primary/90 shadow-sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Visa
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Adult Price
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    ₹{Number(visaData.adultPrice)?.toLocaleString('en-IN')}
                  </p>
                  {visaData.childPrice && (
                    <p className="text-xs text-gray-500 mt-1">
                      Child: ₹
                      {Number(visaData.childPrice)?.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-xl font-semibold text-green-700">
                    {currencySymbol}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Processing Time
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {visaData.processingTimeValue}
                  </p>
                  {visaData.processingTimeQuote && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {visaData.processingTimeQuote}
                    </p>
                  )}
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Stay Period
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {visaData.stayPeriod}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Maximum stay</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Validity
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {visaData.validity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Visa validity</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <Shield className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Globe className="w-5 h-5 text-blue-700" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Country
                      </label>
                      <p className="text-lg font-semibold capitalize">
                        {visaData.country}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Visa Type
                      </label>
                      <p className="text-lg font-semibold">
                        {formatVisaType(visaData.visaType)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Category
                      </label>
                      <Badge className={getCategoryColor(visaData.category)}>
                        {visaData.category.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        E-Visa Available
                      </label>
                      <div className="flex items-center gap-2">
                        {visaData.eVisa === 'true' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {visaData.eVisa === 'true' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Adult Price
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{visaData.adultPrice}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Child Price
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{visaData.childPrice}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Hot Listed
                      </label>
                      <div className="flex items-center gap-2">
                        {visaData.hotListed === 'true' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {visaData.hotListed === 'true' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Occupancy Type
                      </label>
                      <p className="text-lg font-semibold capitalize">
                        {visaData.occupancyType}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Clock className="w-5 h-5 text-indigo-700" />
                  </div>
                  Processing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Processing Time
                      </label>
                      <p className="text-lg font-semibold">
                        {visaData.processingTimeValue}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Processing Quote
                      </label>
                      <p className="text-lg font-semibold">
                        {visaData.processingTimeQuote}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Stay Period
                      </label>
                      <p className="text-lg font-semibold">
                        {visaData.stayPeriod}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Validity
                      </label>
                      <p className="text-lg font-semibold">
                        {visaData.validity}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                  </div>
                  Detailed Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
                    <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                    <TabsTrigger value="important">Important</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="prose max-w-none">
                      <h4 className="font-semibold mb-3">Visa Details</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {visaData.visaDetail ||
                          'No detailed information available.'}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-6">
                    <div className="prose max-w-none">
                      <h4 className="font-semibold mb-3">
                        Document Requirements
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {visaData.visaDocument ||
                          'No document information available.'}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="disclaimer" className="mt-6">
                    <div className="prose max-w-none">
                      <h4 className="font-semibold mb-3">Plan Disclaimer</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {visaData.planDisclaimer ||
                          'No disclaimer information available.'}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="inclusions" className="mt-6">
                    <div className="prose max-w-none">
                      <h4 className="font-semibold mb-3">What's Included</h4>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {visaData.inclusions ||
                          'No inclusion information available.'}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="important" className="mt-6">
                    <div className="prose max-w-none">
                      <h4 className="font-semibold mb-3">
                        Important Information
                      </h4>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {visaData.importantInformation ||
                          'No important information available.'}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Required Documents */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-green-100 rounded-lg p-2">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  Required Documents
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  {requiredDocuments.length} document
                  {requiredDocuments.length !== 1 ? 's' : ''} required
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {requiredDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {requiredDocuments.map(doc => (
                      <div
                        key={doc}
                        className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium capitalize text-gray-800">
                          {doc.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No specific documents required
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-amber-100 rounded-lg p-2">
                    <Search className="w-5 h-5 text-amber-700" />
                  </div>
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Meta Title
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {visaData.metaTitle}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Meta Description
                  </label>
                  <p className="text-sm text-gray-700">
                    {visaData.metaDescription}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Meta Keywords
                  </label>
                  <p className="text-sm text-gray-700">
                    {visaData.metaKeyword}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Meta Robots
                  </label>
                  <Badge variant="outline">{visaData.metaRobots}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <Building className="w-5 h-5 text-slate-700" />
                  </div>
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Created At
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(visaData.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(visaData.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Visa ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {visaData._id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Link href={`/admin/visa/${visaData._id}/edit`}>
                  <Button className="w-full justify-start bg-brand-primary hover:bg-brand-primary/90 shadow-sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Visa
                  </Button>
                </Link>
                <Separator />
                <Button
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Delete Visa
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
