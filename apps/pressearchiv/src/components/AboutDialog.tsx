'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SponsorLogo } from '@/components/SponsorLogo'
import { useLanguage } from '@/contexts/LanguageContext'
import { getPageTitle } from '@/i18n'
import { Info, Lock } from 'lucide-react'

export const AboutDialog = () => {
  const { t, locale } = useLanguage()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* The icon alone was not visible enough (institute, 29.10.2026). */}
        <button className="flex items-center gap-1.5 shrink-0 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <Info className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t('about.title')}</span>
          <span className="sr-only sm:hidden">{t('about.title')}</span>
        </button>
      </DialogTrigger>
      {/* Wide enough for the sponsor logo at 650 px. */}
      <DialogContent className="sm:max-w-[698px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{getPageTitle(locale)}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">{t('about.content')}</DialogDescription>

        <p className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>
            {t('fullText.contact')}{' '}
            <a
              href={t('fullText.url')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-ink hover:text-primary-ink/80 transition-colors underline-offset-2 hover:underline"
            >
              {t('fullText.urlLabel')}
            </a>
            .
          </span>
        </p>

        <Separator />

        <SponsorLogo labelClassName="text-[11px] tracking-[0.25em] font-semibold text-muted-foreground/60" />

        <Separator />

        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            <span className="inline-block h-2.5 w-2.5 bg-primary shrink-0" />
            <a href={t('footer.faculty.url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.faculty')}
            </a>
          </p>
          <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            <a href={t('footer.institute.url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.institute')}
            </a>
          </p>
          <p className="text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            {t('footer.eddb')}{' '}
            <a href="https://www.unifr.ch/it/fr/eddb.html" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">EDDB</a>
            {' '}{t('footer.eddb.of')}{' '}
            <a href="https://www.unifr.ch/it/fr/enseignement-et-recherche.html" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">DIT-ER</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
