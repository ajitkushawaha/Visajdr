'use client'
import UserTable from '@/components/admin/UserTable'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

type User = {
  _id: string
  name: string
  email: string
  mobile: string
  designation: string
  role: string
  access: string
  status: {
    isActive: boolean
  }
  createdAt: string
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [userStatus, setUserStatus] = useState<string>('')
  const { toast } = useToast()
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data?.users)
      })
      .catch(error => {
        console.error(error)
        toast({
          title: '❌ Error',
          description: 'Failed to fetch users. Please try again.',
          variant: 'destructive',
          duration: 4000,
        })
      })
  }
  const handleStatusToggle = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const data = await res.json()

      // Update nested status locally
      setUsers(
        prevUsers =>
          prevUsers?.map((user: User) =>
            user._id === userId
              ? { ...user, status: { ...user.status, isActive: data.isActive } }
              : user
          ) || []
      )

      // Show success toast
      toast({
        title: '✅ Status Updated',
        description: `User status has been ${data.isActive ? 'activated' : 'deactivated'} successfully`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
        duration: 4000,
      })
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Users: {users?.length || 0}
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        onStatusToggle={handleStatusToggle}
        userStatus={userStatus}
      />
    </div>
  )
}
