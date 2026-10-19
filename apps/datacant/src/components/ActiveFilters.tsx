'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { useKeywords } from '@/hooks/useKeywords'
import { getCantonLabel } from '@/lib/cantons'
import { formatPeriod } from '@/lib/period'
import { ActiveFilterChips, type FilterChip } from '@eddb/showcase-kit/active-filter-chips'

// Chips of the active filters, above the results.
const ActiveFilters = () => {
  const { filters, setFilter, setFilters, resetFilters } = useFilters()
  const { data: keywords = [] } = useKeywords()
  const { t, locale, langSuffix } = useLanguage()

  const keywordLabel = (id: string) => keywords.find((kw) => kw.id === id)?.label ?? id
  const period = formatPeriod(filters.from, filters.to, locale)

  const chips: FilterChip[] = [
    ...(filters.q ? [{ key: 'q', text: `« ${filters.q} »`, remove: () => setFilter('q', '') }] : []),
    ...(filters.canton
      ? [{ key: 'canton', text: getCantonLabel(filters.canton, langSuffix), remove: () => setFilter('canton', '') }]
      : []),
    ...(period ? [{ key: 'period', text: period, remove: () => setFilters({ from: '', to: '' }) }] : []),
    ...filters.keywords.map((id) => ({
      key: `kw-${id}`,
      text: keywordLabel(id),
      remove: () => setFilter('keywords', filters.keywords.filter((k) => k !== id)),
    })),
  ]

  return (
    <ActiveFilterChips
      chips={chips}
      onClear={resetFilters}
      labels={{ group: t('activeFilters.label'), remove: t('activeFilters.remove'), clear: t('activeFilters.clear') }}
    />
  )
}

export default ActiveFilters
