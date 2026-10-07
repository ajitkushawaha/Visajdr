'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ChangePasswordModal from './ChangePasswordModal'
import EditProfileModal from './EditProfileModal'
import ProfileInfoTable from './ProfileInfoTable'
import { useToast } from '@/hooks/use-toast'

export default function ProfileDetailsCard() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getProfileData()
  }, [])

  const handleModal = () => {
    getProfileData()
    setShowEditProfile(!showEditProfile)
  }

  const getProfileData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/admin-profile')
      if (!res.ok) {
        throw new Error('Failed to fetch profile data')
      }
      const data = await res.json()
      setProfileData(data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSave = async (updatedProfile: any) => {
    try {
      const res = await fetch('/api/admin/admin-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const result = await res.json()
      setProfileData(result)
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      handleModal()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      })
      throw error
    }
  }

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Loading profile data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-gray-200 shadow-sm mb-6">
        <CardHeader className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                Profile Management
              </CardTitle>
              <p className="text-sm text-gray-500">
                Manage your admin profile information and account settings
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                🔑 Change Password
              </Button>
              <Button
                onClick={() => setShowEditProfile(true)}
                className="bg-brand-primary hover:bg-brand-dark text-white shadow-sm"
              >
                ✏️ Edit Profile
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <ProfileInfoTable profileData={profileData} />
      {/* Modals */}
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <EditProfileModal
        open={showEditProfile}
        onClose={handleModal}
        profileData={profileData}
        onSave={onSave}
      />
    </>
  )
}
