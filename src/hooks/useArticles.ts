import type { ArchiveFilters, ArticlesPage } from '@/types/archive'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-fetch'
import { filtersToQueryString } from '@/hooks/useFilters'

export const ARTICLES_QUERY_KEY = (filters: ArchiveFilters) => ['articles', filters] as const

const fetchArticles = async (filters: ArchiveFilters): Promise<ArticlesPage> => {
  const qs = filtersToQueryString(filters)
  const response = await apiFetch(`/api/articles${qs ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export const useArticles = (filters: ArchiveFilters) =>
  useQuery({
    queryKey: ARTICLES_QUERY_KEY(filters),
    queryFn: () => fetchArticles(filters),
    // Keeps the previous results on screen while a new filter loads.
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
