/**
 * Parse HTML string and extract script tags and other head elements
 */
export function parseHeadScripts(html: string): {
  scripts: Array<{
    src?: string
    content?: string
    async?: boolean
    defer?: boolean
    type?: string
  }>
  metaTags: Array<{ name?: string; property?: string; content: string }>
} {
  const scripts: Array<{
    src?: string
    content?: string
    async?: boolean
    defer?: boolean
    type?: string
  }> = []
  const metaTags: Array<{ name?: string; property?: string; content: string }> =
    []

  if (!html || html.trim() === '') {
    return { scripts, metaTags }
  }

  // Extract script tags
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1]
    const content = match[2]?.trim() || ''

    const script: {
      src?: string
      content?: string
      async?: boolean
      defer?: boolean
      type?: string
    } = {}

    // Extract src attribute
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i)
    if (srcMatch) {
      script.src = srcMatch[1]
    }

    // Extract type attribute
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i)
    if (typeMatch) {
      script.type = typeMatch[1]
    }

    // Extract async attribute
    if (/async/i.test(attrs)) {
      script.async = true
    }

    // Extract defer attribute
    if (/defer/i.test(attrs)) {
      script.defer = true
    }

    // Add content if present
    if (content) {
      script.content = content
    }

    scripts.push(script)
  }

  // Extract meta tags
  const metaRegex = /<meta([^>]+)>/gi
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1]
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i)
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i)
    const contentMatch = attrs.match(/content=["']([^"']+)["']/i)

    if (contentMatch) {
      const meta: { name?: string; property?: string; content: string } = {
        content: contentMatch[1],
      }

      if (nameMatch) {
        meta.name = nameMatch[1]
      }

      if (propertyMatch) {
        meta.property = propertyMatch[1]
      }

      metaTags.push(meta)
    }
  }

  return { scripts, metaTags }
}
