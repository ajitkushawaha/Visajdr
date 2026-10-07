'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Download,
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface AccountsStats {
  totalRevenue: number
  totalTransactions: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  monthlyGrowth: number
  todayRevenue: number
  averageTransactionValue: number
  abandonedBookings?: number
}

export default function AccountsManagement() {
  const { symbol: currencySymbol } = useCurrency()
  const [stats, setStats] = useState<AccountsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAccountsStats()
  }, [])

  const fetchAccountsStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/accounts-stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch accounts statistics',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching accounts stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts statistics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const accountSections = [
    {
      title: 'Payment History',
      description: 'View and manage all payment records',
      icon: CreditCard,
      href: '/admin/accounts/payment-history',
      color: 'bg-blue-500',
      stats: stats ? formatNumber(stats.totalTransactions) : '0',
    },
    {
      title: 'Abandoned-Bookings',
      description: 'Lead Generation - incomplete bookings',
      icon: BarChart3,
      href: '/admin/accounts/abandoned-bookings',
      color: 'bg-green-500',
      stats: stats ? formatNumber(stats.abandonedBookings || 0) : '0',
    },
    // {
    //   title: "Credit Notes",
    //   description: "Manage refunds and credit notes",
    //   icon: FileText,
    //   href: "/admin/accounts/credit-notes",
    //   color: "bg-orange-500",
    //   stats: "0"
    // },
    // {
    //   title: "Sales Reports",
    //   description: "Generate detailed sales analytics",
    //   icon: BarChart3,
    //   href: "/admin/accounts/sales-report",
    //   color: "bg-purple-500",
    //   stats: stats ? `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%` : "0%"
    // }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Accounts Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor payments, transactions, and financial performance
          </p>
        </div>
        <Button
          onClick={fetchAccountsStats}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <span className="text-green-600 font-semibold text-lg">
              {currencySymbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading
                ? '...'
                : stats
                  ? formatCurrency(stats.totalRevenue)
                  : '₹0'}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {stats && stats.monthlyGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600">
                    +{stats.monthlyGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-600">
                    {stats ? stats.monthlyGrowth.toFixed(1) : 0}%
                  </span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading
                ? '...'
                : stats
                  ? formatNumber(stats.totalTransactions)
                  : '0'}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Users className="h-3 w-3 mr-1" />
              <span>All time transactions</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading
                ? '...'
                : stats
                  ? formatNumber(stats.pendingPayments)
                  : '0'}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Badge variant="secondary" className="text-xs">
                Requires attention
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Revenue
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading
                ? '...'
                : stats
                  ? formatCurrency(stats.todayRevenue)
                  : '₹0'}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Revenue today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {accountSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {section.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">
                  {section.description}
                </p>
                <div className="flex items-center text-sm text-brand-primary font-medium">
                  <span>View Details</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">View All Payments</span>
              </div>
              <span className="text-sm text-gray-600">
                Browse complete payment history
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export Reports</span>
              </div>
              <span className="text-sm text-gray-600">
                Download financial reports
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </div>
              <span className="text-sm text-gray-600">
                View detailed analytics
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
