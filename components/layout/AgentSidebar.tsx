'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  Calendar,
  Shield,
  X,
  Bell,
} from 'lucide-react'

// Rupee icon component
const RupeeIcon = ({ className }: { className?: string }) => (
  <span className={className}>₹</span>
)

const navigation = [
  {
    name: 'Dashboard',
    href: '/agent/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics',
  },
  {
    name: 'Applications',
    href: '/agent/applications',
    icon: FileText,
    hasSubmenu: true,
    description: 'Manage visa applications',
    submenu: [
      { name: 'All Applications', href: '/agent/applications', icon: FileText },
      {
        name: 'Pending Review',
        href: '/agent/applications?status=pending',
        icon: Calendar,
      },
      {
        name: 'Approved',
        href: '/agent/applications?status=approved',
        icon: Shield,
      },
      {
        name: 'Rejected',
        href: '/agent/applications?status=rejected',
        icon: X,
      },
    ],
  },
  {
    name: 'Clients',
    href: '/agent/clients',
    icon: Users,
    description: 'Client management',
  },
  {
    name: 'Commissions',
    href: '/agent/commissions',
    icon: RupeeIcon,
    description: 'Commission tracking',
  },
  {
    name: 'Notifications',
    href: '/agent/notifications',
    icon: Bell,
    description: 'Updates and alerts',
  },
]

interface AgentSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-brand-light text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-blue-900">
            {navigation.map(item => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const isExpanded = expandedItems.includes(item.name)

              return (
                <div key={item.name}>
                  <div
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm hover:bg-brand-dark cursor-pointer transition-colors',
                      isActive && 'bg-brand-dark border-r-2 border-blue-400'
                    )}
                    onClick={() => {
                      if (item.hasSubmenu) {
                        toggleExpanded(item.name)
                      } else {
                        onClose() // Close mobile sidebar when navigating
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 flex-1"
                      onClick={e => {
                        if (item.hasSubmenu) {
                          e.preventDefault()
                        } else {
                          onClose()
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">{item.name}</span>
                        <span className="text-xs text-blue-300 truncate block">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                    {item.hasSubmenu && (
                      <div className="ml-2 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submenu */}
                  {item.hasSubmenu && isExpanded && (
                    <div className="bg-blue-800">
                      {item.submenu?.map(subItem => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 px-8 py-2 text-sm hover:bg-blue-600 transition-colors',
                              isSubActive && 'bg-blue-600'
                            )}
                            onClick={() => onClose()}
                          >
                            <subItem.icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-700">
            <div className="text-xs text-blue-300 text-center">
              <p>Agent Portal v1.0</p>
              <p>Visa4 Travel Services</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
