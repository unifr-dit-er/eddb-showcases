'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/contexts/LanguageContext'
import { Info, Lock } from 'lucide-react'

export const AboutDialog = () => {
  const { t } = useLanguage()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          aria-label={t('about.title')}
          title={t('about.title')}
        >
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{t('header.title')}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">{t('about.content')}</DialogDescription>

        <p className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {t('about.fullText')}
        </p>

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
