'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import {
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  Check,
  X,
  ArrowRight,
  FileText,
  Users,
  CreditCard,
  Globe,
  Shield,
  BarChart3,
  Package,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { adminThemeClasses } from '@/lib/adminTheme'
import { toast } from 'sonner'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'application' | 'document' | 'status' | 'reminder' | 'query' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  relatedId?: string
  relatedType?: string
  metadata?: {
    applicationId?: string
    clientName?: string
    visaType?: string
    country?: string
    [key: string]: any
  }
}

interface AdminSearchItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
  keywords: string[]
}

// Helper function to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || 'U'
  }
  // Get first letter of first name and first letter of last name
  return (
    (parts[0][0]?.toUpperCase() || '') +
    (parts[parts.length - 1][0]?.toUpperCase() || '')
  )
}

export default function AdminHeaderEnhanced() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Admin search items
  const adminSearchItems: AdminSearchItem[] = [
    // Applications & Bookings
    {
      id: 'visa-applications',
      title: 'Visa Applications',
      description: 'Manage visa applications and bookings',
      href: '/admin/applications',
      icon: <FileText className="h-4 w-4" />,
      category: 'Applications',
      keywords: ['visa', 'booking', 'application', 'apply', 'visa booking'],
    },
    {
      id: 'travel-insurance-apps',
      title: 'Travel Insurance Applications',
      description: 'Manage travel insurance applications',
      href: '/admin/travel-insurance',
      icon: <Shield className="h-4 w-4" />,
      category: 'Applications',
      keywords: ['travel insurance', 'insurance', 'travel'],
    },
    {
      id: 'abandoned-bookings',
      title: 'Abandoned Bookings',
      description: 'View incomplete visa bookings',
      href: '/admin/accounts/abandoned-bookings',
      icon: <FileText className="h-4 w-4" />,
      category: 'Applications',
      keywords: ['abandoned', 'incomplete', 'bookings', 'leads'],
    },

    // User Management
    {
      id: 'agents',
      title: 'Agents',
      description: 'Manage travel agents',
      href: '/admin/agents',
      icon: <Users className="h-4 w-4" />,
      category: 'Users',
      keywords: ['agent', 'agents', 'user', 'staff'],
    },
    {
      id: 'accounts',
      title: 'User Accounts',
      description: 'Manage user accounts',
      href: '/admin/accounts',
      icon: <Users className="h-4 w-4" />,
      category: 'Users',
      keywords: ['account', 'accounts', 'user', 'customer'],
    },

    // Content Management
    {
      id: 'visa-management',
      title: 'Visa Management',
      description: 'Manage visa types and countries',
      href: '/admin/visa',
      icon: <Globe className="h-4 w-4" />,
      category: 'Content',
      keywords: ['visa', 'country', 'visa type', 'visa management'],
    },
    {
      id: 'blog-management',
      title: 'Blog Management',
      description: 'Manage blog posts and content',
      href: '/admin/blog',
      icon: <FileText className="h-4 w-4" />,
      category: 'Content',
      keywords: ['blog', 'post', 'article', 'content'],
    },
    {
      id: 'career-management',
      title: 'Career Management',
      description: 'Manage job postings and applications',
      href: '/admin/career',
      icon: <Users className="h-4 w-4" />,
      category: 'Content',
      keywords: ['career', 'job', 'hiring', 'employment'],
    },
    {
      id: 'page-management',
      title: 'Page Management',
      description: 'Manage website pages and navigation',
      href: '/admin/page-management',
      icon: <FileText className="h-4 w-4" />,
      category: 'Content',
      keywords: ['page', 'navigation', 'menu', 'pages'],
    },

    // Settings & Configuration
    {
      id: 'settings',
      title: 'Settings',
      description: 'System settings and configuration',
      href: '/admin/settings',
      icon: <Settings className="h-4 w-4" />,
      category: 'Settings',
      keywords: ['settings', 'config', 'configuration', 'system'],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Admin dashboard overview',
      href: '/admin/dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'Settings',
      keywords: ['dashboard', 'overview', 'stats', 'analytics'],
    },

    // Communication
    {
      id: 'queries',
      title: 'Customer Queries',
      description: 'Manage customer inquiries',
      href: '/admin/query',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'Communication',
      keywords: ['query', 'inquiry', 'contact', 'support', 'customer'],
    },
  ]

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!(session?.user as any)?.id) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/notifications?recipient=${(session?.user as any)?.id}&limit=10`
      )
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        }
      )

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id)

    // Navigate based on notification type
    if (notification.relatedId && notification.relatedType) {
      switch (notification.relatedType) {
        case 'visa-application':
          router.push(`/admin/applications/${notification.relatedId}`)
          break
        case 'query':
          router.push(`/admin/query/${notification.relatedId}`)
          break
        default:
          break
      }
    }

    setShowNotifications(false)
  }

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-blue-500'
      case 'low':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications on component mount and when notifications dropdown opens
  useEffect(() => {
    fetchNotifications()
  }, [showNotifications, (session?.user as any)?.id])

  const logOut = () => {
    signOut({ callbackUrl: '/auth/admin-login' })
  }

  const handleRoute = () => {
    router.push(`/admin/settings?tab=profile`)
    setShowDropdown(false)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Handle search navigation
  const handleSearchSelect = (item: AdminSearchItem) => {
    router.push(item.href)
    setShowSearch(false)
    toast.success(`Navigating to ${item.title}`)
  }

  return (
    <header className={adminThemeClasses.header.container}>
      {/* Left Side: Search */}
      <div className="flex items-center space-x-4 flex-1">
        <Popover open={showSearch} onOpenChange={setShowSearch}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-80 justify-start text-left font-normal text-slate-500"
            >
              <Search className="mr-2 h-4 w-4" />
              Search admin panel...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search for pages, features..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {[
                  'Applications',
                  'Users',
                  'Content',
                  'Settings',
                  'Communication',
                ].map(category => (
                  <CommandGroup key={category} heading={category}>
                    {adminSearchItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.description} ${item.keywords.join(' ')}`}
                          onSelect={() => handleSearchSelect(item)}
                          className="flex items-center space-x-3 p-3"
                        >
                          <div className="text-slate-500">{item.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">
                              {item.title}
                            </div>
                            <div className="text-sm text-slate-500">
                              {item.description}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right Side: Notifications + Avatar */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notification.isRead
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.isRead
                              ? getPriorityColor(notification.priority)
                              : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2"></div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-400">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                notification.priority === 'urgent'
                                  ? 'border-red-200 text-red-700'
                                  : notification.priority === 'high'
                                    ? 'border-orange-200 text-orange-700'
                                    : notification.priority === 'medium'
                                      ? 'border-blue-200 text-blue-700'
                                      : 'border-gray-200 text-gray-700'
                              }`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-gray-700"
                  onClick={() => router.push('/admin/agents/notifications')}
                >
                  View all notifications
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <Button
          onClick={() => router.push(`/admin/settings`)}
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="cursor-pointer flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Avatar className="h-8 w-8 rounded-full border-2 border-slate-200">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-900">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              {/* User Info */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex flex-col items-center justify-center">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-slate-200">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900">
                      {session?.user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100"
                  onClick={handleRoute}
                >
                  <User className="w-4 h-4 mr-3" />
                  View Profile
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => router.push('/admin/settings')}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>

                <hr className="my-2" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
                  onClick={logOut}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
