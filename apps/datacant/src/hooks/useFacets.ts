import type { Facets } from '@/types/decision'
import type { Filters } from '@/types/filters'
import type { Locale } from '@/i18n'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'
import { filtersToQueryString, useFilters } from '@/hooks/useFilters'

// Page and sort order do not change the counts: they stay out of the key.
const countingFilters = (filters: Filters): Filters => ({ ...filters, page: 1, sortDir: 'desc' })

export const FACETS_QUERY_KEY = (filters: Filters, locale: Locale) =>
  ['facets', countingFilters(filters), locale] as const

const fetchFacets = async (filters: Filters, locale: Locale): Promise<Facets> => {
  const response = await apiFetch(`/api/facets?${filtersToQueryString(countingFilters(filters), { lang: locale })}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Counts of the cantons and keywords given the active filters (see
// computeFacets), keyword labels and the year range of the base.
export const useFacets = () => {
  const { filters } = useFilters()
  const { locale } = useLanguage()
  return useQuery({
    queryKey: FACETS_QUERY_KEY(filters, locale),
    queryFn: () => fetchFacets(filters, locale),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
}
