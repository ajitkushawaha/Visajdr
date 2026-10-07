'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, LogOut, User, Menu, X, Check } from 'lucide-react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface AgentData {
  agentId: string
  personalDetails: {
    fullName: string
    email: string
  }
  status: string
  kycStatus: string
}

interface AgentHeaderProps {
  onMenuClick: () => void
}

export default function AgentHeader({ onMenuClick }: AgentHeaderProps) {
  const { data: session } = useSession()
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)

  useEffect(() => {
    fetchAgentData()
    fetchNotifications()
  }, [])

  const fetchAgentData = async () => {
    try {
      const response = await fetch('/api/agent/profile')
      const data = await response.json()

      if (data.success) {
        setAgentData(data.data)
      }
    } catch (error) {
      console.error('Error fetching agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true)
      const res = await fetch('/api/agent/notifications?limit=10')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (e) {
      console.error('Error fetching notifications:', e)
    } finally {
      setNotifLoading(false)
    }
  }

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/agent/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (e) {
      console.error('Failed to mark notification as read', e)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/agent" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">
                    Agent Portal
                  </h1>
                  <p className="text-xs text-gray-500">Visa4</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchNotifications}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <div className="p-4 text-sm text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        className={`p-3 border-b ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                n.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : n.priority === 'high'
                                    ? 'bg-orange-100 text-orange-700'
                                    : n.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {n.priority?.toUpperCase() || 'MEDIUM'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {!n.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationRead(n._id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {n.message}
                        </p>
                        {n.relatedType === 'visa-application' &&
                          n.relatedId && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/agent/applications/${n.relatedId}`}
                                >
                                  Open
                                </Link>
                              </Button>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Agent Status Badge */}
            {agentData && (
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agentData.status)}`}
                >
                  {agentData.status.charAt(0).toUpperCase() +
                    agentData.status.slice(1)}
                </span>
              </div>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {agentData
                        ? getInitials(agentData.personalDetails.fullName)
                        : 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {agentData?.personalDetails.fullName || 'Loading...'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {agentData?.personalDetails.email || ''}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Agent ID: {agentData?.agentId || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/agent/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/agent/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
