'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bell,
  Plus,
  Search,
  Filter,
  Send,
  Eye,
  Trash2,
  Loader2,
  Users,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Notification {
  _id: string
  recipient: {
    _id: string
    name: string
    email: string
    role: string
  }
  type:
    | 'application'
    | 'document'
    | 'status'
    | 'reminder'
    | 'query'
    | 'system'
    | 'commission'
    | 'payout'
  title: string
  message: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  emailSent: boolean
  emailSentAt?: string
  createdAt: string
  updatedAt: string
  relatedId?: string
  relatedType?: string
}

interface Agent {
  _id: string
  personalDetails: {
    fullName: string
    email: string
  }
  status: string
  commissionRate: number
  commissionType: string
}

export default function AgentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterRead, setFilterRead] = useState('all')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    recipient: '',
    type: 'application',
    title: '',
    message: '',
    priority: 'medium',
    sendEmail: true,
  })

  useEffect(() => {
    fetchNotifications()
    fetchAgents()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/agents/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch agents',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive',
      })
    }
  }

  const handleCreateNotification = async () => {
    if (!formData.recipient || !formData.title || !formData.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/agents/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification sent successfully',
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchNotifications()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to send notification',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/agents/notifications/${notificationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isRead: true }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification marked as read',
        })
        fetchNotifications()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to mark notification as read',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/agents/notifications/${notificationId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification deleted successfully',
        })
        fetchNotifications()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete notification',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      recipient: '',
      type: 'application',
      title: '',
      message: '',
      priority: 'medium',
      sendEmail: true,
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Users className="h-4 w-4" />
      case 'document':
        return <MessageSquare className="h-4 w-4" />
      case 'status':
        return <CheckCircle className="h-4 w-4" />
      case 'reminder':
        return <Clock className="h-4 w-4" />
      case 'query':
        return <Mail className="h-4 w-4" />
      case 'system':
        return <AlertCircle className="h-4 w-4" />
      case 'commission':
        return <CheckCircle className="h-4 w-4" />
      case 'payout':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-green-100 text-green-800'
      case 'document':
        return 'bg-blue-100 text-blue-800'
      case 'status':
        return 'bg-purple-100 text-purple-800'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800'
      case 'query':
        return 'bg-indigo-100 text-indigo-800'
      case 'system':
        return 'bg-gray-100 text-gray-800'
      case 'commission':
        return 'bg-green-100 text-green-800'
      case 'payout':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agent Notification Management
          </h1>
          <p className="text-gray-600 mt-1">
            Send and manage notifications to agents
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Notifications: {notifications.length}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => !n.isRead).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Email Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.emailSent).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.priority === 'urgent').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900">
              Notification Center
            </CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/admin/agents">
                <Button
                  variant="outline"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Agents
                </Button>
              </Link>
              <Button
                onClick={fetchNotifications}
                variant="outline"
                className="text-gray-700 hover:text-gray-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Notification to Agent</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Select Agent *</Label>
                      <Select
                        value={formData.recipient}
                        onValueChange={value =>
                          setFormData({ ...formData, recipient: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map(agent => (
                            <SelectItem key={agent._id} value={agent._id}>
                              {agent.personalDetails.fullName} (
                              {agent.personalDetails.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Notification Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="application">
                              Application
                            </SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="status">
                              Status Update
                            </SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="query">Query</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="commission">
                              Commission
                            </SelectItem>
                            <SelectItem value="payout">Payout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority *</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter notification title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={e =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Enter notification message"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sendEmail"
                        checked={formData.sendEmail}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            sendEmail: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="sendEmail">Send email notification</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateNotification}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg text-gray-900">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="status">Status Update</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="query">Query</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={fetchNotifications}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-6 border-b border-gray-200 hover:bg-gray-50/50 transition-colors ${
                    !notification.isRead
                      ? 'bg-gray-50 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>To: {notification.recipient.name}</span>
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          <Badge
                            className={getPriorityColor(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                          <span>
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.emailSent && (
                            <span className="flex items-center text-green-600">
                              <Mail className="h-3 w-3 mr-1" />
                              Email sent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {notification.relatedId &&
                        notification.relatedType === 'visa-application' && (
                          <Link
                            href={`/admin/applications/${notification.relatedId}`}
                            title="View Application"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
