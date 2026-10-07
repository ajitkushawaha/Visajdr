'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  X,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  User,
  Calendar,
  FileText,
  Copy,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TransactionDetailsModalProps {
  transaction: any
  isOpen: boolean
  onClose: () => void
}

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const { symbol: currencySymbol } = useCurrency()
  const { toast } = useToast()

  if (!transaction) return null

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending',
      },
      processing: {
        color: 'bg-blue-100 text-blue-800',
        icon: RefreshCw,
        label: 'Processing',
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Completed',
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Failed',
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        label: 'Cancelled',
      },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const getGatewayConfig = (gateway: string) => {
    const configs = {
      razorpay: { color: 'bg-blue-100 text-blue-800', label: 'Razorpay' },
      stripe: { color: 'bg-purple-100 text-purple-800', label: 'Stripe' },
      paypal: { color: 'bg-yellow-100 text-yellow-800', label: 'PayPal' },
      upi: { color: 'bg-green-100 text-green-800', label: 'UPI' },
      cashfree: { color: 'bg-indigo-100 text-indigo-800', label: 'Cashfree' },
      card: { color: 'bg-orange-100 text-orange-800', label: 'Card' },
    }
    return configs[gateway as keyof typeof configs] || configs.razorpay
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
      duration: 2000,
    })
  }

  const statusConfig = getStatusConfig(transaction.status)
  const gatewayConfig = getGatewayConfig(transaction.paymentGateway)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-brand-primary" />
              <span>Transaction Details</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Status Header */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className="h-5 w-5" />
                  <CardTitle className="text-lg text-gray-900">
                    Transaction Status: {statusConfig.label}
                  </CardTitle>
                </div>
                <Badge
                  className={`${statusConfig.color} flex items-center gap-1`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Transaction ID
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {transaction.transactionId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          transaction.transactionId,
                          'Transaction ID'
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment ID
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {transaction.paymentId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(transaction.paymentId, 'Payment ID')
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment Gateway
                  </h4>
                  <Badge className={`${gatewayConfig.color} capitalize`}>
                    {gatewayConfig.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-brand-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Customer Name
                  </h4>
                  <p className="text-gray-700">{transaction.customerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Email Address
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700">{transaction.customerEmail}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(transaction.customerEmail, 'Email')
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <span className="text-brand-primary font-semibold text-lg">
                  {currencySymbol}
                </span>
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Service Type
                  </h4>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      transaction.serviceType === 'visa'
                        ? 'border-blue-200 text-blue-800 bg-blue-50'
                        : 'border-green-200 text-green-800 bg-green-50'
                    }`}
                  >
                    {transaction.serviceType === 'visa'
                      ? 'Visa Application'
                      : 'Travel Insurance'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment Method
                  </h4>
                  <Badge className={`${gatewayConfig.color} capitalize`}>
                    {transaction.paymentMethod}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Transaction Amount
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
                {transaction.convenienceFees &&
                  transaction.convenienceFees.total > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Convenience Fees
                      </h4>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatAmount(transaction.convenienceFees.total)}
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-primary" />
                Transaction Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Transaction Created
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {transaction.completedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Transaction Completed
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {transaction.failureReason && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Transaction Failed
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.failureReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gateway Response */}
          {transaction.gatewayResponse && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-primary" />
                  Gateway Response
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(transaction.gatewayResponse, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
