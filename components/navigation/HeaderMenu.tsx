'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

export default function HeaderMenu() {
  const [navigation, setNavigation] = useState<Navigation | null>(null)
  const pathname = usePathname()

  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/public/navigation?type=main')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          setNavigation(data.data[0]) // Get the first main navigation
        }
      }
    } catch (error) {
      console.error('Error fetching navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <nav className="hidden md:flex items-center space-x-8">
        <div className="flex space-x-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </nav>
    )
  }

  if (!navigation || !navigation.items || navigation.items.length === 0) {
    return (
      <nav className="hidden md:flex items-center space-x-8">
        <Link
          href="/"
          className="text-gray-700 hover:text-brand-primary transition-colors"
        >
          Home
        </Link>
        <Link
          href="/about-us"
          className="text-gray-700 hover:text-brand-primary transition-colors"
        >
          About
        </Link>
        <Link
          href="/services"
          className="text-gray-700 hover:text-brand-primary transition-colors"
        >
          Services
        </Link>
        <Link
          href="/blog"
          className="text-gray-700 hover:text-brand-primary transition-colors"
        >
          Blog
        </Link>
        <Link
          href="/contact-us"
          className="text-gray-700 hover:text-brand-primary transition-colors"
        >
          Contact
        </Link>
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navigation.items
        .filter(item => item.isActive && item.status === 'active')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => (
          <div key={item._id || item.href}>
            {item.hasDropdown &&
            item.dropdownItems &&
            item.dropdownItems.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center space-x-1 transition-colors outline-none ${
                    isActiveRoute(item.href)
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-700 hover:text-brand-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.dropdownItems
                    .filter(subItem => subItem.status === 'active')
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(subItem => (
                      <DropdownMenuItem
                        key={subItem._id || subItem.href}
                        asChild
                      >
                        <Link
                          href={subItem.href}
                          target={subItem.target || '_self'}
                          className={`flex items-center space-x-2 ${
                            isActiveRoute(subItem.href)
                              ? 'text-red-600 font-semibold bg-red-50'
                              : ''
                          }`}
                        >
                          <span>{subItem.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href={item.href}
                target={item.target || '_self'}
                className={`flex items-center space-x-1 transition-colors ${
                  isActiveRoute(item.href)
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-700 hover:text-brand-primary'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
    </nav>
  )
}
