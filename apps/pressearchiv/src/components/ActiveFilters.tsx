'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useFacets } from '@/hooks/useFacets'
import { useFilters } from '@/hooks/useFilters'
import { useKeywordLabel } from '@/hooks/useKeywordLabel'
import { ActiveFilterChips, type FilterChip } from '@eddb/showcase-kit/active-filter-chips'

// Chips of the active filters, above the results.
export const ActiveFilters = () => {
  const { filters, setFilter, setFilters, toggleKeyword, toggleType, toggleJournal, resetFilters, hasActiveFilters } =
    useFilters()
  const keywordLabel = useKeywordLabel()
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

  const chips: FilterChip[] = [
    ...(filters.q ? [{ key: 'q', text: `« ${filters.q} »`, remove: () => setFilter('q', '') }] : []),
    ...(filters.series
      ? [{ key: 'series', text: series ? seriesTitle(series) : filters.series, remove: () => setFilter('series', '') }]
      : []),
    ...filters.types.map((type) => ({ key: `type-${type}`, text: label('recordType', type), remove: () => toggleType(type) })),
    ...(period ? [{ key: 'period', text: period, remove: () => setFilters({ from: '', to: '' }) }] : []),
    ...(filters.language
      ? [{ key: 'lang', text: label('language', filters.language), remove: () => setFilter('language', '') }]
      : []),
    ...filters.journals.map((j) => ({ key: `journal-${j}`, text: j, remove: () => toggleJournal(j) })),
    ...filters.keywords.map((kw) => ({ key: `kw-${kw}`, text: keywordLabel(kw), remove: () => toggleKeyword(kw) })),
  ]

  return (
    <ActiveFilterChips
      chips={chips}
      onClear={resetFilters}
      labels={{ group: t('activeFilters.label'), remove: t('activeFilters.remove'), clear: t('activeFilters.clear') }}
    />
  )
}
