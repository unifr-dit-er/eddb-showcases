import type { RepresentationDetail } from '@/types/collection'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'

export const ITEM_QUERY_KEY = (id: string | null) => ['item', id] as const

const fetchItem = async (id: string): Promise<RepresentationDetail> => {
  const response = await apiFetch(`/api/items/${encodeURIComponent(id)}`)
  if (!response.ok) throw new Error(`Failed to fetch record ${id}`)
  return response.json()
}

export const useItem = (id: string | null) =>
  useQuery({
    queryKey: ITEM_QUERY_KEY(id),
    queryFn: () => fetchItem(id!),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
