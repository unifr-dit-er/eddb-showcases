'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

// Width of the logo of the European Research Council, which funded the
// database through the Locus Ludi project (grant agreement No. 741520):
// shown at 320 px (first 400 px, reduced by Alrick), where its lower line,
// "Established by the European Commission", is still legible. The logo is
// never cropped. Same placement as the CSP logo of pressearchiv (Alrick,
// 24.11.2026).
export const SPONSOR_LOGO_WIDTH = 320

interface SponsorLogoProps {
  className?: string
}

export const SponsorLogo = ({ className }: SponsorLogoProps) => {
  const { t } = useLanguage()

  return (
    <a href={t('sponsor.url')} target="_blank" rel="noopener noreferrer" className={cn('block', className)}>
      {/* The official logo (EU flag and ERC, without the text "Funded by"),
          reduced to 1200 px wide from the file received. */}
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/erc-logo.png`}
        alt={t('sponsor.name')}
        width={SPONSOR_LOGO_WIDTH}
        height={135}
        unoptimized
        className="inline-block max-w-full h-auto"
      />
    </a>
  )
}
