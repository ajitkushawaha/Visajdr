'use client'

import { useState } from 'react'

interface RelatedBlogImageProps {
  src: string
  alt: string
  className?: string
}

export default function RelatedBlogImage({
  src,
  alt,
  className = '',
}: RelatedBlogImageProps) {
  const [imageSrc, setImageSrc] = useState(src || '/placeholder.svg')

  const handleError = () => {
    if (imageSrc !== '/placeholder.svg') {
      setImageSrc('/placeholder.svg')
    }
  }

  return (
    <img src={imageSrc} alt={alt} className={className} onError={handleError} />
  )
}
