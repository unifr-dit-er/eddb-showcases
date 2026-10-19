import type { Decision } from '@/types/decision'
import type { Locale } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'

export const DECISION_QUERY_KEY = (id: string | null, locale: Locale) => ['decision', id, locale] as const

const fetchDecision = async (id: string, locale: Locale): Promise<Decision> => {
  const response = await apiFetch(`/api/decisions/${encodeURIComponent(id)}?lang=${locale}`)
  if (!response.ok) throw new Error(`Failed to fetch decision ${id}`)
  return response.json()
}

export const useDecision = (id: string | null) => {
  const { locale } = useLanguage()
  return useQuery({
    queryKey: DECISION_QUERY_KEY(id, locale),
    queryFn: () => fetchDecision(id!, locale),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}
