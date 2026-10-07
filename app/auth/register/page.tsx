'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import LottieSpinner from '@/components/ui/lottie-spinner'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Added role field
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [copyright, setCopyright] = useState(
    '© 2025 Visa4. All rights reserved.'
  )

  useEffect(() => {
    const fetchCopyright = async () => {
      try {
        const res = await fetch('/api/public/company-settings')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.copyright) {
            setCopyright(data.data.copyright)
          }
        }
      } catch (error) {
        // Keep default copyright on error
      }
    }
    fetchCopyright()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address')
      return false
    }

    // Strong password check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(form.password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      )
      return false
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions')
      return false
    }

    return true
  }

  const sendOTP = async () => {
    if (!form.email) {
      setError('Please enter your email first')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    setOtpLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.email,
          type: 'email',
          purpose: 'registration',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOtpSent(true)
        setError('')
        setLoading(false) // Stop the main loading when OTP is sent
      } else {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
      }
    } catch (error) {
      setError('Failed to send OTP')
      setLoading(false)
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.email,
          otp,
          type: 'email',
          purpose: 'registration',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOtpVerified(true)
        setError('')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (error) {
      setError('Failed to verify OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // First, send OTP
      await sendOTP()
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
      setLoading(false)
    }
  }

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.email,
          otp,
          type: 'email',
          purpose: 'registration',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOtpVerified(true)
        setError('')

        // Show success toast
        toast({
          title: 'Email Verified Successfully!',
          description: 'Your email has been verified. Creating your account...',
        })

        // Now create the account
        await createAccount()
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (error) {
      setError('Failed to verify OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const createAccount = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      // Show success toast
      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to EuroWorld! Logging you in...',
      })

      // Auto-login after successful registration
      const loginRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginRes?.error) {
        router.push('/auth/login?registration=success')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const loginWithGoogle = async role => {
    try {
      await signIn('google', { callbackUrl: '/', role })
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setError('Google sign-up failed. Please try again.')
    }
  }
  const handleRoleChange = (role: 'user' | 'agent') => {
    setForm({ ...form, role })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EuroWorld</span>
          </Link>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div> */}

        <Card className="shadow-2xl border-0 relative overflow-hidden">
          {/* Loading overlay */}
          {(loading || otpLoading) && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
              <div className="text-center">
                <LottieSpinner size="md" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  {loading
                    ? 'Creating your account...'
                    : 'Sending verification code...'}
                </p>
              </div>
            </div>
          )}

          <Button variant="ghost" className="" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Fill in your details to register
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  form.role === 'user'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                User Account
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('agent')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  form.role === 'agent'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Agent Account
              </button>
            </div>

            <div className="mb-4 text-center">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {form.role === 'user'
                  ? 'Personal Travel Account'
                  : 'Professional Agent Account'}
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={checked => setTermsAccepted(!!checked)}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading || otpLoading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : otpLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* OTP Verification Modal */}
            {otpSent && !otpVerified && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-sm text-gray-600">
                      We've sent a 6-digit code to <strong>{form.email}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="modal-otp">Enter Verification Code</Label>
                      <Input
                        id="modal-otp"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        disabled={otpLoading}
                        className="text-center text-lg tracking-widest mt-1"
                      />
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleOTPVerification}
                        disabled={otpLoading || otp.length !== 6 || loading}
                        className="flex-1"
                      >
                        {otpLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating Account...
                          </span>
                        ) : (
                          'Verify & Create Account'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                          setError('')
                          setLoading(false)
                        }}
                        disabled={otpLoading || loading}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={sendOTP}
                        disabled={otpLoading || loading}
                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                      >
                        {otpLoading
                          ? 'Sending...'
                          : "Didn't receive? Resend OTP"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Google OAuth only for Users */}
            {form.role === 'user' && (
              <div className="w-full flex items-center justify-center py-5">
                <button
                  onClick={() => loginWithGoogle('user')}
                  className="flex items-center px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                  disabled={loading}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  Continue with Google
                </button>
              </div>
            )}

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>{copyright}</p>
        </div>
      </div>
    </div>
  )
}
