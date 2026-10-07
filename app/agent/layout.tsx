'use client'

import { useState } from 'react'
import AgentHeader from '@/components/layout/AgentHeader'
import { AgentSidebar } from '@/components/layout/AgentSidebar'
import useRoleRedirect from '@/utils/protectedRoute'

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Redirect if not agent role
  const { isRedirecting, isLoading } = useRoleRedirect(['agent'])

  // Show loading spinner while session is loading or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AgentHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="sticky top-0 h-full">
          <AgentSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="min-h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
