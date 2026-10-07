import type React from 'react'
import { AdminSidebarEnhanced } from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { adminThemeClasses } from '@/lib/adminTheme'
import { Toaster } from 'sonner'

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic'

export default function AdminLayoutEnhanced({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen text-white">
      {/* Enhanced Sidebar */}
      <AdminSidebarEnhanced />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        style={{ zIndex: 9999 }}
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />
    </div>
  )
}
