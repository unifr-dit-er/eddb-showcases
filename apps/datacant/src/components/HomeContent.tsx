'use client'

import AboutDialog from '@/components/AboutDialog'
import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarMasthead } from '@eddb/showcase-kit/sidebar-masthead'
import { SiteFooter } from '@eddb/showcase-kit/site-footer'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { SHOWCASE_NAME } from '@/i18n'
import { useFontSize } from '@eddb/showcase-kit/font-size'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Menu } from 'lucide-react'

const SidebarContent = () => {
  const { t } = useLanguage()
  return (
    <>
      <SidebarMasthead title={SHOWCASE_NAME} subtitle={t('sidebar.subtitle')} />
      <ScrollArea className="flex-1 min-h-0">
        <FilterSidebar />
      </ScrollArea>
    </>
  )
}

const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const { fontSize, setFontSize, fontSizes, fontSizeLabels } = useFontSize()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

        <SiteFooter
          faculty={{ label: t('footer.faculty'), url: t('footer.faculty.url') }}
          institute={{ label: t('footer.institute'), url: t('footer.institute.url') }}
          credit={{ lead: t('footer.eddb'), of: t('footer.eddb.of') }}
        />
      </main>
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}

export default HomeContent
