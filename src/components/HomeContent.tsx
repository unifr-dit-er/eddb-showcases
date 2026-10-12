'use client'

import AboutDialog from '@/components/AboutDialog'
import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFontSize } from '@/contexts/FontSizeContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronRight, Menu } from 'lucide-react'

const SidebarContent = () => (
  <>
    <div className="bg-white px-4 py-4 shrink-0">
      <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/unifr.png`} alt="Université de Fribourg" width={340} height={84} className="h-10 w-auto object-contain" loading="eager" priority />
    </div>
    <div className="px-4 py-3 shrink-0">
      <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Datacant</span>
    </div>
    <div className="h-px bg-sidebar-border/60 shrink-0" />
    <ScrollArea className="flex-1 min-h-0">
      <FilterSidebar />
    </ScrollArea>
  </>
)

const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useLanguage()
  const { fontSize, setFontSize, fontSizes, fontSizeLabels } = useFontSize()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.title = 'Datacant'
  }, [locale])

  const decisionId = searchParams.get('decision')

  const closePanel = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('decision')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }, [searchParams, router, pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-80 shrink-0 bg-sidebar text-sidebar-foreground flex-col overflow-hidden border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile/tablet drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-sidebar text-sidebar-foreground flex flex-col gap-0 lg:hidden" showCloseButton={false}>
          <VisuallyHidden><SheetTitle>Filtres</SheetTitle></VisuallyHidden>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        <header className="shrink-0 border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ouvrir les filtres"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm lg:text-base font-semibold text-foreground leading-snug truncate">
              {t('header.title')}
            </h1>
            <div className="w-px h-4 bg-border shrink-0" />
            <AboutDialog />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Select value={fontSize} onValueChange={(v) => setFontSize(v as typeof fontSize)}>
              <SelectTrigger className="data-[size=default]:h-auto border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 px-1.5 py-0.5 text-[11px] tracking-[0.15em] uppercase font-semibold bg-muted text-foreground rounded gap-1 [&_svg:not([class*='size-'])]:size-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" align="end">
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size} className="text-[11px] uppercase font-semibold tracking-[0.1em]">
                    {fontSizeLabels[size]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-border" />
            <LanguageSelector />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <DecisionList />
        </div>

        <footer className="shrink-0 border-t border-border px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 [&_a]:transition-colors">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            <span className="inline-block h-2.5 w-2.5 bg-primary shrink-0" />
            <a href={t('footer.faculty.url')} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {t('footer.faculty')}
            </a>
            <ChevronRight className="inline h-3 w-3 mx-1 opacity-50" />
            <a href={t('footer.institute.url')} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {t('footer.institute')}
            </a>
          </p>
          <p className="text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            {t('footer.eddb')}{' '}
            <a href="https://www.unifr.ch/it/fr/eddb.html" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">EDDB</a>
            {' '}{t('footer.eddb.of')}{' '}
            <a href="https://www.unifr.ch/it/fr/enseignement-et-recherche.html" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">DIT-ER</a>
          </p>
        </footer>
      </main>
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}

export default HomeContent
