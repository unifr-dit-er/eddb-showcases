'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

// Width of the logo of the Centre scientifique de compétence sur le
// plurilinguisme (CSP), for which the archive was built: its five lines, one
// per language, stay legible from 650 px. The logo is never cropped.
export const SPONSOR_LOGO_WIDTH = 650

interface SponsorLogoProps {
  className?: string
  labelClassName?: string
}

export const SponsorLogo = ({ className, labelClassName }: SponsorLogoProps) => {
  const { t } = useLanguage()

  return (
    <a href={t('sponsor.url')} target="_blank" rel="noopener noreferrer" className={cn('block', className)}>
      <span className={cn('block mb-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80', labelClassName)}>
        {t('sponsor.lead')}
      </span>
      {/* SVG, served as is. */}
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
