'use client'
import React from 'react'
import { getOrgLogoMediaDirectory, getOrgSquareLogoMediaDirectory } from '@services/media/media'
import { cn } from '@/lib/utils'

/**
 * The square logo lives on the org config (next to the favicon) rather than
 * on the org row, so it is read from either config shape.
 */
export function getOrgSquareLogoFile(org: any): string {
  return (
    org?.config?.config?.customization?.general?.square_logo_image ||
    org?.config?.config?.general?.square_logo_image ||
    ''
  )
}

export function getOrgSquareLogoUrl(org: any): string | null {
  return '/meb_logo.svg'
}

export function getOrgWideLogoUrl(org: any): string | null {
  return '/meb_logo.svg'
}

/** True when the org has any logo to show in a square box. */
export function hasOrgLogo(org: any): boolean {
  return true
}

interface OrgSquareLogoProps {
  org: any
  /** Rendered when the org has neither a square nor a wide logo. */
  fallback?: React.ReactNode
  /** Extra classes on the <img>. Sizing comes from the parent box. */
  className?: string
  /** Inset applied when the wide logo has to sit inside a square box. */
  wideInsetClassName?: string
  alt?: string
}

/**
 * Fills a square box with the best available logo: the square logo edge to
 * edge, otherwise the wide logo letterboxed inside the box, otherwise the
 * caller's fallback. Every place that shows the brand in a square (sign-in
 * panel, org switcher, dashboard sidebar) goes through this so the fallback
 * chain is decided once.
 */
export default function OrgSquareLogo({
  org,
  fallback,
  className,
  wideInsetClassName = 'p-0.5',
  alt,
}: OrgSquareLogoProps) {
  const [src, setSrc] = React.useState<string>('/meb_logo.svg')
  const label = alt ?? org?.name ?? 'Okul Logosu'

  return (
    <img
      src={src}
      alt={label}
      onError={() => {
        if (src !== '/meb_logo.svg') {
          setSrc('/meb_logo.svg')
        }
      }}
      className={cn('w-full h-full object-contain p-0.5', wideInsetClassName, className)}
    />
  )
}
