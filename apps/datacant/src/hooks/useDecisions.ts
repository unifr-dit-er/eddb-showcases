import type { DecisionsPage } from '@/types/decision'
import type { Filters } from '@/types/filters'
import type { Locale } from '@/i18n'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'
import { filtersToQueryString } from '@/hooks/useFilters'

export const DECISIONS_QUERY_KEY = (filters: Filters, locale: Locale) => ['decisions', filters, locale] as const

const fetchDecisions = async (filters: Filters, locale: Locale): Promise<DecisionsPage> => {
  const response = await apiFetch(`/api/decisions?${filtersToQueryString(filters, { lang: locale })}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export const useDecisions = (filters: Filters) => {
  const { locale } = useLanguage()
  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters, locale),
    queryFn: () => fetchDecisions(filters, locale),
    // Keeps the previous results on screen while a new filter loads.
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
}
