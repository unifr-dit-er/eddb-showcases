import type { Facets, SeriesFacet } from '@/types/archive'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-fetch'
import { useMemo } from 'react'

export const FACETS_QUERY_KEY = ['facets'] as const

const fetchFacets = async (): Promise<Facets> => {
  const response = await apiFetch('/api/facets')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export const useFacets = () => {
  const query = useQuery({
    queryKey: FACETS_QUERY_KEY,
    queryFn: fetchFacets,
    staleTime: 60 * 60 * 1000,
  })

  const seriesById = useMemo(
    () => new Map<string, SeriesFacet>((query.data?.series ?? []).map((s) => [s.id, s])),
    [query.data]
  )

  return { ...query, seriesById }
}
