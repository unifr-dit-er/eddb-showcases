'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActiveFilters } from '@/components/ActiveFilters'
import { ItemCard } from '@/components/ItemCard'
import { YearTimeline } from '@eddb/showcase-kit/year-timeline'
import { useItems } from '@/hooks/useItems'
import { useFacets } from '@/hooks/useFacets'
import { useFilters } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { TIMELINE_BUCKET, TIMELINE_FLOOR, TIMELINE_ZOOM } from '@/lib/collection-config'
import { formatAxisYear } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SortKey } from '@/types/collection'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

const SORT_KEYS: SortKey[] = ['number', 'title', 'date']

const LoadingCards = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card border border-border shadow-sm px-5 py-4 space-y-2.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

export const ItemList = () => {
  const { filters, setFilter, setFilters } = useFilters()
  const { data, isLoading, isError, isPlaceholderData } = useItems(filters)
  const { data: facets } = useFacets()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const topRef = useRef<HTMLDivElement>(null)

  const activeItemId = searchParams.get('item')

  // Back to the top of the list when the page changes.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' })
  }, [filters.page])

  const openItem = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('item', id)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-base text-muted-foreground">{t('items.error')}</div>
    )
  }

  const items = data?.list ?? []
  const pageInfo = data?.pageInfo
  const resultUnit = pageInfo?.totalRows === 1 ? t('items.resultUnit_singular') : t('items.resultUnit_plural')
  const lastPage = pageInfo ? Math.ceil(pageInfo.totalRows / pageInfo.pageSize) : 1

  return (
    <div ref={topRef} className="p-4 lg:p-6 space-y-6 max-w-4xl">
      <ActiveFilters />
      {data && facets && facets.years.min !== facets.years.max && (
        <YearTimeline
          years={data.years}
          min={facets.years.min}
          max={facets.years.max}
          bucket={TIMELINE_BUCKET}
          floor={TIMELINE_FLOOR}
          zoom={TIMELINE_ZOOM}
          formatYear={formatAxisYear}
          from={filters.from ? Number(filters.from) : null}
          to={filters.to ? Number(filters.to) : null}
          onSelect={(from, to) =>
            setFilters({ from: from === null ? '' : String(from), to: to === null ? '' : String(to) })
          }
          labels={{
            title: t('timeline.label'),
            hint: t('timeline.hint'),
            unit: (n) => (n === 1 ? t('timeline.records_singular') : t('timeline.records_plural')),
            before: t('timeline.before'),
            zoomTitle: (range) => t('timeline.zoom_label').replace('{range}', range),
            zoomHint: t('timeline.zoom_hint'),
            back: t('timeline.back'),
          }}
        />
      )}

      {pageInfo && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">
            {pageInfo.totalRows.toLocaleString('de-CH')} {resultUnit}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('items.sort.label')}</span>
            <Select value={filters.sort} onValueChange={(v) => setFilter('sort', v as SortKey)}>
              <SelectTrigger className="h-8 w-auto gap-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {SORT_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`items.sort.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:text-foreground transition-colors"
              aria-label={filters.sortDir === 'asc' ? '↑' : '↓'}
            >
              {filters.sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingCards />
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-base text-muted-foreground">{t('items.empty')}</div>
      ) : (
        <div className={cn('space-y-3 transition-opacity', isPlaceholderData && 'opacity-60')}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} isActive={item.id === activeItemId} onClick={() => openItem(item.id)} />
          ))}
        </div>
      )}

      {pageInfo && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
            {t('items.page')} {pageInfo.page} / {lastPage}
          </span>
          <div className="flex gap-5">
            <button
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', pageInfo.page - 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('items.prev')}
            </button>
            <button
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', pageInfo.page + 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('items.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
