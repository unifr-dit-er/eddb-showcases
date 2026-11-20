import type { RepresentationDetail } from '@/types/collection'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'

export const ITEM_QUERY_KEY = (id: string | null) => ['item', id] as const

// No published record with this id: not retried, the panel says so.
export class ItemNotFoundError extends Error {}

const fetchItem = async (id: string): Promise<RepresentationDetail> => {
  const response = await apiFetch(`/api/items/${encodeURIComponent(id)}`)
  if (response.status === 404) throw new ItemNotFoundError(`No published record ${id}`)
  if (!response.ok) throw new Error(`Failed to fetch record ${id}`)
  return response.json()
}

export const useItem = (id: string | null) =>
  useQuery({
    queryKey: ITEM_QUERY_KEY(id),
    queryFn: () => fetchItem(id!),
    enabled: !!id,
    retry: (failureCount, error) => !(error instanceof ItemNotFoundError) && failureCount < 3,
    staleTime: 30 * 60 * 1000,
  })
