'use client'

interface ScriptInjectionProps {
  googleAnalyticsBody?: string
}

export default function ScriptInjection({
  googleAnalyticsBody,
}: ScriptInjectionProps) {
  // Google Analytics Body Script - injected at end of body
  if (!googleAnalyticsBody || googleAnalyticsBody.trim() === '') {
    return null
  }

  return <div dangerouslySetInnerHTML={{ __html: googleAnalyticsBody }} />
}
