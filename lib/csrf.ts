import crypto from 'crypto'

export const CSRF_COOKIE_NAME = 'csrfToken'
export const CSRF_HEADER = 'x-csrf-token'

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCsrfTokens(
  headerToken?: string,
  cookieToken?: string
): boolean {
  if (!headerToken || !cookieToken) return false
  const a = Buffer.from(headerToken)
  const b = Buffer.from(cookieToken)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
