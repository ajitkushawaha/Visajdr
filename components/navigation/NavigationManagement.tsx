'use client'

import { useState, useEffect, Fragment } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Menu,
  Link as LinkIcon,
  Home,
  Shield,
  Settings as SettingsIcon,
  User as UserIcon,
  Newspaper,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Globe,
  Smartphone,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface NavigationItem {
  _id: string
  label: string
  href: string
  icon: string
  order: number
  isActive: boolean
  target: '_self' | '_blank'
  hasDropdown: boolean
  dropdownItems?: NavigationItem[]
  children?: NavigationItem[]
  status: 'active' | 'inactive'
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

export default function NavigationManagement() {
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentNavId, setCurrentNavId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [editForm, setEditForm] = useState({
    label: '',
    href: '',
    status: 'active' as 'active' | 'inactive',
    icon: 'filetext',
  })
  const [addForm, setAddForm] = useState({
    label: '',
    href: '',
    status: 'active' as 'active' | 'inactive',
    icon: 'filetext',
  })
  const { toast } = useToast()

  // Load navigations on component mount
  useEffect(() => {
    fetchNavigations()
  }, [])

  const fetchNavigations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/menu')
      if (response.ok) {
        const data = await response.json()
        setNavigations(data.navigations || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch navigation data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch navigation data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (item: NavigationItem) => {
    setEditingItem(item)
    setEditForm({
      label: item.label,
      href: item.href,
      status: item.status,
      icon: item.icon || 'filetext',
    })
    setIsEditModalOpen(true)
  }

  const handleAddOpen = (navId: string) => {
    setCurrentNavId(navId)
    setAddForm({ label: '', href: '', status: 'active', icon: 'filetext' })
    setIsAddModalOpen(true)
  }

  const handleSaveAdd = async () => {
    if (!currentNavId) return

    try {
      const response = await fetch(`/api/admin/menu/${currentNavId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      })

      if (response.ok) {
        const data = await response.json()
        setNavigations(prev =>
          prev.map(nav =>
            nav._id === currentNavId
              ? { ...nav, items: [...nav.items, data.item] }
              : nav
          )
        )
        toast({
          title: 'Success',
          description: 'Navigation item added successfully',
        })
        setIsAddModalOpen(false)
        setCurrentNavId(null)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add navigation item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add navigation item',
        variant: 'destructive',
      })
    }
  }

  // Recursive helper to update item in tree
  const updateItemInTree = (
    items: NavigationItem[],
    targetId: string,
    updates: Partial<NavigationItem>
  ): NavigationItem[] => {
    return items.map(item => {
      if (item._id === targetId) {
        return { ...item, ...updates }
      }

      const newItem = { ...item }
      if (newItem.dropdownItems && newItem.dropdownItems.length > 0) {
        newItem.dropdownItems = updateItemInTree(
          newItem.dropdownItems,
          targetId,
          updates
        )
      }
      if (newItem.children && newItem.children.length > 0) {
        newItem.children = updateItemInTree(newItem.children, targetId, updates)
      }
      return newItem
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/admin/menu/item/${editingItem._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: editForm.label,
          href: editForm.href,
          status: editForm.status,
          icon: editForm.icon,
        }),
      })

      if (response.ok) {
        // Update the local state
        setNavigations(prev =>
          prev.map(nav => ({
            ...nav,
            items: updateItemInTree(nav.items, editingItem._id, {
              label: editForm.label,
              href: editForm.href,
              status: editForm.status,
              icon: editForm.icon,
            }),
          }))
        )

        toast({
          title: 'Success',
          description: 'Navigation item updated successfully',
        })
        setIsEditModalOpen(false)
        setEditingItem(null)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update navigation item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update navigation item',
        variant: 'destructive',
      })
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setEditForm({ label: '', href: '', status: 'active', icon: 'filetext' })
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main':
        return <Menu className="h-4 w-4" />
      case 'footer':
        return <FileText className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'sidebar':
        return <Globe className="h-4 w-4" />
      default:
        return <Menu className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800'
      case 'footer':
        return 'bg-gray-100 text-gray-800'
      case 'mobile':
        return 'bg-green-100 text-green-800'
      case 'sidebar':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Filter navigations based on search and type
  const filteredNavigations = navigations.filter(nav => {
    const matchesType = typeFilter === 'all' || nav.type === typeFilter
    const matchesSearch =
      nav.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nav.items.some(
        item =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.href.toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesType && matchesSearch
  })

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item._id)
    const hasChildren =
      (item.dropdownItems?.length || 0) > 0 || (item.children?.length || 0) > 0

    const AdminIcon = (name?: string) => {
      const key = (name || '').toLowerCase()
      switch (key) {
        case 'home':
          return <Home className="h-4 w-4" />
        case 'settings':
          return <SettingsIcon className="h-4 w-4" />
        case 'shield':
          return <Shield className="h-4 w-4" />
        case 'user':
          return <UserIcon className="h-4 w-4" />
        case 'newspaper':
          return <Newspaper className="h-4 w-4" />
        case 'phone':
          return <Phone className="h-4 w-4" />
        case 'briefcase':
          return <Briefcase className="h-4 w-4" />
        case 'filetext':
          return <FileText className="h-4 w-4" />
        case 'search':
          return <Search className="h-4 w-4" />
        case 'login':
          return <LinkIcon className="h-4 w-4" />
        case 'logout':
          return <LinkIcon className="h-4 w-4" />
        default:
          return <LinkIcon className="h-4 w-4" />
      }
    }

    return (
      <div
        className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item._id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md bg-gray-100">
                {AdminIcon(item.icon)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <LinkIcon className="h-3 w-3" />
                  <span>{item.href}</span>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(item.href, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleEditItem(item)}
                  disabled={!item._id}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {item.dropdownItems?.map((child, index) => (
              <Fragment key={child._id || index}>
                {renderNavigationItem(child, level + 1)}
              </Fragment>
            ))}
            {item.children?.map((child, index) => (
              <Fragment key={child._id || index}>
                {renderNavigationItem(child, level + 1)}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation Lists */}
      <div className="space-y-6">
        {filteredNavigations.map(navigation => (
          <Card key={navigation._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${getTypeColor(navigation.type)}`}
                  >
                    {getTypeIcon(navigation.type)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{navigation.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {navigation.type} Navigation
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {navigation.items.map((item, index) => (
                  <Fragment key={item._id || index}>
                    {renderNavigationItem(item)}
                  </Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Navigation Item</DialogTitle>
            <DialogDescription>
              Update the navigation item details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={editForm.label}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, label: e.target.value }))
                }
                placeholder="Enter label"
              />
            </div>

            <div>
              <Label htmlFor="href">URL</Label>
              <Input
                id="href"
                value={editForm.href}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, href: e.target.value }))
                }
                placeholder="Enter URL"
              />
            </div>

            <div>
              <Label>Icon</Label>
              <Select
                value={editForm.icon}
                onValueChange={value =>
                  setEditForm(prev => ({ ...prev, icon: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="shield">Shield</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="newspaper">Newspaper</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="briefcase">Briefcase</SelectItem>
                  <SelectItem value="filetext">File</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={editForm.status === 'active'}
                onCheckedChange={checked =>
                  setEditForm(prev => ({
                    ...prev,
                    status: checked ? 'active' : 'inactive',
                  }))
                }
              />
              <Label htmlFor="status">
                {editForm.status === 'active' ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Navigation Item</DialogTitle>
            <DialogDescription>
              Add a new item to the navigation menu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-label">Label</Label>
              <Input
                id="add-label"
                value={addForm.label}
                onChange={e =>
                  setAddForm(prev => ({ ...prev, label: e.target.value }))
                }
                placeholder="Enter label"
              />
            </div>

            <div>
              <Label htmlFor="add-href">URL</Label>
              <Input
                id="add-href"
                value={addForm.href}
                onChange={e =>
                  setAddForm(prev => ({ ...prev, href: e.target.value }))
                }
                placeholder="Enter URL"
              />
            </div>

            <div>
              <Label>Icon</Label>
              <Select
                value={addForm.icon}
                onValueChange={value =>
                  setAddForm(prev => ({ ...prev, icon: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="shield">Shield</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="newspaper">Newspaper</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="briefcase">Briefcase</SelectItem>
                  <SelectItem value="filetext">File</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="add-status"
                checked={addForm.status === 'active'}
                onCheckedChange={checked =>
                  setAddForm(prev => ({
                    ...prev,
                    status: checked ? 'active' : 'inactive',
                  }))
                }
              />
              <Label htmlFor="add-status">
                {addForm.status === 'active' ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
