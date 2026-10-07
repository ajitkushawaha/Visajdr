'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  LogIn,
  LogOut,
  Home,
  Shield,
  FileText,
  Search,
  Newspaper,
  Briefcase,
  Phone,
  X,
  Settings,
  Menu,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { DestinationSearch } from '../common/DestinationSearch'

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
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [copyright, setCopyright] = useState(
    '© 2025 Visa4. All rights reserved.'
  )
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [dynamicNavItems, setDynamicNavItems] = useState<any[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check local storage on mount to prevent flashing
    const cachedLogo = localStorage.getItem('companyLogo')
    if (cachedLogo) {
      setCompanyLogo(cachedLogo)
    }

    const fetchCompanyData = async () => {
      try {
        // Fetch copyright
        const settingsRes = await fetch('/api/public/company-settings')
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData.success && settingsData.data?.copyright) {
            setCopyright(settingsData.data.copyright)
          }
        }

        // Fetch logo
        const logoRes = await fetch('/api/public/company-logo')
        if (logoRes.ok) {
          const logoData = await logoRes.json()
          if (logoData.success && logoData.data?.logoUrl) {
            setCompanyLogo(logoData.data.logoUrl)
            localStorage.setItem('companyLogo', logoData.data.logoUrl)
          }
        }

        // Fetch navigation
        const navRes = await fetch('/api/public/navigation?type=main', {
          cache: 'no-store',
        })
        if (navRes.ok) {
          const navData = await navRes.json()
          if (navData.success && navData.data && navData.data.length > 0) {
            // Use the first active main navigation found
            const mainNav = navData.data[0]
            if (mainNav && mainNav.items) {
              setDynamicNavItems(mainNav.items)
            }
          }
        }
      } catch (error) {
        // Keep defaults on error
      }
    }
    fetchCompanyData()
  }, [])

  // Allow other components to trigger opening this drawer
  useEffect(() => {
    const openHandler = () => setOpen(true)
    const closeHandler = () => setOpen(false)
    window.addEventListener('open-navbar-drawer', openHandler)
    window.addEventListener('close-navbar-drawer', closeHandler)
    return () => {
      window.removeEventListener('open-navbar-drawer', openHandler)
      window.removeEventListener('close-navbar-drawer', closeHandler)
    }
  }, [])
  const onClose = () => {
    setOpen(!open)
  }
  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Public navigation items (always visible)
  const defaultPublicLinks = [
    { label: 'Visa', href: '/', icon: Home },
    { label: 'Services', href: '/services', icon: Settings },
    { label: 'Travel Insurance', href: '/travel-insurance', icon: Shield },
    { label: 'About Us', href: '/about-us', icon: User },
  ]

  const publicLinks =
    dynamicNavItems.length > 0
      ? dynamicNavItems
          .filter(item => item.label.trim().toLowerCase() !== 'more')
          .map(item => ({
            label: item.label,
            href: item.href,
            icon: ICON_MAP[item.icon] || FileText, // Default icon if not found
          }))
      : defaultPublicLinks
  // Private navigation items (only for logged-in users)
  const privateLinks = [
    { label: 'Visa', href: '/', icon: FileText },
    { label: 'Dashboard', href: '/dashboard', icon: User },
    { label: 'Track Application', href: '/track', icon: Search },
  ]

  // Add login/logout button to navigation based on user status
  const navigationItems = session?.user
    ? [
        ...privateLinks,
        { label: 'Logout', href: '#', icon: LogOut, isLogout: true } as any,
      ]
    : [...publicLinks, { label: 'Login', href: '/auth/login', icon: LogIn }]

  return (
    <header
      className={`fixed left-0  w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white top-0 shadow-md py-0 pointer-events-auto'
          : 'bg-transparent shadow-none py-0 pointer-events-none'
      }`}
    >
      <div
        className={` mx-0 sm:mx-auto h-20 flex items-center justify-between px-4 md:px-16 w-full lg:w-max-5/6 transition-all duration-300`}
      >
        <Link href={'/'} className="flex items-center pointer-events-auto">
          {companyLogo && (
            <Image
              src={companyLogo}
              alt="Logo"
              width={150}
              height={50}
              className="w-32 sm:w-36 md:w-40 lg:w-[150px] h-auto object-contain"
              priority
            />
          )}
        </Link>

        {/* Desktop Search Bar / Tabs Area */}
        <div
          className={`hidden md:flex flex-1 max-w-xl mx-8 relative transition-all duration-300 pointer-events-auto ${
            isScrolled
              ? 'items-center rounded-full '
              : 'h-full items-center justify-center pb-0'
          }`}
        >
          <div className="w-full animate-in fade-in slide-in-from-top-4 duration-1000">
            <DestinationSearch variant="navbar" className="w-full" />
          </div>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6 pointer-events-auto">
          {session?.user ? (
            <button
              type="button"
              className="flex items-center rounded hover:bg-gray-100 transition"
              onClick={() => onClose()}
            >
              {session.user.image ? (
                <Image
                  src={session?.user.image || ''}
                  alt={session?.user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold">
                  {(
                    session?.user?.name?.trim()?.charAt(0) ||
                    session?.user?.email?.trim()?.charAt(0) ||
                    'U'
                  ).toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-[#1e40af] transition-colors"
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button & User (Visible on Mobile) */}
        <div className="flex items-center gap-4 md:hidden pointer-events-auto">
          <button
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setOpen(prev => !prev)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 pointer-events-auto ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col z-[9999] rounded-tr-2xl rounded-br-2xl pointer-events-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Section - Fixed */}
        <div className="flex-shrink-0">
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {session?.user && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col items-center justify-center space-x-3">
                {session?.user?.image ? (
                  <Image
                    src={session?.user?.image || ''}
                    alt={session?.user?.name || 'User'}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover mb-2"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl font-semibold mb-2">
                    {(
                      session?.user?.name?.trim()?.charAt(0) ||
                      session?.user?.email?.trim()?.charAt(0) ||
                      'U'
                    ).toUpperCase()}
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 min-h-0">
          {navigationItems.map(item => {
            const Icon = item.icon

            // Handle logout button differently
            if (item.isLogout) {
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setOpen(false)
                    router.push('/')
                    signOut()
                    localStorage.removeItem('returnStep')
                    localStorage.removeItem('selectedCountry')
                  }}
                  className="flex items-center tracking-wide text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 capitalize py-3 text-base hover:bg-red-50 rounded-lg px-2 -mx-2 w-full text-left"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-500" />
                  {item.label}
                </button>
              )
            }

            // Regular navigation items
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.label}
                href={`${item.href}`}
                onClick={() => setOpen(false)}
                className={`flex items-center tracking-wide font-medium transition-colors duration-200 capitalize py-3 text-base rounded-lg px-2 -mx-2 ${
                  isActive
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${isActive ? 'text-red-600' : 'text-gray-500'}`}
                />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Footer with Copyright */}
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3">
          <p className="text-xs text-gray-500 text-center">{copyright}</p>
        </div>
      </div>
    </header>
  )
}
