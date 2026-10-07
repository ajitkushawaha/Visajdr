import type React from 'react'
import { Metadata } from 'next'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/footer'
import FooterWrapper from '@/components/layout/FooterWrapper'
// import MobileTabBar from '@/components/layout/MobileTabbar'

import GlobalSchema from '@/components/seo/GlobalSchema'

export const metadata: Metadata = {
  title: 'Visa Services | Visa4 – Apply Online Easily',
  description:
    'Get fast, reliable visa services with Visa4. Apply online for tourist, business, and student visas with expert support.',
  keywords: [
    'visa services',
    'apply visa online',
    'tourist visa',
    'business visa',
    'Visa4 visa',
  ],
  openGraph: {
    title: 'Visa4 - Premium Visa Services',
    description:
      'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
    url: 'https://www.visa4.com',
    type: 'website',
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicNavbar />
      <GlobalSchema />
      <main className="">{children}</main>
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
      {/* <MobileTabBar /> */}
    </>
  )
}
