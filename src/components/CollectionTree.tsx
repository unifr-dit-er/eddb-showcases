'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { cn } from '@/lib/utils'
import type { Collection, SeriesFacet } from '@/types/archive'
import { ChevronRight, FileText, Folder, FolderOpen, Newspaper } from 'lucide-react'
import { useMemo, useState } from 'react'

const Count = ({ value, active }: { value: number; active?: boolean }) => (
  <span className={cn('text-[10px] tabular-nums shrink-0', active ? 'text-primary-foreground/80' : 'text-sidebar-foreground/50')}>
    {value}
  </span>
)

const rowClass = (active: boolean) =>
  cn(
    'flex-1 min-w-0 flex items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm leading-tight transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
  )

// "CH: Presse" → "Presse": under the "Switzerland" heading the prefix is redundant.
const stripNational = (title: string) => title.replace(/^CH\s*:\s*/, '').replace(/^\p{Ll}/u, (c) => c.toUpperCase())

// The tree the institute asked for: Switzerland, then each canton with its
// press and documents collections.
export const CollectionTree = ({ series }: { series: SeriesFacet[] }) => {
  const { t, locale, seriesTitle } = useLanguage()
  const { filters, setFilters } = useFilters()
  const [open, setOpen] = useState<Set<string>>(() => new Set(filters.series ? [filters.series] : []))
  const [openedFor, setOpenedFor] = useState(filters.series)

  // A newly selected canton opens (shared link, back button, card badge).
  if (filters.series !== openedFor) {
    setOpenedFor(filters.series)
    if (filters.series && !open.has(filters.series)) setOpen(new Set(open).add(filters.series))
  }

  const { national, cantons } = useMemo(() => {
    const byTitle = (a: SeriesFacet, b: SeriesFacet) => seriesTitle(a).localeCompare(seriesTitle(b), locale)
    return {
      national: series.filter((s) => s.national).sort(byTitle),
      cantons: series.filter((s) => !s.national).sort(byTitle),
    }
  }, [series, seriesTitle, locale])

  const select = (seriesId: string, collection: '' | Collection = '') => setFilters({ series: seriesId, collection })

  const isSelected = (seriesId: string, collection: '' | Collection = '') =>
    filters.series === seriesId && filters.collection === collection

  const total = series.reduce((sum, s) => sum + s.press + s.documents, 0)

  return (
    <div className="space-y-3">
      <button onClick={() => select('')} className={cn(rowClass(!filters.series), 'w-full')}>
        <span className="font-medium">{t('sidebar.collections.all')}</span>
        <Count value={total} active={!filters.series} />
      </button>

      {national.length > 0 && (
        <div>
          <p className="px-2 mb-1 text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/35">
            {t('sidebar.collections.national')}
          </p>
          {national.map((s) => (
            <button key={s.id} onClick={() => select(s.id)} className={cn(rowClass(isSelected(s.id)), 'w-full')}>
              <span className="flex items-center gap-2 truncate">
                <Folder className="h-3.5 w-3.5 shrink-0 opacity-60" />
                {stripNational(seriesTitle(s))}
              </span>
              <Count value={s.press + s.documents} active={isSelected(s.id)} />
            </button>
          ))}
        </div>
      )}

      <div>
        <p className="px-2 mb-1 text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/35">
          {t('sidebar.collections.cantons')}
        </p>
        {cantons.map((s) => {
          const isOpen = open.has(s.id)
          const collections = (
            [
              ['press', s.press, Newspaper, 'sidebar.collection.press'],
              ['documents', s.documents, FileText, 'sidebar.collection.documents'],
            ] as const
          ).filter(([, count]) => count > 0)
          return (
            <Collapsible
              key={s.id}
              open={isOpen}
              onOpenChange={(next) =>
                setOpen((prev) => {
                  const copy = new Set(prev)
                  if (next) copy.add(s.id)
                  else copy.delete(s.id)
                  return copy
                })
              }
            >
              <div className="flex items-center gap-0.5">
                <CollapsibleTrigger
                  className="p-1 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors"
                  aria-label={seriesTitle(s)}
                >
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform duration-150', isOpen && 'rotate-90')} />
                </CollapsibleTrigger>
                <button onClick={() => select(s.id)} className={rowClass(isSelected(s.id))}>
                  <span className="flex items-center gap-2 truncate">
                    {isOpen ? (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    )}
                    {seriesTitle(s)}
                  </span>
                  <Count value={s.press + s.documents} active={isSelected(s.id)} />
                </button>
              </div>
              <CollapsibleContent>
                <div className="ml-[1.375rem] pl-3 border-l border-sidebar-border/60 py-0.5 space-y-0.5">
                  {collections.map(([collection, count, Icon, key]) => (
                    <button
                      key={collection}
                      onClick={() => select(s.id, collection)}
                      className={cn(rowClass(isSelected(s.id, collection)), 'w-full')}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {t(key)}
                      </span>
                      <Count value={count} active={isSelected(s.id, collection)} />
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
