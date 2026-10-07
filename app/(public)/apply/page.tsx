export const dynamic = 'force-dynamic'

import React, { Suspense } from 'react'
import ApplyPageClient from './ApplyPageClient'

// Import client component; App Router will handle client boundary

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application form...</p>
          </div>
        </div>
      }
    >
      <ApplyPageClient />
    </Suspense>
  )
}
