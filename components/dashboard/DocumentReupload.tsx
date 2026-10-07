'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DocumentReuploadProps {
  applicationId: string
  documentType: 'passport' | 'photo'
  rejectionReason: string
  onUploadComplete: () => void
}

export function DocumentReupload({
  applicationId,
  documentType,
  rejectionReason,
  onUploadComplete,
}: DocumentReuploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append(documentType, file)

      const response = await fetch(
        `/api/applications/${applicationId}/upload-documents`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload document')
      }

      toast({
        title: 'Success',
        description:
          'Document uploaded successfully. It will be reviewed shortly.',
      })

      setFile(null)
      onUploadComplete()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg">
      <Alert variant="destructive" className="mb-4 bg-white border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="ml-2">Document Rejected</AlertTitle>
        <AlertDescription className="ml-2 mt-1">
          Your {documentType} was rejected. Reason:{' '}
          <strong>{rejectionReason}</strong>
          <br />
          Please upload a correct version.
        </AlertDescription>
      </Alert>

      <div className="flex gap-4 items-end">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            id={`reupload-${documentType}`}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="bg-white"
          />
        </div>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload New {documentType === 'passport' ? 'Passport' : 'Photo'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
