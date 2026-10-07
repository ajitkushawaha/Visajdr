'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DocumentStatusControlProps {
  applicationId: string
  documentType: 'passport' | 'photo'
  currentStatus: string
  currentRejectionReason?: string
  onUpdate: () => void
}

export function DocumentStatusControl({
  applicationId,
  documentType,
  currentStatus,
  currentRejectionReason,
  onUpdate,
}: DocumentStatusControlProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/admin/applications/${applicationId}/documents`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentType,
            status,
            rejectionReason:
              status === 'rejected' ? rejectionReason : undefined,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update document status')
      }

      toast({
        title: 'Success',
        description: `Document ${status} successfully`,
      })

      if (status === 'rejected') {
        setIsRejectDialogOpen(false)
        setRejectionReason('')
      }
      onUpdate()
    } catch (error) {
      console.error('Error updating document status:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Badge
          variant={
            currentStatus === 'approved'
              ? 'default' // Should be success color ideally
              : currentStatus === 'rejected'
                ? 'destructive'
                : 'secondary'
          }
          className={currentStatus === 'approved' ? 'bg-green-600' : ''}
        >
          {currentStatus.toUpperCase()}
        </Badge>
      </div>

      {currentStatus === 'rejected' && currentRejectionReason && (
        <div className="mb-4 p-3 bg-red-50 rounded text-sm text-red-800">
          <strong>Reason:</strong> {currentRejectionReason}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-green-200 hover:bg-green-50 text-green-700"
          onClick={() => handleStatusUpdate('approved')}
          disabled={isLoading || currentStatus === 'approved'}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Approve
        </Button>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-200 hover:bg-red-50 text-red-700"
              disabled={isLoading || currentStatus === 'rejected'}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject {documentType} Document</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <Textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Please specify why this document is being rejected (e.g., blurry, expired, incorrect document)"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={!rejectionReason.trim() || isLoading}
              >
                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
