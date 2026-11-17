import type { KeywordLabels } from '@/types/archive'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCallback } from 'react'

const fetchKeywordLabels = async (): Promise<Record<string, KeywordLabels>> => {
  const response = await apiFetch('/api/keywords')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Label of a keyword in the viewer's language, from the thesaurus; the
// stored form until the labels are loaded, or when it has none.
export const useKeywordLabel = () => {
  const { locale } = useLanguage()
  const { data } = useQuery({
    queryKey: ['keyword-labels'],
    queryFn: fetchKeywordLabels,
    staleTime: 60 * 60 * 1000,
  })
  return useCallback((keyword: string) => data?.[keyword]?.[locale] || keyword, [data, locale])
}
