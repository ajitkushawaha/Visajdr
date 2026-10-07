import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken, CSRF_COOKIE_NAME } from '@/lib/csrf'

export async function GET(_request: NextRequest) {
  const token = generateCsrfToken()
  const res = NextResponse.json({ token })
  // Set cookie for double-submit strategy
  res.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res
}
