'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon?: string
  order?: number
  isActive?: boolean
  target?: '_self' | '_blank'
  hasDropdown?: boolean
  dropdownItems?: NavigationItem[]
  children?: NavigationItem[]
  status?: 'active' | 'inactive'
  _id?: string
}

interface Navigation {
  _id: string
  name: string
  type: 'main' | 'footer' | 'mobile' | 'sidebar'
  items: NavigationItem[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [navigation, setNavigation] = useState<Navigation | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/public/navigation?type=mobile')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          setNavigation(data.data[0]) // Get the first mobile navigation
        }
      }
    } catch (error) {
      console.error('Error fetching mobile navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <nav className="space-y-2">
              {navigation && navigation.items ? (
                navigation.items
                  .filter(item => item.isActive && item.status === 'active')
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => (
                    <div key={item._id || item.href}>
                      {item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0 ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item._id || item.href)}
                            className="flex items-center justify-between w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <span className="flex items-center space-x-2">
                              {item.icon && <span>{item.icon}</span>}
                              <span>{item.label}</span>
                            </span>
                            {expandedItems.has(item._id || item.href) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {expandedItems.has(item._id || item.href) && (
                            <div className="ml-4 space-y-1">
                              {item.dropdownItems
                                .filter(subItem => subItem.status === 'active')
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((subItem) => (
                                  <Link
                                    key={subItem._id || subItem.href}
                                    href={subItem.href}
                                    target={subItem.target || '_self'}
                                    onClick={onClose}
                                    className="block p-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                  >
                                    {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                                    {subItem.label}
                                  </Link>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          target={item.target || '_self'}
                          onClick={onClose}
                          className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                          {item.icon && <span>{item.icon}</span>}
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))
              ) : (
                <div className="space-y-2">
                  <Link href="/" onClick={onClose} className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                    Home
                  </Link>
                  <Link href="/about" onClick={onClose} className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                    About
                  </Link>
                  <Link href="/services" onClick={onClose} className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                    Services
                  </Link>
                  <Link href="/contact" onClick={onClose} className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                    Contact
                  </Link>
                </div>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
