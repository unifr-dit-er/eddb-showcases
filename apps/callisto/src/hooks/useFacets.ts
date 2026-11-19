import type { CollectionFilters, Facets } from '@/types/collection'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { filtersToQueryString, useFilters } from '@/hooks/useFilters'
import { DEFAULT_FILTERS } from '@/types/collection'

// Page and sort order do not change the counts: they stay out of the key.
const countingFilters = (filters: CollectionFilters): CollectionFilters => ({
  ...filters,
  page: 1,
  sort: DEFAULT_FILTERS.sort,
  sortDir: DEFAULT_FILTERS.sortDir,
})

export const FACETS_QUERY_KEY = (filters: CollectionFilters) => ['facets', countingFilters(filters)] as const

const fetchFacets = async (filters: CollectionFilters): Promise<Facets> => {
  const qs = filtersToQueryString(countingFilters(filters))
  const response = await apiFetch(`/api/facets${qs ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export const useFacets = () => {
  const { filters } = useFilters()
  return useQuery({
    queryKey: FACETS_QUERY_KEY(filters),
    queryFn: () => fetchFacets(filters),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
}
