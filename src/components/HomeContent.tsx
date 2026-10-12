'use client'

import { AboutDialog } from '@/components/AboutDialog'
import { ArticleList } from '@/components/ArticleList'
import { ArticlePanel } from '@/components/ArticlePanel'
import { FilterSidebar } from '@/components/FilterSidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SiteFooter } from '@/components/SiteFooter'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFontSize } from '@/contexts/FontSizeContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'

// Masthead in the newspaper manner: serif title between two rules.
const SidebarContent = () => {
  const { t } = useLanguage()
  return (
    <>
      <div className="bg-white px-4 py-4 shrink-0">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/unifr.png`}
          alt="Université de Fribourg"
          width={340}
          height={84}
          className="h-10 w-auto object-contain"
          loading="eager"
          priority
        />
      </div>
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="border-y-2 border-sidebar-foreground/70 py-2">
          <span className="block font-serif text-[1.75rem] font-semibold leading-none tracking-tight text-sidebar-foreground">
            Pressearchiv
          </span>
        </div>
        <p className="mt-1.5 text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/65">
          {t('sidebar.subtitle')}
        </p>
      </div>
      <div className="h-px bg-sidebar-border/60 shrink-0" />
      <ScrollArea className="flex-1 min-h-0">
        <FilterSidebar />
      </ScrollArea>
    </>
  )
}

export const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useLanguage()
  const { fontSize, setFontSize, fontSizes, fontSizeLabels } = useFontSize()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.title = 'Pressearchiv'
    document.documentElement.lang = locale
  }, [locale])

  const articleId = searchParams.get('article')

  const closePanel = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('article')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, router, pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-80 shrink-0 bg-sidebar text-sidebar-foreground flex-col overflow-hidden border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile/tablet drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-80 p-0 bg-sidebar text-sidebar-foreground flex flex-col gap-0 lg:hidden"
          showCloseButton={false}
        >
          <VisuallyHidden>
            <SheetTitle>{t('sidebar.open')}</SheetTitle>
          </VisuallyHidden>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        <header className="shrink-0 border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('sidebar.open')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm lg:text-base font-semibold text-foreground leading-snug truncate">
              {t('header.title')}
            </h1>
            <span className="hidden sm:inline shrink-0 text-[10px] tracking-[0.15em] uppercase font-semibold text-primary-ink border border-primary/40 rounded px-1.5 py-0.5">
              {t('header.prototype')}
            </span>
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
          <ArticleList />
        </div>

        <SiteFooter />
      </main>
      <ArticlePanel articleId={articleId} onClose={closePanel} />
    </div>
  )
}
