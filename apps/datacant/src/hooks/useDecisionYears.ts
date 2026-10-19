import type { Filters } from '@/types/filters'
import type { LangSuffix } from '@/i18n'
import type { YearCount } from '@eddb/showcase-kit/year-timeline'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'
import { buildWhere, fetchDecisionIdsForKeywords } from '@/hooks/useDecisions'

// The base is small (a few hundred decisions): the timeline asks for the
// dates of every matching decision and counts them by year.
const fetchYears = async (where: string): Promise<YearCount[]> => {
  const params = new URLSearchParams({ fields: 'Date', limit: '1000' })
  if (where) params.set('where', where)
  const response = await apiFetch(`/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${params}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  const counts = new Map<number, number>()
  for (const r of (data.list ?? []) as Record<string, unknown>[]) {
    const year = Number(String(r.Date ?? '').slice(0, 4))
    if (year) counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()].map(([year, count]) => ({ year, count })).sort((a, b) => a.year - b.year)
}

const fetchFilteredYears = async (filters: Filters, langSuffix: LangSuffix): Promise<YearCount[]> => {
  let ids: string[] | undefined
  if (filters.keywords.length > 0) {
    ids = await fetchDecisionIdsForKeywords(filters.keywords)
    if (ids.length === 0) return []
  }
  return fetchYears(buildWhere(filters, langSuffix, ids, false))
}

// Counts by year of the decisions matching every filter but the period, and
// the span of the whole base for a stable axis.
export const useDecisionYears = (filters: Filters) => {
  const { langSuffix } = useLanguage()
  const counting = { ...filters, from: '', to: '', page: 1, sortDir: 'desc' as const }

  const all = useQuery({
    queryKey: ['decision-years', 'all'] as const,
    queryFn: () => fetchYears(''),
    staleTime: 30 * 60 * 1000,
  })
  const filtered = useQuery({
    queryKey: ['decision-years', counting, langSuffix] as const,
    queryFn: () => fetchFilteredYears(counting, langSuffix),
    staleTime: 10 * 60 * 1000,
  })

  const span = all.data ?? []
  return {
    years: filtered.data,
    min: span.length ? span[0].year : 0,
    max: span.length ? span[span.length - 1].year : 0,
  }
}
