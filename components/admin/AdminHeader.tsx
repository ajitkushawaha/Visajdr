'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

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

export default function AdminHeader() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const logOut = () => {
    signOut({ callbackUrl: '/auth/admin-login' }) // Redirect after logout
  }
  const handleRoute = () => {
    router.push(`/admin/settings?tab=profile`)
    setShowDropdown(!showDropdown)
  }

  return (
    <header className="bg-white border-b shadow-sm px-6 py-2 flex justify-between items-center relative z-50">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>

      {/* Right Side: Settings + Avatar */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => {
            router.push(`/admin/settings`)
          }}
          variant="ghost"
          size="sm"
          className="text-sm text-gray-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="cursor-pointer"
          >
            <Avatar className="h-9 w-9 rounded-full border">
              <AvatarFallback className="bg-gray-600 text-white text-xs font-medium">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-4 text-sm space-y-2">
              <div className="w-full flex flex-col items-center justify-center text-center  ">
                <Avatar className="h-24 w-24 rounded-full border-2 border-gray-300">
                  <AvatarFallback className="bg-gray-600 text-white text-2xl font-medium">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-gray-800 font-semibold pt-5">
                  {session?.user?.name}
                </div>
                <div className="text-gray-500 text-xs">
                  {session?.user?.email}
                </div>
              </div>

              <hr className="my-2" />
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleRoute}
              >
                View Profile
              </Button>
              <Button
                variant="destructive"
                className="w-full text-sm"
                onClick={logOut}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
