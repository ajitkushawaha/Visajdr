'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  FilePlus,
  Shield,
  User,
  Search,
  Newspaper,
  Home,
  Settings,
  Briefcase,
  Phone,
  FileText,
  LogIn,
  LogOut,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const ICON_MAP: Record<string, any> = {
  Home,
  Shield,
  Settings,
  User,
  Newspaper,
  Phone,
  Briefcase,
  FileText,
  Search,
  LogIn,
  LogOut,
  LayoutDashboard,
  FilePlus,
}

function MobileTabBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [dynamicNavItems, setDynamicNavItems] = useState<any[]>([])

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const navRes = await fetch('/api/public/navigation?type=mobile', {
          cache: 'no-store',
        })
        if (navRes.ok) {
          const navData = await navRes.json()
          if (navData.success && navData.data && navData.data.length > 0) {
            const mobileNav = navData.data[0]
            if (mobileNav && mobileNav.items) {
              setDynamicNavItems(mobileNav.items)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch mobile navigation', error)
      }
    }
    fetchNavigation()
  }, [])

  // Tabs when logged in
  const loggedInTabs = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Track Application', href: '/track', icon: Search },
    { label: 'Travel Insurance', href: '/travel-insurance', icon: Shield },
    { label: 'Contact', href: '/contact-us', icon: User },
  ]

  // Tabs when logged out
  const defaultLoggedOutTabs = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Travel Insurance', href: '/travel-insurance', icon: Shield },
    { label: 'Blog', href: '/blog', icon: Newspaper },
    { label: 'Profile', href: '/auth/login', icon: User },
  ]

  const loggedOutTabs =
    dynamicNavItems.length > 0
      ? dynamicNavItems
          .filter(item => item.label.trim().toLowerCase() !== 'more')
          .map(item => ({
            label: item.label,
            href: item.href,
            icon: ICON_MAP[item.icon] || FileText,
          }))
      : defaultLoggedOutTabs

  const tabs = session ? loggedInTabs : loggedOutTabs

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-t md:hidden flex justify-around py-3 border-t border-gray-200 z-50 rounded-tl-xl rounded-tr-xl">
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center text-xs transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : ''}`}
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileTabBar
