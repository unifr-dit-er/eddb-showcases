'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters, type MultiFilter } from '@/hooks/useFilters'
import { formatYear } from '@/lib/format'
import { ActiveFilterChips, type FilterChip } from '@eddb/showcase-kit/active-filter-chips'

const MULTI: MultiFilter[] = ['periods', 'materials', 'categories', 'forms', 'centres', 'subjects']

// Chips of the active filters, above the results.
export const ActiveFilters = () => {
  const { filters, setFilter, setFilters, toggleValue, resetFilters, hasActiveFilters } = useFilters()
  const { t } = useLanguage()

  if (!hasActiveFilters) return null

  const from = filters.from ? formatYear(Number(filters.from)) : ''
  const to = filters.to ? formatYear(Number(filters.to)) : ''
  const period = from && to ? `${from} – ${to}` : from ? `≥ ${from}` : to ? `≤ ${to}` : ''

  const chips: FilterChip[] = [
    ...(filters.q ? [{ key: 'q', text: `« ${filters.q} »`, remove: () => setFilter('q', '') }] : []),
    ...(period ? [{ key: 'period', text: period, remove: () => setFilters({ from: '', to: '' }) }] : []),
    ...MULTI.flatMap((key) =>
      filters[key].map((value) => ({ key: `${key}-${value}`, text: value, remove: () => toggleValue(key, value) }))
    ),
  ]

  return (
    <ActiveFilterChips
      chips={chips}
      onClear={resetFilters}
      labels={{ group: t('activeFilters.label'), remove: t('activeFilters.remove'), clear: t('activeFilters.clear') }}
    />
  )
}
