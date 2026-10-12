'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

// Foot of the page after the institute layout of the Unifr corporate design
// manual (p. 16-19): an indication line in the faculty colour, then the
// sender in capitals (faculty, then institute) on the left and the UNI FR
// signet on the right.
export const SiteFooter = () => {
  const { t } = useLanguage()
  return (
    <footer className="shrink-0 bg-background">
      <div className="h-1 bg-primary" aria-hidden />
      <div className="px-4 lg:px-6 py-2.5 flex items-end justify-between gap-6 [&_a]:transition-colors">
        <div className="text-[11px] uppercase tracking-[0.12em] leading-snug min-w-0">
          <a
            href={t('footer.faculty.url')}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-foreground hover:text-primary-ink"
          >
            {t('footer.faculty')}
          </a>
          <a
            href={t('footer.institute.url')}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-muted-foreground hover:text-foreground"
          >
            {t('footer.institute')}
          </a>
        </div>
        <div className="flex items-end gap-5 shrink-0">
          <p className="hidden md:block text-[10px] uppercase tracking-[0.12em] leading-snug text-muted-foreground/80 text-right">
            {t('footer.eddb')}{' '}
            <a href="https://www.unifr.ch/it/fr/eddb.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-muted-foreground hover:text-foreground">
              EDDB
            </a>
            <br />
            {t('footer.eddb.of')}{' '}
            <a href="https://www.unifr.ch/it/fr/enseignement-et-recherche.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-muted-foreground hover:text-foreground">
              DIT-ER
            </a>
          </p>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/unifr-signet.png`}
            alt="UNI FR"
            width={69}
            height={82}
            className="h-8 w-auto"
          />
        </div>
      </div>
    </footer>
  )
}
