import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import type { LangSuffix } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'
import { useLanguage } from '@/contexts/LanguageContext'
import { apiFetch } from '@eddb/showcase-kit/api-fetch'
export const DECISIONS_QUERY_KEY = (filters: Filters, langSuffix: LangSuffix) =>
  ['decisions', filters, langSuffix] as const

const PAGE_SIZE = 25

// NocoDB `where` of the filters; `withPeriod: false` leaves the period out
// (timeline counts).
export const buildWhere = (
  filters: Filters,
  langSuffix: LangSuffix,
  decisionIds?: string[],
  withPeriod = true
): string => {
  const conditions: string[] = []
  if (filters.q) conditions.push(`((Description${langSuffix},like,%${filters.q}%)~or(Abstract${langSuffix},like,%${filters.q}%))`)
  if (filters.canton) conditions.push(`(Canton,eq,${filters.canton})`)
  if (withPeriod && filters.from) conditions.push(`(Date,ge,exactDate,${filters.from})`)
  if (withPeriod && filters.to) conditions.push(`(Date,le,exactDate,${filters.to})`)
  if (decisionIds) conditions.push(`(Id,in,${decisionIds.join(',')})`)
  return conditions.join('~and')
}

const buildQueryString = (
  filters: Filters,
  langSuffix: LangSuffix,
  decisionIds?: string[]
): string => {
  const params = new URLSearchParams()
  const where = buildWhere(filters, langSuffix, decisionIds)

  if (where) params.set('where', where)
  params.set('limit', String(PAGE_SIZE))
  params.set('offset', String((filters.page - 1) * PAGE_SIZE))
  params.set('sort', filters.sortDir === 'asc' ? 'Date' : '-Date')

  return params.toString()
}

export const fetchDecisionIdsForKeywords = async (keywordIds: string[]): Promise<string[]> => {
  const params = new URLSearchParams({
    where: `(Keywords_id,in,${keywordIds.join(',')})`,
    limit: '1000',
    fields: 'Decisions_id',
  })
  const response = await apiFetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS_KEYWORDS}/records?${params}`
  )
  if (!response.ok) throw new Error('Failed to fetch keyword-decision links')
  const data = await response.json()
  const ids = (data.list ?? []).map((r: Record<string, unknown>) => String(r.Decisions_id))
  return [...new Set(ids)] as string[]
}

const fetchDecisions = async (
  filters: Filters,
  langSuffix: LangSuffix
): Promise<NocoDBListResponse<Decision>> => {
  let decisionIds: string[] | undefined

  if (filters.keywords.length > 0) {
    decisionIds = await fetchDecisionIdsForKeywords(filters.keywords)
    if (decisionIds.length === 0) {
      return {
        list: [],
        pageInfo: { totalRows: 0, page: filters.page, pageSize: PAGE_SIZE, isFirstPage: true, isLastPage: true },
      }
    }
  }

  const qs = buildQueryString(filters, langSuffix, decisionIds)
  const response = await apiFetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP ${response.status}`)
  }
  const data = await response.json()

  return {
    list: (data.list ?? []).map((r: Record<string, unknown>) => mapDecision(r, langSuffix)),
    pageInfo: data.pageInfo,
  }
}

export const useDecisions = (filters: Filters) => {
  const { langSuffix } = useLanguage()

  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters, langSuffix),
    queryFn: () => fetchDecisions(filters, langSuffix),
    staleTime: 5 * 60 * 1000,
  })
}
