"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SelectPurposeRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Get the country parameter from the old URL
    const country = searchParams.get("country")
    
    if (country) {
      // Redirect to the new select-plan page with the same country parameter
      router.replace(`/select-plan?country=${encodeURIComponent(country)}`)
    } else {
      // If no country parameter, redirect to home
      router.replace("/")
    }
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-gray-600">Please wait while we redirect you to the new page.</p>
      </div>
    </div>
  )
}
