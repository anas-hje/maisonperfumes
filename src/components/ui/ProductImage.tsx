'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src?: string
  alt: string
  /** Shown inside the fallback when the image is missing — usually the brand initial. */
  fallbackLabel?: string
  /** Tailwind text size for the fallback label, matched to the container size. */
  fallbackLabelClassName?: string
  sizes: string
  className?: string
  priority?: boolean
}

/**
 * Product image with a branded fallback. Must be rendered inside a parent that
 * establishes its own size and a positioning context (the image uses `fill`), so
 * the fallback occupies exactly the same box a loaded image would.
 *
 * Every product surface uses this rather than next/image directly, so a missing
 * file degrades to the same branded placeholder everywhere instead of an empty box.
 */
export default function ProductImage({
  src,
  alt,
  fallbackLabel,
  fallbackLabelClassName = 'text-4xl',
  sizes,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber/10 to-brass/5"
        aria-hidden="true"
      >
        {fallbackLabel && (
          <span
            className={`font-display uppercase text-white/[0.07] leading-none select-none ${fallbackLabelClassName}`}
          >
            {fallbackLabel}
          </span>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
