'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export default function FooterMenu() {
  const [navigation, setNavigation] = useState<Navigation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/public/navigation?type=footer')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          setNavigation(data.data[0]) // Get the first footer navigation
        }
      }
    } catch (error) {
      console.error('Error fetching footer navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!navigation || !navigation.items) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
            <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
            <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-white font-semibold mb-4">{navigation.name}</h3>
        <ul className="space-y-2">
          {navigation.items
            .filter(item => item.isActive && item.status === 'active')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((item) => (
              <li key={item._id || item.href}>
                <Link 
                  href={item.href}
                  target={item.target || '_self'}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
