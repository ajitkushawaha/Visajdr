'use client'

import { usePathname } from 'next/navigation'

const HIDDEN_FOOTER_PATHS = [
  '/apply',
  '/visa-selection',
  '/select-purpose',
  '/select-plan',
  '/quotation',
  '/payment',
  '/travel-insurance/apply',
  '/travel-insurance/select-plan',
]

export default function FooterWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (!pathname) {
    return <>{children}</>
  }

  const shouldHideFooter = HIDDEN_FOOTER_PATHS.some(path =>
    pathname.startsWith(path)
  )

  if (shouldHideFooter) {
    return null
  }

  return <>{children}</>
}
