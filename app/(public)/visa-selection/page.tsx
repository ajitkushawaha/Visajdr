'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import VisaSelectionWizard from '@/components/visa/VisaSelectionWizard'

export default function VisaSelectionPage() {
  const searchParams = useSearchParams()
  const country = searchParams.get('country') || ''

  if (!country) {
    return (
      <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8">
        <div className="w-4/5 max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-primary mb-4">
              Country Required
            </h1>
            <p className="text-gray-600">
              Please select a country first to view visa options.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8">
      <div className="w-4/5 max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white">
        <VisaSelectionWizard
          country={country}
          onVisaSelect={visaId => {
            // Handle visa selection
          }}
        />
      </div>
    </div>
  )
}
