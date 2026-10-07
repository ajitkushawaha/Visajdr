import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/agent/',
          '/api/',
          '/auth/',
          '/auth/login',
          '/auth/register',
          '/dashboard/',
          '/payment/',
          '/track/',
          '/unauthorized/',
          '/cookie-policy',
          '/select-plan',
          '/apply',
          '/blog?category=Visa%20Guides',
          '/blog?category=Travel%20Tips',
          '/blog?category=Student%20Visas',
          '/blog?category=Business%20Travel',
          '/blog?category=Our%20Updates',
        ],
      },
    ],
    sitemap: 'https://www.visa4.com/sitemap.xml',
  }
}
