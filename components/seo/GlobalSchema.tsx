import React from 'react'
import JsonLd from './JsonLd'
import { getCompanySettings } from '@/lib/companySettings'

/**
 * GlobalSchema component to inject Organization and WebSite structured data.
 * Fetches company settings to populate social links and contact info.
 */
export default async function GlobalSchema() {
  const settings = await getCompanySettings()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visa4.com'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: settings?.companyName || 'Visa4',
    url: baseUrl,
    logo: settings?.logoUrl || `${baseUrl}/logo.png`,
    sameAs: [
      settings?.facebookLink,
      settings?.twitterLink,
      settings?.instagramLink,
      settings?.linkedinLink,
      settings?.youtubeLink,
    ].filter(Boolean),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: settings?.supportNo,
        contactType: 'customer service',
        email: settings?.supportEmail,
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    ].filter(cp => cp.telephone || cp.email),
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.streetAddress,
      addressLocality: settings?.city,
      addressRegion: settings?.state,
      postalCode: settings?.zipCode,
      addressCountry: 'IN',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: settings?.companyName || 'Visa4',
    description: settings?.metaDescription || 'Premium Visa Services',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/blog?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  }

  return (
    <>
      <JsonLd data={organizationSchema} id="organization-schema" />
      <JsonLd data={websiteSchema} id="website-schema" />
    </>
  )
}
