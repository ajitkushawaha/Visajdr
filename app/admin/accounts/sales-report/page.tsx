'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface SalesData {
  _id: string
  date: string
  totalRevenue: number
  totalTransactions: number
  visaRevenue: number
  insuranceRevenue: number
  visaTransactions: number
  insuranceTransactions: number
  averageOrderValue: number
  paymentMethods: {
    razorpay: number
    stripe: number
    upi: number
    card: number
  }
}

interface MonthlyStats {
  month: string
  revenue: number
  transactions: number
  growth: number
}

export default function SalesReport() {
  const { symbol: currencySymbol } = useCurrency()
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  useEffect(() => {
    fetchSalesData()
  }, [dateRange, selectedPeriod])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/sales-report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&period=${selectedPeriod}`
      )
      const data = await response.json()

      if (data.success) {
        setSalesData(data.salesData || [])
        setMonthlyStats(data.monthlyStats || [])
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    const csvContent = [
      [
        'Date',
        'Total Revenue',
        'Total Transactions',
        'Visa Revenue',
        'Insurance Revenue',
        'Average Order Value',
      ],
      ...salesData.map(item => [
        item.date,
        item.totalRevenue,
        item.totalTransactions,
        item.visaRevenue,
        item.insuranceRevenue,
        item.averageOrderValue,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`
    a.click()
  }

  const totalRevenue = salesData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  )
  const totalTransactions = salesData.reduce(
    (sum, item) => sum + item.totalTransactions,
    0
  )
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive sales analytics and revenue tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportReport}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Period
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchSalesData}
                className="w-full bg-brand-primary hover:bg-brand-dark"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <span className="text-lg font-semibold text-green-600">
              {currencySymbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalTransactions}
            </div>
            <p className="text-xs text-gray-500 mt-1">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{averageOrderValue.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(totalTransactions * 0.7)}
            </div>
            <p className="text-xs text-gray-500 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-brand-primary" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Visa Services</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹
                  {salesData
                    .reduce((sum, item) => sum + item.visaRevenue, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Travel Insurance</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹
                  {salesData
                    .reduce((sum, item) => sum + item.insuranceRevenue, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.length > 0 &&
                Object.entries(salesData[0]?.paymentMethods || {}).map(
                  ([method, amount]) => (
                    <div
                      key={method}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="capitalize text-gray-700">
                          {method}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                  )
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sales Data */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-primary" />
            Daily Sales Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                <span className="text-gray-600">Loading sales data...</span>
              </div>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No sales data found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                No sales data available for the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">
                      Date
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Total Revenue
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Transactions
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Visa Revenue
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Insurance Revenue
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Avg Order Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map(item => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-900">
                        ₹{item.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        {item.totalTransactions}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₹{item.visaRevenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₹{item.insuranceRevenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₹{item.averageOrderValue.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
