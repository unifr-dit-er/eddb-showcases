import type { Article } from '@/types/archive'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-fetch'

export const ARTICLE_QUERY_KEY = (id: string | null) => ['article', id] as const

const fetchArticle = async (id: string): Promise<Article> => {
  const response = await apiFetch(`/api/articles/${encodeURIComponent(id)}`)
  if (!response.ok) throw new Error(`Failed to fetch article ${id}`)
  return response.json()
}

export const useArticle = (id: string | null) =>
  useQuery({
    queryKey: ARTICLE_QUERY_KEY(id),
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
