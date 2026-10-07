'use client'

export const dynamic = 'force-dynamic'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  CreditCard,
  Shield,
  Plane,
  MapPin,
  User,
  XCircle,
  Filter,
  ArrowRight,
  DraftingCompass,
  Phone,
  MailCheck,
  Plus,
  Users,
  ChevronLeft,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReceipt } from '@/hooks/useReceipt'
import { toast } from 'sonner'
import Mail from 'nodemailer/lib/mailer'
import { AddTravelerModal } from '@/components/dashboard/AddTravelerModal'
import { EditProfileModal } from '@/components/dashboard/EditProfileModal'
import { DocumentReupload } from '@/components/dashboard/DocumentReupload'

interface VisaApplication {
  _id: string
  trackingId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
  }
  visaDetails: {
    country: string
    visaType: string
  }
  status:
    | 'draft'
    | 'Pending'
    | 'Submitted'
    | 'abandoned'
    | 'submitted'
    | 'pending'
    | 'under_review'
    | 'assigned_to_agent'
    | 'in_embassy'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  totalAmount: number
  createdAt: string
  updatedAt: string
  agentId?: {
    _id: string
    agentId: string
    personalDetails: {
      fullName: string
      email: string
    }
  }
  rejectionReason?: string
  documents?: {
    passport?: {
      status?: string
      rejectionReason?: string
    }
    photo?: {
      status?: string
      rejectionReason?: string
    }
    embassyApprovalDocument?: {
      url: string
      originalName: string
    }
  }
}

interface TravelInsuranceApplication {
  _id: string
  trackingId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
  }
  tripDetails: {
    destination: string
    purpose: string
    startDate: string
    endDate: string
  }
  selectedPlan: {
    planType: string
    totalPremium: number
  }
  status: string
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalApplications: number
  visaApplications: number
  insuranceApplications: number
  inProgress: number
  approved: number
  totalSpent: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'submitted':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'under_review':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'assigned_to_agent':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'in_embassy':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'approved':
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return <FileText className="h-4 w-4" />
    case 'submitted':
      return <FileText className="h-4 w-4" />
    case 'pending':
      return <Clock className="h-4 w-4" />
    case 'under_review':
      return <AlertCircle className="h-4 w-4" />
    case 'assigned_to_agent':
      return <User className="h-4 w-4" />
    case 'in_embassy':
      return <MapPin className="h-4 w-4" />
    case 'approved':
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'rejected':
    case 'cancelled':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getCountryFlag = (country: string) => {
  const flags: { [key: string]: string } = {
    USA: '🇺🇸',
    UK: '🇬🇧',
    Canada: '🇨🇦',
    Australia: '🇦🇺',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Italy: '🇮🇹',
    Spain: '🇪🇸',
    Netherlands: '🇳🇱',
    Switzerland: '🇨🇭',
    Japan: '🇯🇵',
    Singapore: '🇸🇬',
    Thailand: '🇹🇭',
    Malaysia: '🇲🇾',
    Dubai: '🇦🇪',
    Qatar: '🇶🇦',
    'Saudi Arabia': '🇸🇦',
    India: '🇮🇳',
  }
  return flags[country] || '🌍'
}

const getProgressPercentage = (status: string) => {
  switch (status) {
    case 'submitted':
      return 20
    case 'pending':
      return 30
    case 'under_review':
      return 40
    case 'assigned_to_agent':
      return 50
    case 'in_embassy':
      return 70
    case 'approved':
      return 100
    case 'rejected':
      return 0
    case 'completed':
      return 100
    case 'cancelled':
      return 0
    default:
      return 0
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  // Round to nearest integer to avoid decimal places
  const roundedAmount = Math.round(amount)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedAmount)
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Completely disable back button and mobile swipe back after payment completion
  useEffect(() => {
    if (typeof window === 'undefined') return

    const paymentComplete = sessionStorage.getItem('paymentComplete') === 'true'
    const paymentJustCompleted =
      sessionStorage.getItem('paymentJustCompleted') === 'true'

    if (paymentComplete || paymentJustCompleted) {
      // Clear the flag
      if (paymentJustCompleted) {
        sessionStorage.removeItem('paymentJustCompleted')
        toast.success('Payment completed! Your booking has been submitted.', {
          duration: 5000,
        })
      }

      // Completely disable browser back button
      const handlePopState = (event: PopStateEvent) => {
        // Always push dashboard state back
        window.history.pushState(null, '', '/dashboard')
        router.replace('/dashboard')
        // Prevent default behavior
        if (event.preventDefault) {
          event.preventDefault()
        }
        return false
      }

      // Disable mobile swipe back gesture
      let touchStartX = 0
      let touchStartY = 0

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!touchStartX || !touchStartY) return

        const touchEndX = e.touches[0].clientX
        const touchEndY = e.touches[0].clientY
        const diffX = touchStartX - touchEndX
        const diffY = touchStartY - touchEndY

        // If horizontal swipe is greater than vertical and swiping from left edge
        if (
          Math.abs(diffX) > Math.abs(diffY) &&
          diffX > 0 &&
          touchStartX < 50
        ) {
          // This is a back swipe gesture - prevent it
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      // Add multiple history entries to create a barrier
      window.history.pushState(null, '', '/dashboard')
      window.history.pushState(null, '', '/dashboard')
      window.history.pushState(null, '', '/dashboard')

      // Add event listeners
      window.addEventListener('popstate', handlePopState, {
        capture: true,
        passive: false,
      })
      window.addEventListener('touchstart', handleTouchStart, { passive: true })
      window.addEventListener('touchmove', handleTouchMove, { passive: false })

      // Intercept router navigation
      const handleRouteChange = () => {
        const currentPath = window.location.pathname
        if (
          currentPath.includes('/payment') ||
          currentPath.includes('/apply')
        ) {
          router.replace('/dashboard')
        }
      }

      // Check path periodically as backup
      const pathCheckInterval = setInterval(() => {
        const currentPath = window.location.pathname
        if (
          currentPath.includes('/payment') ||
          currentPath.includes('/apply')
        ) {
          window.history.pushState(null, '', '/dashboard')
          router.replace('/dashboard')
        }
      }, 100)

      return () => {
        window.removeEventListener('popstate', handlePopState, {
          capture: true,
        } as any)
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
        clearInterval(pathCheckInterval)
      }
    }
  }, [router])

  // Handle authentication and URL protection
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Safely read role from NextAuth session where user may not include 'role' in default type
      const role = (session.user as any)?.role

      // Wrong role
      if (role && role !== 'user') {
        switch (role) {
          case 'admin':
            router.replace('/admin')
            break
          case 'agent':
            router.replace('/agent')
            break
          default:
            router.replace('/auth/login')
        }
        return
      }

      // Correct role
      if (window.location.pathname !== '/dashboard') {
        router.replace('/dashboard')
      }
    }
  }, [status, session, router])

  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    visaApplications: 0,
    insuranceApplications: 0,
    inProgress: 0,
    approved: 0,
    totalSpent: 0,
  })

  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>(
    []
  )
  const [insuranceApplications, setInsuranceApplications] = useState<
    TravelInsuranceApplication[]
  >([])
  const [loading, setLoading] = useState(true)
  // Filters / sorting state
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'amount' | 'country'>(
    'recent'
  )
  const [travelers, setTravelers] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<
    | 'applications'
    | 'transactions'
    | 'tracking'
    | 'personal'
    | 'address'
    | 'travelers'
  >('applications')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true)

  const handleSectionChange = (section: string) => {
    setActiveSection(section as any)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }

  const handleBackToMenu = () => {
    setMobileMenuOpen(true)
  }

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchTravelers = async () => {
    try {
      const travelersRes = await fetch('/api/user/travelers')
      const travelersData = await travelersRes.json()
      if (travelersData.success) {
        setTravelers(travelersData.travelers)
      }
    } catch (error) {
      console.error('Failed to fetch travelers:', error)
    }
  }

  // Receipt download functionality
  const { downloadApplicationReceipt, loading: receiptLoading } = useReceipt()

  // Post-payment UX: show success and guard against back to payment page
  useEffect(() => {
    if (typeof window === 'undefined') return

    const justPaid = sessionStorage.getItem('paymentJustCompleted') === 'true'
    if (justPaid) {
      toast.success(
        '🎉 Payment completed successfully! Your booking has been submitted.',
        {
          duration: 5000,
        }
      )
      sessionStorage.removeItem('paymentJustCompleted')
    }

    // Check URL parameter for payment success
    const url = new URL(globalThis.location.href)
    const paidParam = url.searchParams.get('paid') === '1'
    if (paidParam && !justPaid) {
      toast.success(
        '🎉 Payment completed successfully! Your booking has been submitted.',
        {
          duration: 5000,
        }
      )
    }

    const cameFromPayment =
      document.referrer.includes('/payment') ||
      document.referrer.includes('/callback')
    const paymentDone = sessionStorage.getItem('paymentComplete') === 'true'
    if (!paymentDone && !paidParam && !cameFromPayment) return

    // Seed two forward entries to catch back presses reliably
    globalThis.history.pushState(null, '', globalThis.location.href)
    globalThis.history.pushState(null, '', globalThis.location.href)

    const onPopState = () => {
      // Keep users on the dashboard after payment completion
      router.replace('/dashboard')
      // Re-seed the trap so repeated back presses stay on dashboard
      globalThis.history.pushState(null, '', globalThis.location.href)
    }

    globalThis.addEventListener('popstate', onPopState)
    return () => globalThis.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.email) return

      try {
        setLoading(true)

        // Fetch visa applications
        const visaResponse = await fetch('/api/applications/user', {
          cache: 'no-store',
        })
        const visaData = await visaResponse.json()
        // Fetch travel insurance applications
        const insuranceResponse = await fetch('/api/travel-insurance/user', {
          cache: 'no-store',
        })
        const insuranceData = await insuranceResponse.json()

        await fetchTravelers()
        await fetchUserProfile()

        if (visaResponse.ok && insuranceResponse.ok) {
          const visaApps = visaData.applications || []
          const insuranceApps = insuranceData.applications || []

          setVisaApplications(visaApps)
          setInsuranceApplications(insuranceApps)

          // Calculate stats
          const totalVisa = visaApps.length
          const totalInsurance = insuranceApps.length
          const totalApps = totalVisa + totalInsurance

          const inProgress = [...visaApps, ...insuranceApps].filter(app =>
            ['Pending', 'processing', 'under_review'].includes(app.status)
          ).length

          const approved = [...visaApps, ...insuranceApps].filter(app =>
            ['approved', 'completed'].includes(app.status)
          ).length

          const totalSpent = [...visaApps, ...insuranceApps].reduce(
            (sum, app) => {
              const amount =
                app.totalAmount || app.selectedPlan?.totalPremium || 0
              return sum + amount
            },
            0
          )

          setStats({
            totalApplications: totalApps,
            visaApplications: totalVisa,
            insuranceApplications: totalInsurance,
            inProgress,
            approved,
            totalSpent,
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  // Derived filtered/sorted applications
  const filteredVisaApplications = (visaApplications || [])
    .filter(app => (statusFilter ? app.status === statusFilter : true))
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return (b.totalAmount || 0) - (a.totalAmount || 0)
        case 'country':
          return a.visaDetails.country.localeCompare(b.visaDetails.country)
        case 'recent':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

  const handleNewApplication = () => {
    router.push('/')
  }

  const handleNewInsurance = () => {
    router.push('/travel-insurance')
  }

  const handleTrackApplication = (trackingId: string) => {
    router.push(`/track?trackingId=${trackingId}`)
  }

  const handleResumeApplication = (applicationId: string) => {
    router.push(`/apply?resume=${applicationId}`)
  }

  const handleDownloadReceipt = async (trackingId: string) => {
    try {
      await downloadApplicationReceipt(trackingId)
      toast.success('Receipt downloaded successfully!')
    } catch (error) {
      console.error('Dashboard: Receipt download error:', error)
      toast.error('Failed to download receipt. Please try again.')
    }
  }

  // Show loading while session is loading or data is loading
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-4/5 max-[600px]:w-[90%] py-24 md:py-24 mx-auto space-y-8">
        {/* Top Header: User Profile - OPTIONAL: You might want to remove this if the sidebar has enough info, 
            but keeping it for now as it was a distinct header */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div
            className={`w-full lg:w-1/4 space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit ${mobileMenuOpen ? 'block min-h-screen lg:min-h-0' : 'hidden lg:block'}`}
          >
            <Card className="border-none shadow-sm bg-white overflow-hidden h-full lg:h-auto">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-blue-900 text-white">
                      <AvatarFallback className="bg-blue-900 text-white">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">
                        {session?.user?.name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {session?.user?.email ? 'Email Verified' : 'Add Mobile'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">
                    Dashboard
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('applications')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'applications'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Applications
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('transactions')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'transactions'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Transactions
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('tracking')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'tracking'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mr-2" /> Tracking
                  </Button>

                  <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-3 px-2">
                    Profile Settings
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('personal')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'personal'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" /> Personal Details
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('address')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'address'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mr-2" /> Address Details
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('travelers')}
                    className={`w-full justify-start font-medium ${
                      activeSection === 'travelers'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" /> My Travelers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div
            className={`w-full lg:w-3/4 space-y-6 ${!mobileMenuOpen ? 'block' : 'hidden lg:block'}`}
          >
            <div className="lg:hidden flex items-center gap-4 mb-6 sticky top-20 z-10 bg-white p-4 rounded-lg shadow-sm border">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToMenu}
                className="-ml-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h2 className="font-semibold text-lg capitalize">
                {activeSection}
              </h2>
            </div>
            {activeSection === 'applications' && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-brand-primary">
                        {stats.totalApplications}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Total</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-yellow-600">
                        {stats.inProgress}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        In Progress
                      </span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-green-600">
                        {stats.approved}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        Approved
                      </span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {formatCurrency(stats.totalSpent)}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        Total Spent
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    My Applications
                  </h2>
                  <div className="flex gap-3">
                    <Button onClick={handleNewInsurance} variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      New Insurance
                    </Button>
                    <Button
                      onClick={handleNewApplication}
                      className="bg-brand-primary"
                    >
                      <Plane className="w-4 h-4 mr-2" />
                      New Visa
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex-1 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      className="bg-transparent outline-none text-sm w-full"
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="">Filter by Status (All)</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="h-px md:h-6 w-full md:w-px bg-gray-200" />
                  <div className="flex-1 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <select
                      className="bg-transparent outline-none text-sm w-full"
                      onChange={e => setSortBy(e.target.value as any)}
                    >
                      <option value="recent">Sort by Recent</option>
                      <option value="amount">Sort by Amount</option>
                      <option value="country">Sort by Country</option>
                    </select>
                  </div>
                </div>

                {/* Visa Applications */}
                {filteredVisaApplications.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Plane className="h-4 w-4 md:h-5 md:w-5" />
                      Visa Applications ({filteredVisaApplications.length})
                    </h3>
                    <div className="grid gap-6">
                      {filteredVisaApplications.map(app => {
                        const hasRejection =
                          app.documents?.passport?.status === 'rejected' ||
                          app.documents?.photo?.status === 'rejected'
                        const displayStatus = hasRejection
                          ? 'rejected'
                          : app.status

                        return (
                          <Card key={app._id}>
                            <CardContent className="p-4 md:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl md:text-2xl">
                                    {getCountryFlag(app.visaDetails.country)}
                                  </span>
                                  <div>
                                    <h3 className="font-semibold text-base md:text-lg capitalize">
                                      {app.visaDetails.country}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 capitalize">
                                      {app.visaDetails.visaType} Visa
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500">
                                      ID: {app.trackingId}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {hasRejection && (
                                    <Badge className="bg-red-600 text-white animate-pulse">
                                      Action Required
                                    </Badge>
                                  )}
                                  <Badge className={getStatusColor(app.status)}>
                                    {getStatusIcon(app.status)}
                                    <span className="ml-1 capitalize">
                                      {app.status.replace('_', ' ')}
                                    </span>
                                  </Badge>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {getProgressPercentage(app.status)}%
                                  </span>
                                </div>
                                <Progress
                                  value={getProgressPercentage(app.status)}
                                  className="h-2"
                                />
                              </div>

                              {/* Agent Information */}
                              {app.agentId && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">
                                      Assigned Agent
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-700 mt-1">
                                    {app.agentId.personalDetails?.fullName ||
                                      'N/A'}
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    {app.agentId.agentId}
                                  </p>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {app.rejectionReason && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-800">
                                      Rejection Reason
                                    </span>
                                  </div>
                                  <p className="text-sm text-red-700 mt-1">
                                    {app.rejectionReason}
                                  </p>
                                </div>
                              )}

                              {/* Document Rejection Re-upload */}
                              {app.documents?.passport?.status ===
                                'rejected' && (
                                <DocumentReupload
                                  applicationId={app._id}
                                  documentType="passport"
                                  rejectionReason={
                                    app.documents.passport.rejectionReason ||
                                    'Document rejected'
                                  }
                                  onUploadComplete={() => {
                                    toast.success(
                                      'Passport uploaded successfully'
                                    )
                                    // Optionally refresh dashboard data here
                                    window.location.reload()
                                  }}
                                />
                              )}

                              {app.documents?.photo?.status === 'rejected' && (
                                <DocumentReupload
                                  applicationId={app._id}
                                  documentType="photo"
                                  rejectionReason={
                                    app.documents.photo.rejectionReason ||
                                    'Document rejected'
                                  }
                                  onUploadComplete={() => {
                                    toast.success('Photo uploaded successfully')
                                    window.location.reload()
                                  }}
                                />
                              )}

                              {/* Download Link for Approved Visa */}
                              {app.status === 'approved' &&
                                app.documents?.embassyApprovalDocument && (
                                  <div className="mb-4">
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700"
                                      onClick={() =>
                                        window.open(
                                          app.documents?.embassyApprovalDocument
                                            ?.url,
                                          '_blank'
                                        )
                                      }
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download Visa Document
                                    </Button>
                                  </div>
                                )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-xs md:text-sm text-gray-600">
                                    Submission Date
                                  </p>
                                  <p className="text-sm md:text-base font-medium">
                                    {formatDate(app.createdAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs md:text-sm text-gray-600">
                                    Last Updated
                                  </p>
                                  <p className="text-sm md:text-base font-medium">
                                    {formatDate(app.updatedAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs md:text-sm text-gray-600">
                                    Amount Paid
                                  </p>
                                  <p className="text-sm md:text-base font-medium">
                                    {formatCurrency(app.totalAmount)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Pay Now Button for Pending Applications */}
                                {['draft', 'Pending'].includes(app.status) &&
                                  ['pending', 'failed'].includes(
                                    app.paymentStatus
                                  ) && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleResumeApplication(app._id)
                                      }
                                      className="text-xs md:text-sm bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Pay Now
                                    </Button>
                                  )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleTrackApplication(app.trackingId)
                                  }
                                  className="text-xs md:text-sm"
                                >
                                  <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                  Track Applications
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs md:text-sm"
                                  style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    pointerEvents: 'auto',
                                    cursor: receiptLoading
                                      ? 'not-allowed'
                                      : 'pointer',
                                  }}
                                  onClick={() => {
                                    handleDownloadReceipt(app.trackingId)
                                  }}
                                  disabled={receiptLoading}
                                >
                                  <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                  {receiptLoading
                                    ? 'Downloading...'
                                    : 'Download Receipt'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Travel Insurance Applications */}
                {insuranceApplications.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Shield className="h-4 w-4 md:h-5 md:w-5" />
                      Travel Insurance ({insuranceApplications.length})
                    </h3>
                    <div className="grid gap-6">
                      {insuranceApplications.map(app => (
                        <Card key={app._id}>
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xl md:text-2xl">
                                  {getCountryFlag(app.tripDetails.destination)}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-base md:text-lg">
                                    {app.tripDetails.destination}
                                  </h3>
                                  <p className="text-sm md:text-base text-gray-600 capitalize">
                                    {app.selectedPlan.planType} Insurance
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-500">
                                    ID: {app.trackingId}
                                  </p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(app.status)}>
                                {getStatusIcon(app.status)}
                                <span className="ml-1 capitalize">
                                  {app.status.replace('_', ' ')}
                                </span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs md:text-sm text-gray-600">
                                  Trip Purpose
                                </p>
                                <p className="text-sm md:text-base font-medium capitalize">
                                  {app.tripDetails.purpose}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-600">
                                  Trip Dates
                                </p>
                                <p className="text-sm md:text-base font-medium">
                                  {formatDate(app.tripDetails.startDate)} -{' '}
                                  {formatDate(app.tripDetails.endDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-600">
                                  Premium Paid
                                </p>
                                <p className="text-sm md:text-base font-medium">
                                  {formatCurrency(
                                    app.selectedPlan.totalPremium
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleTrackApplication(app.trackingId)
                                }
                                className="text-xs md:text-sm"
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                Track Policy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs md:text-sm"
                              >
                                <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                Download Policy
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Applications */}
                {visaApplications.length === 0 &&
                  insuranceApplications.length === 0 && (
                    <Card>
                      <CardContent className="p-6 md:p-8 text-center">
                        <FileText className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                          No Applications Yet
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-6">
                          Start your journey by applying for a visa or travel
                          insurance
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={handleNewApplication}
                            size="sm"
                            className="text-xs md:text-sm"
                          >
                            <Plane className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Apply for Visa
                          </Button>
                          <Button
                            onClick={handleNewInsurance}
                            variant="outline"
                            size="sm"
                            className="text-xs md:text-sm"
                          >
                            <Shield className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Get Travel Insurance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}

            {activeSection === 'transactions' && (
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-semibold text-brand-primary">
                  Transaction History
                </h2>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">
                      Recent Transactions
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Your payment history for applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {visaApplications.length === 0 &&
                    insuranceApplications.length === 0 ? (
                      <div className="text-center py-6 md:py-8">
                        <CreditCard className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm md:text-base text-gray-600">
                          No transactions yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...visaApplications, ...insuranceApplications]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .slice(0, 10)
                          .map(app => (
                            <div
                              key={app._id}
                              className="flex items-center justify-between p-3 md:p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm md:text-base font-medium capitalize">
                                    {'visaDetails' in app
                                      ? `${app.visaDetails.country} ${app.visaDetails.visaType} Visa`
                                      : `${app.tripDetails.destination} ${app.selectedPlan.planType} Insurance`}
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-600">
                                    ID: {app.trackingId}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm md:text-base font-semibold">
                                  {formatCurrency(
                                    'totalAmount' in app
                                      ? app.totalAmount
                                      : app.selectedPlan?.totalPremium || 0
                                  )}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600">
                                  {formatDate(app.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'tracking' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  Track Application
                </h2>
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Track</CardTitle>
                      <CardDescription>
                        Enter your application ID to check current status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 max-w-md">
                        <input
                          type="text"
                          placeholder="Enter Tracking ID (e.g. TRK...)"
                          className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-gray-200"
                          id="tracking-input"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById(
                              'tracking-input'
                            ) as HTMLInputElement
                            if (input?.value)
                              handleTrackApplication(input.value)
                          }}
                        >
                          Track
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Recent Applications
                    </h3>
                    {visaApplications.length === 0 &&
                    insuranceApplications.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                          No applications found to track.
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {[...visaApplications, ...insuranceApplications]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .map(app => (
                            <Card
                              key={app._id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-2 rounded-full ${'visaDetails' in app ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}
                                  >
                                    {'visaDetails' in app ? (
                                      <Plane className="w-5 h-5" />
                                    ) : (
                                      <Shield className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {'visaDetails' in app
                                        ? app.visaDetails.country
                                        : app.tripDetails.destination}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      ID: {app.trackingId}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleTrackApplication(app.trackingId)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Track
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'personal' && (
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 border-b">
                  <div className="flex gap-4 items-center">
                    <div className="w-1 h-8 bg-blue-900 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        Personal Details
                      </CardTitle>
                      <CardDescription>
                        Name, Contact, Passport Details, etc.
                      </CardDescription>
                    </div>
                  </div>
                  <EditProfileModal
                    user={userProfile || session?.user}
                    type="personal"
                    onSuccess={fetchUserProfile}
                  />
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.name || session?.user?.name || 'User'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Email
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base break-all">
                        {userProfile?.email || session?.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Mobile
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.mobile || 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Gender
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base capitalize">
                        {userProfile?.gender || 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Nationality
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.nationality || 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Occupation
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.occupation || 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Passport Number
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.passportDetails?.passportNumber || 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Passport Expiry
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.passportDetails?.passportExpiry
                          ? formatDate(
                              userProfile.passportDetails.passportExpiry
                            )
                          : 'NA'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Passport Documents
                      </label>
                      <div className="flex gap-2 mt-1.5">
                        {userProfile?.documents?.passportFront ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium ring-1 ring-inset ring-green-600/20">
                            Front
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                            Front Missing
                          </span>
                        )}
                        {userProfile?.documents?.passportBack ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium ring-1 ring-inset ring-green-600/20">
                            Back
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                            Back Missing
                          </span>
                        )}
                        {userProfile?.documents?.photo ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium ring-1 ring-inset ring-green-600/20">
                            Photo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                            Photo Missing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'address' && (
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 border-b">
                  <div className="flex gap-4 items-center">
                    <div className="w-1 h-8 bg-blue-900 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        Address Details
                      </CardTitle>
                      <CardDescription>
                        Address, State, City & Pincode.
                      </CardDescription>
                    </div>
                  </div>
                  <EditProfileModal
                    user={userProfile || session?.user}
                    type="address"
                    onSuccess={fetchUserProfile}
                  />
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Street Address
                      </label>
                      <p className="font-medium text-gray-900 mt-1.5 text-base">
                        {userProfile?.address?.street || 'NA'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          City
                        </label>
                        <p className="font-medium text-gray-900 mt-1.5 text-base">
                          {userProfile?.address?.city || 'NA'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          State
                        </label>
                        <p className="font-medium text-gray-900 mt-1.5 text-base">
                          {userProfile?.address?.state || 'NA'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Pincode
                        </label>
                        <p className="font-medium text-gray-900 mt-1.5 text-base">
                          {userProfile?.address?.zip || 'NA'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Country
                        </label>
                        <p className="font-medium text-gray-900 mt-1.5 text-base">
                          {userProfile?.address?.country || 'NA'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'travelers' && (
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 border-b">
                  <div className="flex gap-4 items-center">
                    <div className="w-1 h-8 bg-blue-900 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        My Travelers
                      </CardTitle>
                      <CardDescription>
                        Manage saved family and friends for quick booking
                      </CardDescription>
                    </div>
                  </div>
                  <AddTravelerModal onSuccess={fetchTravelers} />
                </CardHeader>
                <CardContent className="p-8">
                  {travelers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 text-lg">
                        No Travelers Saved Yet
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                        Travelers you add or book for will appear here
                        automatically for faster checkouts.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                      {travelers.map((traveler: any) => (
                        <div
                          key={traveler._id}
                          className="p-5 border rounded-xl bg-white hover:shadow-md transition-shadow flex items-start justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">
                                {traveler.personalInfo.firstName}{' '}
                                {traveler.personalInfo.lastName}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {traveler.relation}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-20 text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Nationality
                                </span>
                                {traveler.personalInfo.nationality}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-20 text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Passport
                                </span>
                                ••••{' '}
                                {traveler.personalInfo.passportNumber?.slice(
                                  -4
                                ) || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <AddTravelerModal
                            onSuccess={fetchTravelers}
                            traveler={traveler}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-blue-600 group-hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
