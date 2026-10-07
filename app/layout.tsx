// app/layout.tsx (or app/layout.js if using JS)

import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Sarabun } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
// Defer Swiper CSS loading - not critical for initial render
import 'swiper/css'
import 'swiper/css/pagination'
import { SessionProvider } from 'next-auth/react'
import SessionWrapper from '@/components/wrapper/SessionWrapper'
import { Toaster } from '@/components/ui/toaster'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ScriptInjection from '@/components/seo/ScriptInjection'
import HeadScripts from '@/components/seo/HeadScripts'
import MetaTags from '@/components/seo/MetaTags'
import ResourceHints from '@/components/seo/ResourceHints'
import {
  fetchCompanySettingsForScripts,
  getCompanySettings,
} from '@/lib/companySettings'

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sarabun',
})
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCompanySettings()
  const faviconUrl = settings?.faviconUrl || settings?.logoUrl || '/logo.png'

  return {
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
    icons: {
      icon: [
        {
          url: faviconUrl,
          sizes: 'any',
        },
      ],
      shortcut: faviconUrl,
      apple: [
        {
          url: faviconUrl,
        },
      ],
    },
    appleWebApp: {
      capable: true,
      title: 'Visa4',
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
  }
}

// Export viewport separately (Next.js 13+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch company settings for scripts
  const settings = await fetchCompanySettingsForScripts()

  return (
    <html lang="en">
      <body
        className={`${sarabun.variable} no-scrollbar`}
        style={{
          fontFamily:
            'var(--font-sarabun), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        }}
      >
        {/* Resource Hints - Preconnect and DNS prefetch for critical domains */}
        <ResourceHints />
        {/* Meta Tags - Injected client-side */}
        <MetaTags googleSiteVerification={settings.googleSiteVerification} />
        {/* Head Scripts - Injected via Next.js Script component */}
        <HeadScripts googleAnalyticsHead={settings.googleAnalyticsHead} />
        <SessionWrapper>
          {children}
          <Toaster />
          <SpeedInsights />
          {/* Google Analytics Body Script */}
          <ScriptInjection googleAnalyticsBody={settings.googleAnalyticsBody} />
        </SessionWrapper>
        {/* KwickLingo Chat Widget */}
        <Script
          src="https://www.kwicklingo.com/api/widget.js?businessId=business_1770118648077_1idoxe5oy&apiUrl=https://www.kwicklingo.com"
          strategy="lazyOnload"
        />
        <Script
          id="pwa-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('PWA ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
