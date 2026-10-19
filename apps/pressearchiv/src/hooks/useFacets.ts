import type { ArchiveFilters, Facets, SeriesFacet } from '@/types/archive'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { filtersToQueryString, useFilters } from '@/hooks/useFilters'
import { useMemo } from 'react'

// Page and sort order do not change the counts: they stay out of the key.
const countingFilters = (filters: ArchiveFilters): ArchiveFilters => ({ ...filters, page: 1, sortDir: 'desc' })

export const FACETS_QUERY_KEY = (filters: ArchiveFilters) => ['facets', countingFilters(filters)] as const

const fetchFacets = async (filters: ArchiveFilters): Promise<Facets> => {
  const qs = filtersToQueryString(countingFilters(filters))
  const response = await apiFetch(`/api/facets${qs ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Counts follow the active filters (see computeFacets); series titles and
// the year range do not depend on them.
export const useFacets = () => {
  const { filters } = useFilters()
  const query = useQuery({
    queryKey: FACETS_QUERY_KEY(filters),
    queryFn: () => fetchFacets(filters),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })

  const seriesById = useMemo(
    () => new Map<string, SeriesFacet>((query.data?.series ?? []).map((s) => [s.id, s])),
    [query.data]
  )

  return { ...query, seriesById }
}
