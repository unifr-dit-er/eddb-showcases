'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

// Width of the logo of the Centre scientifique de compétence sur le
// plurilinguisme (CSP), which developed the archive: its five lines, one
// per language, stay legible from 650 px. The logo is never cropped.
export const SPONSOR_LOGO_WIDTH = 650

interface SponsorLogoProps {
  className?: string
}

export const SponsorLogo = ({ className }: SponsorLogoProps) => {
  const { t } = useLanguage()

  return (
    <a href={t('sponsor.url')} target="_blank" rel="noopener noreferrer" className={cn('block', className)}>
      {/* SVG, served as is, without a lead: the CSP developed the collection,
          it did not merely support it (institute, 29.10.2026). */}
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/csp-logo.svg`}
        alt={t('sponsor.name')}
        width={SPONSOR_LOGO_WIDTH}
        height={68}
        unoptimized
        className="max-w-full h-auto"
      />
    </a>
  )
}
