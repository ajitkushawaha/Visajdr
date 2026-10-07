'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

interface CreditNote {
  _id: string
  creditNoteNumber: string
  originalTransactionId: string
  customerName: string
  customerEmail: string
  serviceType: 'visa' | 'travel-insurance'
  originalAmount: number
  refundAmount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  createdAt: string
  processedAt?: string
  processedBy?: string
  notes?: string
}

export default function CreditNotes() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null)

  useEffect(() => {
    fetchCreditNotes()
  }, [filterStatus])

  const fetchCreditNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/credit-notes?status=${filterStatus}`
      )
      const data = await response.json()

      if (data.success) {
        setCreditNotes(data.creditNotes || [])
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (noteId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/credit-notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchCreditNotes()
      }
    } catch (error) {
      console.error('Error updating credit note status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      processed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredNotes = creditNotes.filter(
    note =>
      note.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPendingAmount = creditNotes
    .filter(note => note.status === 'pending')
    .reduce((sum, note) => sum + note.refundAmount, 0)

  const totalProcessedAmount = creditNotes
    .filter(note => note.status === 'processed')
    .reduce((sum, note) => sum + note.refundAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
          <p className="text-gray-600 mt-2">
            Manage refunds and credit note processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-primary hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Credit Note
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Refunds
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalPendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {creditNotes.filter(note => note.status === 'pending').length}{' '}
              credit notes
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Processed Refunds
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalProcessedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {creditNotes.filter(note => note.status === 'processed').length}{' '}
              credit notes
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Credit Notes
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {creditNotes.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time credit notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by credit note number, customer name, or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>

              <Button
                onClick={fetchCreditNotes}
                className="bg-brand-primary hover:bg-brand-dark"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Notes Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-primary" />
            Credit Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                <span className="text-gray-600">Loading credit notes...</span>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No credit notes found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'No credit notes have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">
                      Credit Note #
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700">
                      Customer
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700">
                      Service
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Original Amount
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700">
                      Refund Amount
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700">
                      Reason
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700">
                      Created
                    </th>
                    <th className="text-center p-3 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map(note => (
                    <tr
                      key={note._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 font-mono text-sm text-gray-900">
                        {note.creditNoteNumber}
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {note.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {note.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {note.serviceType.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₹{note.originalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-semibold text-red-600">
                        ₹{note.refundAmount.toLocaleString()}
                      </td>
                      <td
                        className="p-3 max-w-xs truncate text-gray-700"
                        title={note.reason}
                      >
                        {note.reason}
                      </td>
                      <td className="p-3">{getStatusBadge(note.status)}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {note.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(note._id, 'approved')
                                }
                                className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(note._id, 'rejected')
                                }
                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {note.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(note._id, 'processed')
                              }
                              className="bg-brand-primary hover:bg-brand-dark"
                            >
                              Process Refund
                            </Button>
                          )}
                        </div>
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
