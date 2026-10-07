import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Agent from '@/models/Agent'
import OTP from '@/models/OTP'
import bcrypt from 'bcryptjs'
import { getGoogleOAuthConfig } from '@/lib/googleOAuthConfig'
import type { NextAuthOptions } from 'next-auth'

// Create dynamic auth options
export async function createAuthOptions(): Promise<NextAuthOptions> {
  const googleConfig = await getGoogleOAuthConfig()

  const providers: any[] = [
    // Credentials Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
        mobile: { label: 'Mobile', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
        isNewUser: { label: 'New User', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        await connectDB()
        const { email, password, role, mobile, otp, isNewUser, name } =
          credentials!

        // OTP Login Flow
        if (mobile && otp) {
          console.log('📱 OTP Login attempt:', {
            identifier: mobile,
            isNewUser,
          })

          const otpRecord = await OTP.findOne({
            identifier: mobile,
            otp: otp,
            isUsed: false,
            expiresAt: { $gt: new Date() },
          })

          if (!otpRecord) {
            console.log('❌ Invalid or expired OTP')
            throw new Error('Invalid or expired OTP')
          }

          // Mark OTP as used
          otpRecord.isUsed = true
          await otpRecord.save()

          // Determine if identifier is email or mobile
          const isEmail = mobile.includes('@')
          const query = isEmail ? { email: mobile } : { mobile: mobile }

          let user = await User.findOne(query)

          if (!user) {
            if (isNewUser === 'true') {
              // Registration
              console.log('📝 Registering new user:', {
                identifier: mobile,
                name,
                email,
              })

              // Check if email is already taken if provided (and different from identifier)
              if (email && email !== mobile) {
                const existingEmail = await User.findOne({ email })
                if (existingEmail) {
                  throw new Error('Email already registered')
                }
              }

              user = await User.create({
                name: name || 'New User',
                email: isEmail
                  ? mobile
                  : email || `${mobile.replace('+', '')}@mobile.temp`, // Use identifier if email, else provided email or temp
                mobile: isEmail ? undefined : mobile, // Use identifier if mobile, else undefined (or provided elsewhere?)
                role: 'user',
                isMobileVerified: !isEmail,
                isEmailVerified: isEmail || !!email,
                status: { isActive: true },
              })
            } else {
              console.log('❌ User not found for identifier:', mobile)
              throw new Error('User not found')
            }
          } else {
            // Existing user
            if (user.role !== 'admin' && !user.status?.isActive) {
              throw new Error('Account inactive')
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar,
          }
        }

        console.log('🔐 Login attempt:', {
          email,
          role,
          passwordLength: password?.length,
        })

        try {
          const user = await User.findOne({ email })
          if (!user) {
            console.log('❌ User not found:', email)
            return null
          }

          console.log('👤 User found:', {
            email: user.email,
            role: user.role,
            hasPassword: !!user.password,
            passwordHash: user.password?.substring(0, 20) + '...',
          })

          if (!user.password) {
            console.log('❌ No password set for user')
            throw new Error('Please use Google login for this account')
          }

          const isValid = await bcrypt.compare(password, user.password)
          console.log('🔑 Password validation:', { isValid })

          if (!isValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('🎭 Role check:', {
            userRole: user.role,
            providedRole: role,
            match: user.role.toLowerCase() === role?.toLowerCase(),
          })

          if (user.role.toLowerCase() !== role?.toLowerCase()) {
            console.log('❌ Role mismatch')
            return null
          }

          // Check user status (skip check for admin)
          if (user.role.toLowerCase() !== 'admin' && !user.status?.isActive) {
            console.log('❌ User account is inactive:', {
              email,
              isActive: user.status?.isActive,
            })
            return null
          }

          if (user.role.toLowerCase() !== 'admin') {
            console.log('✅ User status check passed:', {
              email,
              isActive: user.status?.isActive,
            })
          } else {
            console.log('✅ Admin login - skipping active status check')
          }

          // Check agent status if user is an agent
          if (user.role.toLowerCase() === 'agent') {
            const agent = await Agent.findOne({ userId: user._id })
            if (!agent) {
              console.log('❌ Agent record not found for user:', email)
              return null
            }

            if (
              agent.status === 'inactive' ||
              agent.status === 'disabled' ||
              agent.status === 'suspended'
            ) {
              console.log('❌ Agent account is inactive/disabled/suspended:', {
                email,
                status: agent.status,
              })
              return null
            }

            console.log('✅ Agent status check passed:', {
              email,
              agentStatus: agent.status,
            })
          }

          console.log('✅ Login successful for:', email)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar,
          }
        } catch (error) {
          console.error('❌ Authorize error:', error)
          return null
        }
      },
    }),
  ]

  // Add Google Provider only if configured in database
  if (googleConfig.isConfigured) {
    providers.unshift(
      GoogleProvider({
        clientId: googleConfig.clientId,
        clientSecret: googleConfig.clientSecret,
        allowDangerousEmailAccountLinking: true,
      })
    )
  } else {
    console.warn(
      '⚠️ Google OAuth not configured in database. Please configure Google OAuth settings in Admin Panel.'
    )
  }

  return {
    providers,
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: 'jwt' },
    callbacks: {
      async jwt({ token, user, account }: any) {
        if (account?.provider === 'credentials' && user) {
          token.role = user.role
          token.id = user.id
        }

        if (account?.provider === 'google') {
          console.log('Google OAuth session', token.role)

          if (user) {
            token.role = (user as any).role || 'user'
            token.id = (user as any).id
          }
        }

        return token
      },
      async session({ session, token }: any) {
        if (session.user) {
          ;(session.user as any).role = token.role
          ;(session.user as any).id = token.id
        }
        return session
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
  }
}

// Export a function that returns authOptions for backward compatibility
export async function getAuthOptions(): Promise<NextAuthOptions> {
  return await createAuthOptions()
}

// For backward compatibility, create a synchronous version that can be imported
// This will use default/empty Google OAuth config initially
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        await connectDB()
        const { email, password, role } = credentials!

        console.log('🔐 Login attempt:', {
          email,
          role,
          passwordLength: password?.length,
        })

        try {
          const user = await User.findOne({ email })
          if (!user) {
            console.log('❌ User not found:', email)
            return null
          }

          console.log('👤 User found:', {
            email: user.email,
            role: user.role,
            hasPassword: !!user.password,
            passwordHash: user.password?.substring(0, 20) + '...',
          })

          if (!user.password) {
            console.log('❌ No password set for user')
            throw new Error('Please use Google login for this account')
          }

          const isValid = await bcrypt.compare(password, user.password)
          console.log('🔑 Password validation:', { isValid })

          if (!isValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('🎭 Role check:', {
            userRole: user.role,
            providedRole: role,
            match: user.role.toLowerCase() === role?.toLowerCase(),
          })

          if (user.role.toLowerCase() !== role?.toLowerCase()) {
            console.log('❌ Role mismatch')
            return null
          }

          // Check user status (skip check for admin)
          if (user.role.toLowerCase() !== 'admin' && !user.status?.isActive) {
            console.log('❌ User account is inactive:', {
              email,
              isActive: user.status?.isActive,
            })
            return null
          }

          if (user.role.toLowerCase() !== 'admin') {
            console.log('✅ User status check passed:', {
              email,
              isActive: user.status?.isActive,
            })
          } else {
            console.log('✅ Admin login - skipping active status check')
          }

          // Check agent status if user is an agent
          if (user.role.toLowerCase() === 'agent') {
            const agent = await Agent.findOne({ userId: user._id })
            if (!agent) {
              console.log('❌ Agent record not found for user:', email)
              return null
            }

            if (
              agent.status === 'inactive' ||
              agent.status === 'disabled' ||
              agent.status === 'suspended'
            ) {
              console.log('❌ Agent account is inactive/disabled/suspended:', {
                email,
                status: agent.status,
              })
              return null
            }

            console.log('✅ Agent status check passed:', {
              email,
              agentStatus: agent.status,
            })
          }

          console.log('✅ Login successful for:', email)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar,
          }
        } catch (error) {
          console.error('❌ Authorize error:', error)
          return null
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (account?.provider === 'credentials' && user) {
        token.role = user.role
        token.id = user.id
      }

      if (account?.provider === 'google') {
        console.log('Google OAuth session', token.role)

        if (user) {
          token.role = (user as any).role || 'user'
          token.id = (user as any).id
        }
      }

      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
}
