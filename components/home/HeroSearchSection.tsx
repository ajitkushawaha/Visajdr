'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  Settings,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { DestinationSearch } from '@/components/common/DestinationSearch'
import Navbar from '../layout/Navbar'

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

function getIcon(name: string): any {
  const key = (name || '').toString().trim().toLowerCase()
  const map: Record<string, any> = {
    home: Home,
    shield: Shield,
    settings: Settings,
    user: User,
    newspaper: Newspaper,
    phone: Phone,
    briefcase: Briefcase,
    filetext: FileText,
    link: FileText,
    search: Search,
    login: LogIn,
    logout: LogOut,
  }
  return map[key] || ICON_MAP[name as keyof typeof ICON_MAP] || FileText
}

function inferIcon(label: string, href: string): any {
  const ll = (label || '').toLowerCase()
  const path = (href || '').toLowerCase()
  if (path === '/' || ll.includes('home') || ll.includes('visa')) return Home
  if (path.includes('/services') || ll.includes('service')) return Settings
  if (path.includes('/travel-insurance') || ll.includes('insurance'))
    return Shield
  if (path.includes('/about') || ll.includes('about')) return User
  if (path.includes('/blog') || ll.includes('blog') || ll.includes('news'))
    return Newspaper
  if (path.includes('/contact') || ll.includes('contact')) return Phone
  if (path.includes('/career') || ll.includes('career') || ll.includes('jobs'))
    return Briefcase
  return FileText
}
export default function HeroSearchSection() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [dynamicNavItems, setDynamicNavItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [heroOpen, setHeroOpen] = useState(false)
  const router = useRouter()
  const navFetchOnce = useRef(false)
  const scrolledRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const SHOW_Y = 200
      const HIDE_Y = 160
      if (!scrolledRef.current && y > SHOW_Y) {
        scrolledRef.current = true
        setIsScrolled(true)
      } else if (scrolledRef.current && y < HIDE_Y) {
        scrolledRef.current = false
        setIsScrolled(false)
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        if (navFetchOnce.current) return
        navFetchOnce.current = true
        const navRes = await fetch('/api/public/navigation?type=main', {
          cache: 'no-store',
        })
        if (navRes.ok) {
          const navData = await navRes.json()
          if (navData.success && navData.data && navData.data.length > 0) {
            const mainNav = navData.data[0]
            if (mainNav && mainNav.items) {
              setDynamicNavItems(mainNav.items)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch navigation', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNavigation()
  }, [])

  useEffect(() => {
    // Check local storage on mount to prevent flashing
    const cachedLogo = localStorage.getItem('companyLogo')
    if (cachedLogo) {
      setCompanyLogo(cachedLogo)
    }

    const fetchLogo = async () => {
      try {
        const logoRes = await fetch('/api/public/company-logo')
        if (logoRes.ok) {
          const logoData = await logoRes.json()
          if (logoData.success && logoData.data?.logoUrl) {
            setCompanyLogo(logoData.data.logoUrl)
            localStorage.setItem('companyLogo', logoData.data.logoUrl)
          }
        }
      } catch {}
    }
    fetchLogo()
  }, [])

  const isActiveRoute = (href: string) => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const defaultPublicLinks = [
    { label: 'Visa', href: '/', icon: Home },
    { label: 'Services', href: '/services', icon: Settings },
    { label: 'Travel Insurance', href: '/travel-insurance', icon: Shield },
    { label: 'About Us', href: '/about-us', icon: User },
  ]
  const publicLinks =
    dynamicNavItems.length > 0
      ? dynamicNavItems.map(item => ({
          label: item.label,
          href: item.href,
          icon:
            !item.icon ||
            item.icon.toLowerCase() === 'filetext' ||
            item.icon.toLowerCase() === 'link'
              ? inferIcon(item.label, item.href)
              : getIcon(item.icon),
        }))
      : defaultPublicLinks
  const privateLinks = [
    { label: 'Visa', href: '/', icon: FileText },
    { label: 'DashbVisaoard', href: '/dashboard', icon: User },
    { label: 'Track Application', href: '/track', icon: Search },
  ]

  const navigationItems = session?.user
    ? [
        ...privateLinks,
        { label: 'Logout', href: '#', icon: LogOut, isLogout: true } as any,
      ]
    : [...publicLinks, { label: 'Login', href: '/auth/login', icon: LogIn }]

  return (
    <div className="w-full px-4 md:px-10">
      {/* Header Tabs - Keep mounted; fade to avoid blink near threshold */}
      <div
        aria-hidden={!isScrolled}
        className={`transition-opacity duration-200 ${isScrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Navbar />
      </div>

      <div
        className={`transition-opacity duration-200 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        <div className="w-full flex items-center justify-between px-2 md:px-0 mb-2">
          <Link href="/" className="flex items-center">
            {companyLogo && (
              <Image
                src={companyLogo}
                alt="Logo"
                width={150}
                height={50}
                className="w-32 md:w-40 h-auto object-contain"
                loading="eager"
              />
            )}
          </Link>
          {session?.user ? (
            session.user?.image ? (
              <button
                type="button"
                className="rounded"
                onClick={() => setHeroOpen(true)}
              >
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  loading="lazy"
                />
              </button>
            ) : (
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold"
                onClick={() => setHeroOpen(true)}
                aria-label="Open user menu"
              >
                {(
                  session.user?.name?.trim()?.charAt(0) ||
                  session.user?.email?.trim()?.charAt(0) ||
                  'U'
                ).toUpperCase()}
              </button>
            )
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-brand-primary transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
      <div className="max-w-2xl pt-26  mx-auto flex flex-col items-center relative">
        <div className="hidden md:flex items-center bg-white rounded-t-xl overflow-hidden shadow-sm border border-b-0 border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
          {isLoading ? (
            <div className="flex items-center">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-3 border-r border-gray-100 last:border-r-0"
                >
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="w-20 h-4 rounded-md" />
                </div>
              ))}
            </div>
          ) : publicLinks.length > 0 ? (
            publicLinks.map(tab => {
              const Icon = tab.icon
              const isActive = isActiveRoute(tab.href)
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`flex z-50 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r border-gray-100 last:border-r-0 ${
                    isActive
                      ? 'bg-gray-50 text-brand-primary'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              )
            })
          ) : (
            <div className="px-4 py-3 text-red-500 text-sm font-medium">
              Navigation Unavailable
            </div>
          )}
        </div>

        <div
          aria-hidden={isScrolled}
          className={`w-[90%] md:w-full pt-24 md:pt-0 transition-opacity duration-300 ${
            isScrolled
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto'
          }`}
        >
          <DestinationSearch variant="navbar" className="w-full" />
        </div>
      </div>
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 pointer-events-auto ${heroOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setHeroOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col z-[9999] rounded-tr-2xl rounded-br-2xl pointer-events-auto ${heroOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-shrink-0">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setHeroOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 min-h-0">
          {navigationItems.map(item => {
            const Icon = item.icon

            if (item.isLogout) {
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setHeroOpen(false)
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

            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.label}
                href={`${item.href}`}
                onClick={() => setHeroOpen(false)}
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

        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Visa4. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
