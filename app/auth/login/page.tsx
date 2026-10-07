'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Shield,
  Phone,
  Loader2,
} from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import AnimatedLoading from '@/components/ui/animated-loading'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // General State
  const [activeTab, setActiveTab] = useState('user')
  const [redirectUrl, setRedirectUrl] = useState('/')
  const [loginLoading, setLoginLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Company Settings State
  const [companyName, setCompanyName] = useState('Visa4')
  const [companyLogo, setCompanyLogo] = useState('')
  const [companyDescription, setCompanyDescription] = useState(
    'Login to plan your next escape with ease'
  )
  const [copyright, setCopyright] = useState(
    '© 2026 Visa4. All rights reserved.'
  )
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false)

  // Agent Login State
  const [agentStep, setAgentStep] = useState<
    'email' | 'password' | 'register' | 'otp'
  >('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Agent Registration State
  const [agentName, setAgentName] = useState('')
  const [agentMobile, setAgentMobile] = useState('')
  const [agentConfirmPassword, setAgentConfirmPassword] = useState('')
  const [agentOtp, setAgentOtp] = useState('')
  const [agentTermsAccepted, setAgentTermsAccepted] = useState(false)

  // User Login State (Step-based)
  const [step, setStep] = useState<'input' | 'otp' | 'register'>('input')
  const [identifier, setIdentifier] = useState('') // Email or Mobile
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [targetMobile, setTargetMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Video Playback Rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  // Redirect Logic
  useEffect(() => {
    const redirectFromParam = searchParams?.get('returnTo')
    if (redirectFromParam) {
      localStorage.setItem('postLoginRedirect', redirectFromParam)
      setRedirectUrl(redirectFromParam)
    } else {
      const stored = localStorage.getItem('postLoginRedirect') || '/'
      setRedirectUrl(stored)
    }
  }, [searchParams])

  // Fetch Company Settings & Google OAuth Status
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, googleRes] = await Promise.all([
          fetch('/api/public/company-settings'),
          fetch('/api/auth/google-enabled'),
        ])

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.success && data.data) {
            setCompanyName(data.data.companyName || 'Visa4')
            setCompanyLogo(data.data.logoUrl || '')
            setCompanyDescription(
              data.data.description ||
                'Login to plan your next escape with ease'
            )
            setCopyright(
              data.data.copyright || '© 2026 EuroWorld. All rights reserved.'
            )
          }
        }

        if (googleRes.ok) {
          const contentType = googleRes.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const data = await googleRes.json()
            setGoogleOAuthEnabled(!!data.enabled)
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // --- User Flow Handlers ---

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!identifier) {
      setErrors({ identifier: 'Please enter email or mobile number' })
      return
    }

    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()

      if (data.exists) {
        // User exists
        let target = data.mobile

        // Fallback to email if mobile is missing
        if (!target) {
          if (data.email) {
            target = data.email
          } else if (identifier.includes('@')) {
            target = identifier
          }
        }

        if (!target) {
          toast({
            title: 'Account Error',
            description:
              'Your account does not have a valid mobile number or email linked. Please contact support.',
            variant: 'destructive',
          })
          setLoginLoading(false)
          return
        }

        setTargetMobile(target)
        setIsNewUser(false)

        // Send OTP
        await sendOtpToMobile(target, 'login')
      } else {
        // New User
        setIsNewUser(true)
        setStep('register')
        if (identifier.includes('@')) {
          setRegEmail(identifier)
          setRegMobile('') // Clear mobile if email was entered
        } else {
          setRegMobile(identifier) // Use entered identifier as mobile
          setRegEmail('')
        }
        setLoginLoading(false)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
      setLoginLoading(false)
    }
  }

  const sendOtpToMobile = async (
    mobileNum: string,
    type: 'login' | 'registration'
  ) => {
    setOtpLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNum, type }),
      })
      const data = await res.json()

      if (data.success) {
        setStep('otp')
        toast({ title: 'OTP Sent', description: `OTP sent to ${mobileNum}` })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP',
        variant: 'destructive',
      })
    } finally {
      setOtpLoading(false)
      setLoginLoading(false) // Stop login loading if it was running
    }
  }

  const handleRegisterAndSendOtp = async () => {
    setErrors({})
    if (!firstName || !lastName) {
      toast({
        title: 'Error',
        description: 'Please enter your first and last name',
        variant: 'destructive',
      })
      return
    }

    // Validate Mobile
    if (!regMobile) {
      toast({
        title: 'Error',
        description: 'Mobile number is required',
        variant: 'destructive',
      })
      return
    }
    if (!/^\d{10}$/.test(regMobile.replace(/\D/g, ''))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      })
      return
    }

    // Validate Email
    if (!regEmail) {
      toast({
        title: 'Error',
        description: 'Email address is required',
        variant: 'destructive',
      })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    if (!termsAccepted) {
      toast({
        title: 'Error',
        description: 'Please accept the Terms and Conditions',
        variant: 'destructive',
      })
      return
    }

    setLoginLoading(true) // Use login loading for the check

    // Check if the OTHER identifier is already taken
    // If user started with Email (identifier), we need to check if regMobile is taken
    // If user started with Mobile (identifier), we need to check if regEmail is taken
    const fieldToCheck = identifier.includes('@') ? regMobile : regEmail

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fieldToCheck }),
      })
      const data = await res.json()

      if (data.exists) {
        toast({
          title: 'Account Exists',
          description: `An account with this ${identifier.includes('@') ? 'mobile number' : 'email'} already exists. Please login with it.`,
          variant: 'destructive',
        })
        setLoginLoading(false)
        return
      }
    } catch (error) {
      console.error('Validation check failed', error)
      // We might want to let them proceed if check fails? Or block? Safe to block for now.
      toast({
        title: 'Error',
        description: 'Verification failed. Please try again.',
        variant: 'destructive',
      })
      setLoginLoading(false)
      return
    }

    let mobileToSend = regMobile
    // If identifier was email, use regMobile
    if (identifier.includes('@')) {
      mobileToSend = regMobile
    } else {
      // Identifier was mobile, ensure we use the formatted/cleaned version if needed,
      // but here we just use what's in regMobile which is synced with identifier in handleIdentifierSubmit
      // actually in handleIdentifierSubmit: setRegMobile(identifier)
      // so regMobile holds the value.
      mobileToSend = regMobile
    }

    setTargetMobile(mobileToSend)
    await sendOtpToMobile(mobileToSend, 'registration')
  }

  const verifyOTPAndLogin = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }

    setLoginLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        mobile: targetMobile,
        otp,
        isNewUser: isNewUser ? 'true' : 'false',
        name: isNewUser ? `${firstName} ${lastName}` : undefined,
        email: isNewUser ? regEmail : undefined,
        role: 'user',
      })

      if (result?.error) {
        setErrors({ otp: result.error })
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Success', description: 'Logged in successfully' })
        localStorage.removeItem('postLoginRedirect')
        router.replace(redirectUrl)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Login failed',
        variant: 'destructive',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleResendOtp = () => {
    sendOtpToMobile(targetMobile, isNewUser ? 'registration' : 'login')
  }

  // --- Agent Flow Handlers ---

  const handleAgentEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: 'Email is required' })
      return
    }

    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/check-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.exists) {
        if (data.isAgent) {
          setAgentStep('password')
        } else {
          toast({
            title: 'Account Exists',
            description:
              'This email is registered as a regular User. Please use User Login.',
            variant: 'destructive',
          })
        }
      } else {
        setAgentStep('register')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check account',
        variant: 'destructive',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleAgentRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!agentName) {
      setErrors({ agentName: 'Name is required' })
      return
    }
    if (!agentMobile || !/^\d{10}$/.test(agentMobile.replace(/\D/g, ''))) {
      setErrors({ agentMobile: 'Valid 10-digit mobile number is required' })
      return
    }
    if (!password || password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      return
    }
    if (password !== agentConfirmPassword) {
      setErrors({ agentConfirmPassword: 'Passwords do not match' })
      return
    }

    if (!agentTermsAccepted) {
      toast({
        title: 'Error',
        description: 'Please accept the Terms of Service and Privacy Policy',
        variant: 'destructive',
      })
      return
    }

    setOtpLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          type: 'registration', // purpose
        }),
      })
      const data = await res.json()

      if (data.success) {
        setAgentStep('otp')
        toast({ title: 'OTP Sent', description: `OTP sent to ${email}` })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP',
        variant: 'destructive',
      })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleAgentVerifyAndRegister = async () => {
    if (!agentOtp || agentOtp.length !== 6) {
      setErrors({ agentOtp: 'Please enter a valid 6-digit OTP' })
      return
    }

    setOtpLoading(true)
    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          otp: agentOtp,
          type: 'email',
          purpose: 'registration',
        }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        setErrors({ agentOtp: verifyData.error || 'Invalid OTP' })
        setOtpLoading(false)
        return
      }

      // 2. Register Agent
      const registerRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          email,
          password,
          role: 'agent',
          mobile: agentMobile,
        }),
      })
      const registerData = await registerRes.json()

      if (registerRes.ok) {
        toast({
          title: 'Registration Successful',
          description: 'Account created. Please wait for admin approval.',
        })
        // Reset to initial state or switch to password step (but they are inactive)
        setAgentStep('password') // Or maybe back to email?
        // Password step will allow them to TRY to login, which will fail with "Inactive" message, which is correct behavior.
        // But better to reset everything
        setAgentStep('email')
        setEmail('')
        setPassword('')
        setAgentName('')
        setAgentMobile('')
        setAgentConfirmPassword('')
        setAgentOtp('')
      } else {
        toast({
          title: 'Registration Failed',
          description: registerData.message || 'Failed to create account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleAgentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!password) {
      setErrors({ password: 'Password is required' })
      return
    }

    setLoginLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        role: 'agent',
      })

      if (result?.error) {
        toast({
          title: 'Agent Login Failed',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Success', description: 'Agent logged in successfully' })
        router.replace('/agent')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Agent login failed',
        variant: 'destructive',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // --- Google Login ---

  const loginWithGoogle = async () => {
    try {
      await signIn('google', {
        callbackUrl: redirectUrl,
        role: 'user',
      })
    } catch (error) {
      console.error('Google login error:', error)
      toast({
        title: 'Error',
        description: 'Google login failed',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex relative bg-white">
      {/* Left Side - Illustration Area */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative overflow-hidden bg-gray-900">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
          >
            <source src="/login.mp4" type="video/mp4" />
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="absolute top-0 left-0 z-10 p-8">
          <Link href="/" className="inline-block mb-8">
            {companyLogo && (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative min-h-screen lg:min-h-0 bg-white lg:bg-transparent rounded-3xl">
        {/* Agent Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveTab(activeTab === 'user' ? 'agent' : 'user')
              // Reset states when switching
              setStep('input')
              setErrors({})
            }}
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            {activeTab === 'user' ? (
              <>
                <Shield className="w-4 h-4" />
                Agent Login
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                User Login
              </>
            )}
          </Button>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            {/* Mobile Logo */}
            <div className=" flex justify-center mb-4">
              <Link href="/">
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt={companyName}
                    width={180}
                    height={80}
                    className="object-contain h-16 w-auto"
                    priority
                  />
                ) : (
                  <Image
                    src={'/logo.png'}
                    alt={'Visa4'}
                    width={180}
                    height={80}
                    className="object-contain h-16 w-auto"
                    priority
                  />
                )}
              </Link>
            </div>

            <p className="text-gray-500 text-base">
              {activeTab === 'agent'
                ? 'Welcome back, Agent! Please sign in.'
                : companyDescription}
            </p>
          </div>

          <Card className="border-none shadow-none bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-8 px-6 sm:px-8">
              {/* AGENT LOGIN/REGISTER FLOW */}
              {activeTab === 'agent' && (
                <div className="space-y-6">
                  {/* STEP 1: EMAIL INPUT */}
                  {agentStep === 'email' && (
                    <form
                      onSubmit={handleAgentEmailSubmit}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="agent-email">Agent Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="agent-email"
                            placeholder="agent@company.com"
                            type="email"
                            className="pl-10 h-11"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loginLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm">{errors.email}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-lg shadow-blue-500/20"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* STEP 2A: PASSWORD LOGIN (Existing Agent) */}
                  {agentStep === 'password' && (
                    <form onSubmit={handleAgentLogin} className="space-y-5">
                      <div className="text-center pb-2">
                        <h3 className="font-semibold text-gray-900">
                          Welcome Back
                        </h3>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="agent-password">Password</Label>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="agent-password"
                            placeholder="••••••••"
                            type={showPassword ? 'text' : 'password'}
                            className="pl-10 pr-10 h-11"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-lg shadow-blue-500/20"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          'Sign In as Agent'
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAgentStep('email')
                            setPassword('')
                          }}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          Use a different email
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2B: REGISTRATION FORM (New Agent) */}
                  {agentStep === 'register' && (
                    <div className="space-y-5">
                      {/* <div className="text-center pb-2">
                        <h3 className="font-semibold text-gray-900">
                          Agent Registration
                        </h3>
                        <p className="text-sm text-gray-500">
                          Create your agent account
                        </p>
                      </div> */}

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="agent-email-display">Email</Label>
                          <Input
                            id="agent-email-display"
                            value={email}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agent-name">
                            Full Name / Agency Name
                          </Label>
                          <Input
                            id="agent-name"
                            placeholder="Enter name"
                            value={agentName}
                            onChange={e => setAgentName(e.target.value)}
                          />
                          {errors.agentName && (
                            <p className="text-red-500 text-sm">
                              {errors.agentName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agent-mobile">Mobile Number</Label>
                          <Input
                            id="agent-mobile"
                            placeholder="10-digit mobile number"
                            value={agentMobile}
                            onChange={e => setAgentMobile(e.target.value)}
                            maxLength={10}
                          />
                          {errors.agentMobile && (
                            <p className="text-red-500 text-sm">
                              {errors.agentMobile}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create password"
                              className="pr-10"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-sm">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm password"
                              className="pr-10"
                              value={agentConfirmPassword}
                              onChange={e =>
                                setAgentConfirmPassword(e.target.value)
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {errors.agentConfirmPassword && (
                            <p className="text-red-500 text-sm">
                              {errors.agentConfirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agent-terms"
                          checked={agentTermsAccepted}
                          onCheckedChange={checked =>
                            setAgentTermsAccepted(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="agent-terms"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-blue-600 hover:underline"
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            className="text-blue-600 hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>

                      <Button
                        onClick={handleAgentRegister}
                        disabled={otpLoading}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-lg shadow-blue-500/20"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Send OTP to Email'
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAgentStep('email')}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Back to Login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: OTP VERIFICATION */}
                  {agentStep === 'otp' && (
                    <div className="space-y-5">
                      <div className="text-center pb-2">
                        <h3 className="font-semibold text-gray-900">
                          Verify Email
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enter the OTP sent to{' '}
                          <span className="font-medium text-gray-900">
                            {email}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-otp">Enter 6-Digit OTP</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="agent-otp"
                            placeholder="123456"
                            maxLength={6}
                            className="pl-10 text-center text-lg tracking-widest"
                            value={agentOtp}
                            onChange={e => setAgentOtp(e.target.value)}
                          />
                        </div>
                        {errors.agentOtp && (
                          <p className="text-red-500 text-sm">
                            {errors.agentOtp}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={handleAgentVerifyAndRegister}
                        disabled={otpLoading}
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg shadow-lg shadow-green-500/20"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Create Account'
                        )}
                      </Button>

                      <div className="flex justify-between text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setAgentStep('register')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleAgentRegister} // Re-triggers send OTP
                          className="text-blue-600 hover:underline"
                          disabled={otpLoading}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* USER LOGIN FLOW */}
              {activeTab === 'user' && (
                <div className="space-y-6">
                  {/* STEP 1: INPUT IDENTIFIER */}
                  {step === 'input' && (
                    <form
                      onSubmit={handleIdentifierSubmit}
                      className="space-y-5"
                    >
                      <div className="pb-4 ">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="identifier"
                            placeholder="Email or Phone Number"
                            className="pl-10 h-11"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            disabled={loginLoading}
                          />
                        </div>
                        {errors.identifier && (
                          <p className="text-red-500 text-sm">
                            {errors.identifier}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full mt-10 h-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg  shadow-blue-500/20"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* STEP 2: REGISTRATION (If New User) */}
                  {step === 'register' && (
                    <div className="space-y-5">
                      <div className="text-center pb-2">
                        <h3 className="font-semibold text-gray-900">
                          Create Account
                        </h3>
                        <p className="text-sm text-gray-500">
                          We couldn't find an account. Let's create one!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* If user started with email, ask for mobile */}
                      {identifier.includes('@') && (
                        <div className="space-y-2">
                          <Label htmlFor="regMobile">Mobile Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="regMobile"
                              placeholder="9876543210"
                              type="tel"
                              className="pl-10"
                              value={regMobile}
                              onChange={e => setRegMobile(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* If user started with mobile, allow optional email */}
                      {!identifier.includes('@') && (
                        <div className="space-y-2">
                          <Label htmlFor="regEmail">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="regEmail"
                              placeholder="john@example.com"
                              type="email"
                              className="pl-10"
                              value={regEmail}
                              onChange={e => setRegEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={checked =>
                            setTermsAccepted(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-blue-600 hover:underline"
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            className="text-blue-600 hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setStep('input')}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleRegisterAndSendOtp}
                          disabled={otpLoading}
                          className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600"
                        >
                          {otpLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            'Send OTP'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: OTP VERIFICATION */}
                  {step === 'otp' && (
                    <div className="space-y-5">
                      <div className="text-center pb-2">
                        <h3 className="font-semibold text-gray-900">
                          Verify OTP
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enter the OTP sent to{' '}
                          <span className="font-medium text-gray-900">
                            {targetMobile}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="otp"
                            placeholder="123456"
                            maxLength={6}
                            className="pl-10 text-center text-lg tracking-widest"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                          />
                        </div>
                        {errors.otp && (
                          <p className="text-red-500 text-sm">{errors.otp}</p>
                        )}
                      </div>

                      <Button
                        onClick={verifyOTPAndLogin}
                        disabled={loginLoading}
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg shadow-lg shadow-green-500/20"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Login'
                        )}
                      </Button>

                      <div className="flex justify-between text-sm mt-4">
                        <button
                          type="button"
                          onClick={() => setStep('input')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {targetMobile.includes('@')
                            ? 'Change Email'
                            : 'Change Number'}
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-blue-600 hover:underline"
                          disabled={otpLoading}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Google Login - Only show on Input step */}
                  {step === 'input' && googleOAuthEnabled && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => loginWithGoogle()}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm bg-white"
                      >
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          alt="Google"
                          className="w-5 h-5 mr-3"
                        />
                        <span className="text-gray-700 font-medium">
                          Google
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <AnimatedLoading className="h-12 w-12 mx-auto mb-4" />
            <p className="text-gray-600">Loading login page...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
