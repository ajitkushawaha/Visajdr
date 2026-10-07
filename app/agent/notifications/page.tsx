'use client'

import { useEffect, useState } from 'react'
import useRoleRedirect from '@/utils/protectedRoute'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type NotificationItem = {
  _id: string
  title: string
  message: string
  type: 'application' | 'document' | 'status' | 'reminder' | 'query' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  relatedType?: 'visa-application' | 'query' | 'supplier' | 'other'
  relatedId?: string
}

export default function AgentNotificationsPage() {
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/agent/notifications?limit=50')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (e) {
      console.error('Error fetching notifications:', e)
    } finally {
      setLoading(false)
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

  const priorityBadgeClass = (p: NotificationItem['priority']) =>
    p === 'urgent'
      ? 'bg-red-100 text-red-800'
      : p === 'high'
        ? 'bg-orange-100 text-orange-800'
        : p === 'medium'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'

  if (sessionLoading || isRedirecting || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {sessionLoading
                ? 'Loading session...'
                : isRedirecting
                  ? 'Redirecting...'
                  : 'Loading notifications...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Unread: <span className="font-semibold">{unreadCount}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-6 text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                className={`p-4 ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={priorityBadgeClass(n.priority)}>
                      {n.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {n.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNotificationRead(n._id)}
                      className="h-7 px-3 text-xs"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
                <p className="text-sm font-medium mt-2">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                {n.relatedType === 'visa-application' && n.relatedId && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/agent/applications/${n.relatedId}`}>
                        Open application
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
