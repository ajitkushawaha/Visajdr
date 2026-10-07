'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, Shield, Plane } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Visa4')
  const [copyright, setCopyright] = useState(
    '© 2025 Visa4. All rights reserved.'
  )
  const router = useRouter()
  const { toast } = useToast()

  // Fetch company logo and copyright
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Fetch logo
         const logoResponse = await fetch(`/api/public/company-logo?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (logoResponse.ok) {
          const logoData = await logoResponse.json()
          if (logoData.success && logoData.data) {
            setCompanyLogo(logoData.data.logoUrl)
            if (logoData.data.companyName) {
              setCompanyName(logoData.data.companyName)
            }
          }
        }

        // Fetch copyright
        const settingsResponse = await fetch('/api/public/company-settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.success && settingsData.data?.copyright) {
            setCopyright(settingsData.data.copyright)
          }
        }
      } catch (error) {
        // Error fetching company data
      }
    }

    fetchCompanyData()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        role: 'admin', // ✅ force admin login
        redirect: false,
      })

      if (res?.error) {
        // Show specific error messages for admin login
        let errorMessage = 'Admin login failed. Please try again.'

        if (res.error === 'CredentialsSignin') {
          errorMessage =
            'Invalid admin email or password. Please check your credentials and try again.'
        } else if (res.error === 'Configuration') {
          errorMessage =
            "There's a configuration error. Please contact support."
        } else if (res.error === 'AccessDenied') {
          errorMessage =
            "Access denied. This account doesn't have admin permissions."
        } else if (res.error === 'Verification') {
          errorMessage =
            'Account verification required. Please check your email and verify your admin account.'
        } else if (res.error === 'InvalidRole') {
          errorMessage =
            'Invalid account type. This account is not authorized for admin access.'
        }

        toast({
          title: '❌ Admin Login Failed',
          description: errorMessage,
          variant: 'destructive',
        })
      } else if (res?.ok) {
        // Show success message for admin
        toast({
          title: '🎉 Admin Login Successful!',
          description: 'Welcome back! Redirecting to admin dashboard...',
          variant: 'default',
        })

        router.replace('/admin')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      toast({
        title: '❌ Admin Login Error',
        description:
          'An unexpected error occurred. Please try again or contact support.',
        variant: 'destructive',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className=" backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center ">
              <Link
                href="/"
                className="inline-block transition-transform hover:scale-105"
              >
                {companyLogo && (
                  <div className="bg-white w-52 rounded-2xl flex items-center justify-center">
                    <Image
                      src={companyLogo}
                      alt={companyName}
                      width={110}
                      height={60}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                )}
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Admin Login
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to manage the CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    placeholder="Enter admin email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="admin-remember" />
                  <Label htmlFor="admin-remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                {loginLoading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>
            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>{copyright}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
