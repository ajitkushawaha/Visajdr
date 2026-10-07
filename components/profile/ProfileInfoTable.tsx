import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Shield, ExternalLink } from 'lucide-react'

export default function ProfileInfoTable({
  profileData,
}: {
  profileData: any
}) {
  if (!profileData) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No profile data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <table className="w-full">
            <tbody>
              {/* Avatar Row */}
              <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <td className="px-6 py-5 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-primary" />
                    Profile Picture
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-900 w-3/4" colSpan={3}>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm">
                      <AvatarImage
                        src={profileData.avatar || ''}
                        alt={profileData.name || 'Admin'}
                      />
                      <AvatarFallback className="bg-brand-primary text-white text-lg font-semibold">
                        {profileData.name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profileData.name || 'Admin User'}
                      </p>
                      {profileData.avatar && (
                        <a
                          href={profileData.avatar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Image
                        </a>
                      )}
                    </div>
                  </div>
                </td>
              </tr>

              {/* Full Name Row */}
              <tr className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-primary" />
                    Full Name
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium w-1/4">
                  {profileData.name || (
                    <span className="text-gray-400 italic">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-primary" />
                    Email Address
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium w-1/4">
                  {profileData.email ? (
                    <a
                      href={`mailto:${profileData.email}`}
                      className="text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      {profileData.email}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not set</span>
                  )}
                </td>
              </tr>

              {/* Mobile & Role Row */}
              <tr className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors last:border-0">
                <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-primary" />
                    Mobile Number
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium w-1/4">
                  {profileData.mobile ? (
                    <a
                      href={`tel:${profileData.mobile}`}
                      className="text-gray-900 hover:text-brand-primary transition-colors"
                    >
                      {profileData.mobile}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-primary" />
                    Account Role
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium w-1/4">
                  <Badge
                    variant="default"
                    className="bg-brand-primary text-white"
                  >
                    {profileData.role?.toUpperCase() || 'ADMIN'}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
