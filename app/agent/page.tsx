'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useRoleRedirect from '@/utils/protectedRoute'

export default function AgentPage() {
  const router = useRouter()
  
  // Redirect if not agent role
  const { isRedirecting, isLoading } = useRoleRedirect(['agent'])

  useEffect(() => {
    // Only redirect if session is loaded and not redirecting
    if (!isLoading && !isRedirecting) {
      router.push('/agent/dashboard')
    }
  }, [router, isLoading, isRedirecting])

  if (isLoading || isRedirecting) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isLoading ? 'Loading session...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  )
}
