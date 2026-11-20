'use client'

import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/contexts/LanguageContext'
import { AboutButton } from '@eddb/showcase-kit/about-button'

export const AboutDialog = () => {
  const { t } = useLanguage()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <AboutButton label={t('about.title')} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{t('sidebar.title')}</DialogTitle>
        </DialogHeader>

        {/* Illustration of the former showcase (eddb-vue, img/callisto.png),
            decorative: a drawing, not one of the base's images. */}
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/callisto.png`}
          alt=""
          width={435}
          height={335}
          unoptimized
          className="mx-auto w-full max-w-[320px] h-auto"
        />

        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">{t('about.content')}</DialogDescription>

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
