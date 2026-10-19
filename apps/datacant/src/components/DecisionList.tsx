'use client'

import { Skeleton } from '@/components/ui/skeleton'
import ActiveFilters from '@/components/ActiveFilters'
import DecisionCard from '@/components/DecisionCard'
import { YearTimeline } from '@eddb/showcase-kit/year-timeline'
import { useDecisionYears } from '@/hooks/useDecisionYears'
import { useDecisions } from '@/hooks/useDecisions'
import { useFilters } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const DecisionList = () => {
  const { filters, setFilter, setFilters } = useFilters()
  const { data, isLoading, isError } = useDecisions(filters)
  const { t } = useLanguage()
  const timeline = useDecisionYears(filters)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeDecisionId = searchParams.get('decision')

  const openDecision = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('decision', id)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const yearOf = (date: string) => (date ? Number(date.slice(0, 4)) : null)
  const timelineFigure =
    timeline.years && timeline.max > 0 ? (
      <YearTimeline
        years={timeline.years}
        min={timeline.min}
        max={timeline.max}
        from={yearOf(filters.from)}
        to={yearOf(filters.to)}
        onSelect={(from, to) => setFilters({ from: from ? `${from}-01-01` : '', to: to ? `${to}-12-31` : '' })}
        labels={{
          title: t('timeline.label'),
          hint: t('timeline.hint'),
          unit: (n) => (n === 1 ? t('decisions.resultUnit_singular') : t('decisions.resultUnit_plural')),
        }}
      />
    ) : null

  if (isError) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        <ActiveFilters />
        <div className="flex items-center justify-center h-48 text-base text-muted-foreground">
          {t('decisions.error')}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        <ActiveFilters />
        {timelineFigure}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border border-border shadow-sm px-5 py-4 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-1.5 pt-0.5">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const decisions = data?.list ?? []
  const pageInfo = data?.pageInfo

  if (decisions.length === 0) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        <ActiveFilters />
        {timelineFigure}
        <div className="flex items-center justify-center h-48 text-base text-muted-foreground">
          {t('decisions.empty')}
        </div>
      </div>
    )
  }

  const resultUnit =
    pageInfo?.totalRows === 1
      ? t('decisions.resultUnit_singular')
      : t('decisions.resultUnit_plural')

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      <ActiveFilters />
      {timelineFigure}
      {pageInfo && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pageInfo.totalRows} {resultUnit}
          </p>
          <button
            onClick={() => setFilter('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {filters.sortDir === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
            Date
          </button>
        </div>
      )}

      <div className="space-y-3">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            isActive={decision.id === activeDecisionId}
            onClick={() => openDecision(decision.id)}
          />
        ))}
      </div>

      {pageInfo && pageInfo.totalRows > pageInfo.pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] text-muted-foreground">
            {t('decisions.page')} {filters.page} / {Math.ceil(pageInfo.totalRows / pageInfo.pageSize)}
          </span>
          <div className="flex gap-5">
            <button
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', filters.page - 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('decisions.prev')}
            </button>
            <button
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', filters.page + 1)}
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('decisions.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionList
