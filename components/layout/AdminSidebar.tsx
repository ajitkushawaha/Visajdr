'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { adminThemeClasses } from '@/lib/adminTheme'
import {
  Menu,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Tag,
  UserCheck,
  ImageIcon,
  Image,
  FileEdit,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Briefcase,
  Mail,
  Activity,
  ChevronDown,
  ChevronRight,
  Shield,
  Bell,
  AlertCircle,
  BarChart3,
  CreditCard,
  Globe,
  Database,
  Home,
  Calculator,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics',
  },
  {
    name: 'Visa Booking',
    href: '/admin/applications',
    icon: FileText,
    hasSubmenu: true,
    description: 'Application tracking',
    submenu: [
      {
        name: 'All Applications',
        href: '/admin/applications',
        icon: FileText,
        description: 'View all applications',
      },
      {
        name: 'Abandoned Bookings',
        href: '/admin/accounts/abandoned-bookings',
        icon: AlertCircle,
        description: 'Lead generation - incomplete bookings',
      },
    ],
  },
  {
    name: 'Accounts',
    href: '/admin/accounts',
    icon: BarChart3,
    hasSubmenu: true,
    description: 'Financial management',
    submenu: [
      {
        name: 'Payment History',
        href: '/admin/accounts/payment-history',
        icon: CreditCard,
        description: 'Transaction history',
      },
      // {
      //   name: 'Credit Notes',
      //   href: '/admin/accounts/credit-notes',
      //   icon: FileText,
      //   description: 'Manage refunds',
      // },
      // {
      //   name: 'Online Transactions',
      //   href: '/admin/accounts/online-transactions',
      //   icon: Activity,
      //   description: 'Payment tracking',
      // },
    ],
  },
  {
    name: 'Agent Management',
    href: '/admin/agents',
    icon: Users,
    hasSubmenu: true,
    description: 'Agent management and commissions',
    submenu: [
      {
        name: 'All Agents',
        href: '/admin/agents',
        icon: Users,
        description: 'View and manage agents',
      },
      {
        name: 'Reports & Analytics',
        href: '/admin/agents/reports',
        icon: BarChart3,
        description: 'Commissions, payouts & performance',
      },
      {
        name: 'Agent Notifications',
        href: '/admin/agents/notifications',
        icon: Bell,
        description: 'Email settings for agents',
      },
    ],
  },
  {
    name: 'Visa Services',
    href: '/admin/visa',
    icon: FileText,
    hasSubmenu: true,
    description: 'Visa products and services',
    submenu: [
      {
        name: 'Create Visa',
        href: '/admin/visa',
        icon: FileText,
        description: 'Add new visa service',
      },
      {
        name: 'All Visas',
        href: '/admin/visa/list',
        icon: FileText,
        description: 'View and manage all visas',
      },
      {
        name: 'Queries',
        href: '/admin/visa/query-list',
        icon: HelpCircle,
        description: 'Customer inquiries',
      },
      {
        name: 'Configuration',
        href: '/admin/visa/config',
        icon: Settings,
        description: 'Manage visa configurations',
      },
      {
        name: 'Email Templates',
        href: '/admin/visa/email-templates',
        icon: Mail,
        description: 'Manage email templates',
      },
      {
        name: 'Coupon Management',
        href: '/admin/visa/coupon-list',
        icon: Tag,
        description: 'Manage promotional coupons',
      },
    ],
  },
  {
    name: 'Content Management',
    href: '/admin/content',
    icon: FileText,
    hasSubmenu: true,
    description: 'Content management',
    submenu: [
      {
        name: 'Dashboard',
        href: '/admin/content',
        icon: LayoutDashboard,
        description: 'Overview',
      },
      {
        name: 'Home Page',
        href: '/admin/content/home',
        icon: Home,
        description: 'Home sections',
      },
      {
        name: 'Policies',
        href: '/admin/content/policies',
        icon: Shield,
        description: 'Dynamic policies',
      },
      {
        name: 'FAQs',
        href: '/admin/content/faq',
        icon: HelpCircle,
        description: 'Manage FAQs',
      },
      {
        name: 'Media',
        href: '/admin/content/media',
        icon: Image,
        description: 'Media library',
      },
    ],
  },
  {
    name: 'Page Navigation',
    href: '/admin/page-management',
    icon: FileEdit,
    hasSubmenu: true,
    description: 'Navigation editing',
    submenu: [
      {
        name: 'Page List',
        href: '/admin/page-management',
        icon: FileEdit,
        description: 'Manage pages',
      },
      {
        name: 'Page SEO',
        href: '/admin/page-management/seo',
        icon: Menu,
        description: 'SEO settings',
      },
    ],
  },
  {
    name: 'Query Management',
    href: '/admin/query',
    icon: HelpCircle,
    hasSubmenu: false,
    description: 'Customer inquiries',
  },
  {
    name: 'Blog Management',
    href: '/admin/blog',
    icon: BookOpen,
    hasSubmenu: true,
    description: 'Content publishing',
    submenu: [
      {
        name: 'Blog Categories',
        href: '/admin/blog',
        icon: BookOpen,
        description: 'Manage blog posts',
      },
      {
        name: 'Blog Configuration',
        href: '/admin/blog/config',
        icon: Settings,
        description: 'Configure authors',
      },
    ],
  },
  {
    name: 'Travel Insurance',
    href: '/admin/travel-insurance',
    icon: Shield,
    hasSubmenu: false,
    description: 'Insurance management',
  },
  {
    name: 'Tools',
    href: '/admin/tools/overstay-calculator',
    icon: Calculator,
    hasSubmenu: true,
    description: 'Utility tools',
    submenu: [
      {
        name: 'Overstay Calculator',
        href: '/admin/tools/overstay-calculator',
        icon: Calculator,
        description: 'Configure overstay calculator',
      },
    ],
  },
  {
    name: 'Career Management',
    href: '/admin/career/category-list',
    icon: Briefcase,
    hasSubmenu: true,
    description: 'Job management',
    submenu: [
      {
        name: 'Job Categories',
        href: '/admin/career/category-list',
        icon: Briefcase,
        description: 'Manage job categories',
      },
      {
        name: 'Job List',
        href: '/admin/career/list',
        icon: FileText,
        description: 'Job postings',
      },
      {
        name: 'Applied Job List',
        href: '/admin/career/job',
        icon: UserCheck,
        description: 'Job applications',
      },
    ],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    hasSubmenu: true,
    description: 'System configuration',
    submenu: [
      {
        name: 'Company Settings',
        href: '/admin/settings',
        icon: Globe,
        description: 'General settings',
      },
      {
        name: 'User Management',
        href: '/admin/settings/users',
        icon: Users,
        description: 'Manage users',
      },
      {
        name: 'Payment Gateway',
        href: '/admin/settings/payment-gateway',
        icon: CreditCard,
        description: 'Payment setup',
      },
      {
        name: 'Convenience Fee',
        href: '/admin/settings/convenience-fee',
        icon: Tag,
        description: 'Fee management',
      },
      {
        name: 'Application Status',
        href: '/admin/settings/application-status',
        icon: Activity,
        description: 'Manage application statuses',
      },
    ],
  },
]

export function AdminSidebarEnhanced() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    if (!collapsed) {
      setExpandedItems([]) // Close all expanded items when collapsing
    }
  }

  return (
    <div
      className={cn(
        adminThemeClasses.sidebar.container,
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={adminThemeClasses.sidebar.header}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg font-semibold text-white">Visa4</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-brand-dark p-2"
            onClick={toggleCollapse}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={adminThemeClasses.sidebar.nav}>
        {navigation.map(item => {
          const isActive = pathname === item.href
          const isExpanded = expandedItems.includes(item.name)

          return (
            <div key={item.name}>
              {/* Parent Item */}
              <div
                className={cn(
                  adminThemeClasses.sidebar.item,
                  isActive && adminThemeClasses.sidebar.itemActive,
                  collapsed && 'justify-center px-2'
                )}
                onClick={() => {
                  if (item.hasSubmenu && !collapsed) {
                    toggleExpanded(item.name)
                  }
                }}
                title={collapsed ? item.name : undefined}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 flex-1',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-blue-400'
                        : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  {!collapsed && (
                    <div className="flex-1">
                      <span
                        className={cn(
                          'font-medium transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-slate-200 group-hover:text-white'
                        )}
                      >
                        {item.name}
                      </span>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
                {item.hasSubmenu && !collapsed && (
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Submenu */}
              {item.hasSubmenu && isExpanded && item.submenu && !collapsed && (
                <div className={adminThemeClasses.sidebar.submenu}>
                  {item.submenu.map(sub => {
                    const isSubActive = pathname === sub.href
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 hover:bg-brand-dark',
                          isSubActive
                            ? 'text-blue-400 bg-brand-dark border-r-2 border-blue-500'
                            : 'text-white hover:text-white'
                        )}
                      >
                        {sub.icon && <sub.icon className="h-4 w-4" />}
                        <div className="flex-1">
                          <span className="font-medium">{sub.name}</span>
                          {sub.description && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {sub.description}
                            </p>
                          )}
                        </div>
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
      {!collapsed && (
        <div className="p-4 border-t border-brand-dark">
          <div className="bg-brand-primary rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white">System Status</p>
                <p className="text-xs text-green-400">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
