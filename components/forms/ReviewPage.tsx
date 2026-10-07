'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Flame } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface ReviewPageProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    purpose: string
    selectedVisaId: string
    occupation: string
    passportNumber: string
    passportExpiry: string
    startDate: string
    endDate: string
    additionalInfo?: string
  }
  documents: {
    passport?: { name?: string; preview?: string }
    photo?: { name?: string; preview?: string }
    additionalInfo?: string
    additionalDocs?: Record<string, { name?: string; preview?: string }>
  }
  onEdit: (step: number) => void
}

const ReviewPage: React.FC<ReviewPageProps> = ({
  formData,
  documents,
  onEdit,
}) => {
  const [countries, setCountries] = useState<any[]>([])
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const searchParams = useSearchParams()
  const getParam = (key: string) =>
    searchParams ? searchParams.get(key) : null
  const purpose = getParam('purpose') || undefined
  const countrySlug = getParam('country') || undefined
  let [name, countryId] = countrySlug
    ? countrySlug.split('-')
    : [undefined, undefined]

  // Add error handling for documents
  if (!documents) {
    return <div>Loading documents...</div>
  }

  // Helper function to check if blob URL is still valid
  const isValidBlobUrl = (url: string) => {
    try {
      return url.startsWith('blob:') && URL.createObjectURL
    } catch {
      return false
    }
  }

  // Helper function to test if a blob URL is still accessible
  const testBlobUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const fetchedRef = React.useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchVisaData = async () => {
      try {
        const response = await fetch('/api/public/visa')
        if (!response.ok) throw new Error('Failed to fetch visa data')
        const data = await response.json()
        setCountries(data.visas)
      } catch (error) {
        console.error('Error fetching visa data:', error)
      }
    }
    fetchVisaData()
  }, [])
  const filterCountry = countries.find(country => country.id === countryId)
  return (
    <div className="space-y-6">
      {/* Country Info */}
      <h3 className="text-lg font-semibold text-brand-primary mb-4">
        Visa Information
      </h3>

      {filterCountry && (
        <div
          key={filterCountry.id || filterCountry.country}
          className="relative w-full max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white flex flex-col gap-4 "
        >
          {/* Hot Icon */}
          <div className="absolute -top-4 -left-4 bg-white rounded-full shadow-md p-2">
            <Flame className="text-brand-secondary h-6 w-6" />
          </div>

          {/* Title */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {filterCountry.visaType?.toUpperCase()}
            </h3>
            <p className="text-lg font-bold text-brand-primary">
              ₹ {filterCountry.adultPrice.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Processing Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg">
              Get your visa by: <b>{filterCountry.processingTimeValue}</b>
            </span>
            <span className="px-3 py-1 rounded-lg border text-gray-700">
              E-Visa
            </span>
            <span className="px-3 py-1 rounded-lg border text-gray-700">
              Standard
            </span>
          </div>

          {/* Stay & Validity */}
          <div className="flex gap-6 text-sm text-gray-700 mt-2">
            <p className="flex items-center gap-2 max-[600px]:text-[12px]">
              <CheckCircle className="text-green-500 h-5 w-5" />
              Stay Period: {filterCountry.stayPeriod}
            </p>
            <p className="flex items-center gap-2 max-[600px]:text-[12px]">
              <CheckCircle className="text-green-500 h-5 w-5" />
              {`Validity: ${filterCountry.validity}`}
            </p>
          </div>
        </div>
      )}
      {/* Personal Info */}
      <div className="rounded-lg p-6 bg-brand-primary/5 border border-brand-primary/20">
        <h3 className="text-lg font-semibold text-brand-primary mb-4">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>First Name:</strong> {formData.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {formData.lastName}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
          <p>
            <strong>Nationality:</strong> {formData.nationality}
          </p>
          <p>
            <strong>Occupation:</strong> {formData.occupation}
          </p>
          <p>
            <strong>Passport Number:</strong> {formData.passportNumber}
          </p>
          <p>
            <strong>Passport Expiry:</strong>{' '}
            {new Date(formData.passportExpiry).toLocaleDateString()}
          </p>
          {formData.startDate && (
            <p>
              <strong>Travel Date:</strong>{' '}
              {new Date(formData.startDate).toLocaleDateString()}
            </p>
          )}
          {formData.endDate && (
            <p>
              <strong>Return Date:</strong>{' '}
              {new Date(formData.endDate).toLocaleDateString()}
            </p>
          )}
          <p className="capitalize">
            <strong>Purpose:</strong> {purpose || formData.purpose}
          </p>
        </div>
        <div className="mt-3 text-right">
          <Button onClick={() => onEdit(1)} variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-lg p-6 bg-brand-secondary/5 border border-brand-secondary/20">
        <h3 className="text-lg font-semibold text-brand-secondary mb-4">
          Uploaded Documents
        </h3>

        <div className="flex flex-wrap gap-8 items-start">
          {/* Photo */}
          {documents?.photo?.preview &&
          isValidBlobUrl(documents.photo.preview) &&
          !failedImages.has(documents.photo.preview) ? (
            <div className="text-center">
              <img
                src={documents.photo.preview}
                alt="photo preview"
                className="w-28 h-28 object-cover rounded-full border shadow-sm mx-auto"
                onError={e => {
                  const p = documents.photo?.preview
                  setFailedImages(prev => {
                    const next = new Set(prev)
                    if (p) next.add(p)
                    return next
                  })
                  e.currentTarget.style.display = 'none'
                }}
              />
              <p className="text-sm mt-2 text-gray-600">
                {documents.photo.name || 'Unknown file'}
              </p>
              <p className="text-xs text-gray-500">Photo</p>
            </div>
          ) : (
            documents?.photo?.name && (
              <div className="text-center">
                <div className="w-28 h-28 bg-gray-200 rounded-full border shadow-sm mx-auto flex items-center justify-center">
                  <span className="text-gray-500 text-xs">
                    {failedImages.has(documents.photo.preview || '')
                      ? 'Preview Failed'
                      : 'No Preview'}
                  </span>
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  {documents.photo.name || 'Unknown file'}
                </p>
                <p className="text-xs text-gray-500">Photo</p>
              </div>
            )
          )}

          {/* Passport */}
          {documents?.passport?.preview &&
          isValidBlobUrl(documents.passport.preview) &&
          !failedImages.has(documents.passport.preview) ? (
            <div className="text-center">
              <img
                src={documents?.passport?.preview}
                alt="passport preview"
                className="w-40 h-24 object-cover rounded border shadow-sm mx-auto"
                onError={e => {
                  const p = documents.passport?.preview
                  setFailedImages(prev => {
                    const next = new Set(prev)
                    if (p) next.add(p)
                    return next
                  })
                  e.currentTarget.style.display = 'none'
                }}
              />
              <p className="text-sm mt-2 text-gray-600">
                {documents?.passport?.name || 'Unknown file'}
              </p>
              <p className="text-xs text-gray-500">Passport</p>
            </div>
          ) : (
            documents?.passport?.name && (
              <div className="text-center">
                <div className="w-40 h-24 bg-gray-200 rounded border shadow-sm mx-auto flex items-center justify-center">
                  <span className="text-gray-500 text-xs">
                    {failedImages.has(documents.passport.preview || '')
                      ? 'Preview Failed'
                      : 'No Preview'}
                  </span>
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  {documents?.passport?.name || 'Unknown file'}
                </p>
                <p className="text-xs text-gray-500">Passport</p>
              </div>
            )
          )}

          {/* Additional dynamic documents */}
          {documents?.additionalDocs &&
            Object.entries(documents.additionalDocs).map(([key, doc]) =>
              doc?.name ? (
                <div key={key} className="text-center">
                  {doc.preview &&
                  isValidBlobUrl(doc.preview) &&
                  !failedImages.has(doc.preview) ? (
                    <img
                      src={doc.preview}
                      alt={`${key} preview`}
                      className="w-40 h-24 object-cover rounded border shadow-sm mx-auto"
                      onError={e => {
                        setFailedImages(
                          prev => new Set([...prev, doc.preview!])
                        )
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-40 h-24 bg-gray-200 rounded border shadow-sm mx-auto flex items-center justify-center">
                      <span className="text-gray-500 text-xs">
                        {failedImages.has(doc.preview || '')
                          ? 'Preview Failed'
                          : 'No Preview'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm mt-2 text-gray-600">
                    {doc.name || 'Unknown file'}
                  </p>
                  <p className="text-xs text-gray-500">{key}</p>
                </div>
              ) : null
            )}
        </div>

        {documents.additionalInfo && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <strong>Additional Info:</strong>
            </p>
            <p className="text-gray-800">{documents.additionalInfo}</p>
          </div>
        )}

        <div className="mt-3 text-right">
          <Button onClick={() => onEdit(1)} variant="outline" size="sm">
            Edit Documents
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
