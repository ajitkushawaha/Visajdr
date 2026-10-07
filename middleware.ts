import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Root-level middleware to enforce authentication and role-based access across the app.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and non-protected/public routes
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|txt|xml|js|css|map|mp4|webm|woff|woff2|ttf)$/.test(
      pathname
    )

  const isPublicApi = pathname.startsWith('/api/public')
  const isAuthApi = pathname.startsWith('/api/auth')
  const isAuthPage = pathname.startsWith('/auth')
  const isHome = pathname === '/'

  // Only protect admin/agent/user dashboards and their APIs; let everything else through
  const isProtectedArea =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/agent') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/dashboard')

  const isProtectedApi =
    pathname.startsWith('/api/admin') || pathname.startsWith('/api/agent')

  if (
    isStaticAsset ||
    isPublicApi ||
    isAuthApi ||
    isAuthPage ||
    isHome ||
    (!isProtectedArea && !isProtectedApi)
  ) {
    return NextResponse.next()
  }

  // Retrieve token from next-auth (works both server and edge)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token and requesting a protected path, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based enforcement for dashboard areas
  const isAgentArea =
    pathname.startsWith('/agent') || pathname.startsWith('/api/agent')
  const isAdminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isUserArea = pathname.startsWith('/user')

  const role = (token as any)?.role as string | undefined

  // If accessing a role-specific area without matching role, redirect to 403
  if (isAgentArea && role !== 'agent') {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isAdminArea && role !== 'admin') {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isUserArea && role !== 'user') {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  return NextResponse.next()
}

// Apply middleware to all routes except static assets; further filtering handled inside middleware.
export const config = {
  // Exclude NextAuth API endpoints at the matcher level as well to prevent edge redirects
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
}
