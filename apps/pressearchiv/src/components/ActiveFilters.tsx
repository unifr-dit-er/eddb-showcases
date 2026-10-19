'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useFacets } from '@/hooks/useFacets'
import { useFilters } from '@/hooks/useFilters'
import { X } from 'lucide-react'

interface Chip {
  key: string
  text: string
  remove: () => void
}

// Reminder of every active filter above the results, each removable on the
// spot: the sidebar sections can stay folded.
export const ActiveFilters = () => {
  const { filters, setFilter, setFilters, toggleKeyword, toggleType, resetFilters, hasActiveFilters } = useFilters()
  const { seriesById } = useFacets()
  const { t, label, seriesTitle } = useLanguage()

  if (!hasActiveFilters) return null

  const series = filters.series ? seriesById.get(filters.series) : undefined
  const period =
    filters.from && filters.to
      ? filters.from === filters.to
        ? filters.from
        : `${filters.from}–${filters.to}`
      : filters.from
        ? `≥ ${filters.from}`
        : filters.to
          ? `≤ ${filters.to}`
          : ''

  const chips: Chip[] = [
    ...(filters.q ? [{ key: 'q', text: `« ${filters.q} »`, remove: () => setFilter('q', '') }] : []),
    ...(filters.series
      ? [{ key: 'series', text: series ? seriesTitle(series) : filters.series, remove: () => setFilter('series', '') }]
      : []),
    ...filters.types.map((type) => ({ key: `type-${type}`, text: label('recordType', type), remove: () => toggleType(type) })),
    ...(period ? [{ key: 'period', text: period, remove: () => setFilters({ from: '', to: '' }) }] : []),
    ...(filters.language
      ? [{ key: 'lang', text: label('language', filters.language), remove: () => setFilter('language', '') }]
      : []),
    ...(filters.journal ? [{ key: 'journal', text: filters.journal, remove: () => setFilter('journal', '') }] : []),
    ...filters.keywords.map((kw) => ({ key: `kw-${kw}`, text: kw, remove: () => toggleKeyword(kw) })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label={t('activeFilters.label')}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remove}
          aria-label={`${t('activeFilters.remove')} : ${chip.text}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary-tint-2 bg-primary-tint-3 px-2.5 py-0.5 text-[0.8125rem] text-primary-ink hover:bg-primary-tint-2 transition-colors"
        >
          <span className="truncate">{chip.text}</span>
          <X className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={resetFilters}
          className="ml-1 text-[0.8125rem] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          {t('activeFilters.clear')}
        </button>
      )}
    </div>
  )
}
