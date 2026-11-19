import type { CollectionFilters, RepresentationsPage } from '@/types/collection'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { filtersToQueryString } from '@/hooks/useFilters'

export const ITEMS_QUERY_KEY = (filters: CollectionFilters) => ['items', filters] as const

const fetchItems = async (filters: CollectionFilters): Promise<RepresentationsPage> => {
  const qs = filtersToQueryString(filters)
  const response = await apiFetch(`/api/items${qs ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export const useItems = (filters: CollectionFilters) =>
  useQuery({
    queryKey: ITEMS_QUERY_KEY(filters),
    queryFn: () => fetchItems(filters),
    // Keeps the previous results on screen while a new filter loads.
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
