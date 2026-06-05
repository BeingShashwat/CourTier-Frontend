import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  canonicalUrl?: string
  ogType?: 'website' | 'article'
  ogImage?: string
  jsonLd?: Record<string, any>
}

export function useSeo({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/icons/courtier-rounded-app-icon-512.svg',
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = `${title} | CourTier — eCourts Indian Case Tracker`
    document.title = formattedTitle

    // Helper to find or create a meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attributeName, attributeValue)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Helper to find or create a link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`)
      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }
      element.setAttribute('href', href)
    }

    // 2. Set Meta Description
    setMetaTag('name', 'description', description)

    // 3. Set OpenGraph Meta Tags
    setMetaTag('property', 'og:title', formattedTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:image', window.location.origin + ogImage)
    setMetaTag('property', 'og:url', window.location.href)

    // 4. Set Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', formattedTitle)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', window.location.origin + ogImage)

    // 5. Set Canonical Link
    const finalCanonical = canonicalUrl || window.location.href
    setLinkTag('canonical', finalCanonical)

    // 6. Set Structured Data (JSON-LD)
    let jsonLdScript = document.getElementById('json-ld-seo') as HTMLScriptElement | null
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script')
        jsonLdScript.id = 'json-ld-seo'
        jsonLdScript.type = 'application/ld+json'
        document.head.appendChild(jsonLdScript)
      }
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...jsonLd,
      })
    } else if (jsonLdScript) {
      jsonLdScript.remove()
    }

    return () => {
      // Clean up JSON-LD script if component unmounts
      const scriptToRemove = document.getElementById('json-ld-seo')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [title, description, canonicalUrl, ogType, ogImage, jsonLd])
}
