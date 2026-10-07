'use client'

import Script from 'next/script'
import { parseHeadScripts } from '@/lib/parseScripts'

interface HeadScriptsProps {
  googleAnalyticsHead?: string
}

export default function HeadScripts({ googleAnalyticsHead }: HeadScriptsProps) {
  if (!googleAnalyticsHead || googleAnalyticsHead.trim() === '') {
    return null
  }

  const { scripts } = parseHeadScripts(googleAnalyticsHead)

  return (
    <>
      {scripts.map((script, index) => {
        if (script.type === 'application/ld+json' && script.content) {
          return (
            <script
              key={`head-script-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: script.content }}
            />
          )
        } else if (script.src) {
          return (
            <Script
              key={`head-script-${index}`}
              src={script.src}
              strategy="afterInteractive" // Changed from beforeInteractive to avoid blocking
              {...(script.async && { async: true })}
              {...(script.defer && { defer: true })}
            />
          )
        } else if (script.content) {
          return (
            <Script
              key={`head-script-${index}`}
              id={`head-script-${index}`}
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: script.content }}
            />
          )
        }
        return null
      })}
    </>
  )
}
