'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ActiveFilters } from '@/components/ActiveFilters'
import { ArticleCard } from '@/components/ArticleCard'
import { YearTimeline } from '@eddb/showcase-kit/year-timeline'
import { useArticles } from '@/hooks/useArticles'
import { useFacets } from '@/hooks/useFacets'
import { useFilters } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

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

export const ArticleList = () => {
  const { filters, setFilter, setFilters } = useFilters()
  const { data, isLoading, isError, isPlaceholderData } = useArticles(filters)
  const { data: facets } = useFacets()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const topRef = useRef<HTMLDivElement>(null)

  const activeArticleId = searchParams.get('article')

  // Back to the top of the list when the page changes.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' })
  }, [filters.page])

  const openArticle = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('article', id)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-base text-muted-foreground">
        {t('articles.error')}
      </div>
    )
  }

  const articles = data?.list ?? []
  const pageInfo = data?.pageInfo
  const resultUnit =
    pageInfo?.totalRows === 1 ? t('articles.resultUnit_singular') : t('articles.resultUnit_plural')
  const lastPage = pageInfo ? Math.ceil(pageInfo.totalRows / pageInfo.pageSize) : 1

  return (
    <div ref={topRef} className="p-4 lg:p-6 space-y-6 max-w-4xl">
      <ActiveFilters />
      {data && facets && facets.years.max > 0 && (
        <YearTimeline
          years={data.years}
          min={facets.years.min}
          max={facets.years.max}
          from={filters.from ? Number(filters.from) : null}
          to={filters.to ? Number(filters.to) : null}
          onSelect={(from, to) => setFilters({ from: from ? String(from) : '', to: to ? String(to) : '' })}
          labels={{
            title: t('timeline.label'),
            hint: t('timeline.hint'),
            unit: (n) => (n === 1 ? t('timeline.records_singular') : t('timeline.records_plural')),
          }}
        />
      )}

      {pageInfo && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground tabular-nums">
            {pageInfo.totalRows.toLocaleString('de-CH')} {resultUnit}
          </p>
          <button
            onClick={() => setFilter('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {filters.sortDir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {t('articles.sortDate')}
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingCards />
      ) : articles.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-base text-muted-foreground">
          {t('articles.empty')}
        </div>
      ) : (
        <div className={cn('space-y-3 transition-opacity', isPlaceholderData && 'opacity-60')}>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isActive={article.id === activeArticleId}
              onClick={() => openArticle(article.id)}
            />
          ))}
        </div>
      )}

      {pageInfo && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
            {t('articles.page')} {pageInfo.page} / {lastPage}
          </span>
          <div className="flex gap-5">
            <button
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', pageInfo.page - 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('articles.prev')}
            </button>
            <button
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', pageInfo.page + 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('articles.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
