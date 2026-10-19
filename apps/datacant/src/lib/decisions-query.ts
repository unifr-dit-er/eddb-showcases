/**
 * Filtering, sorting, pagination and counts over the in-memory base.
 * Pure functions, shared by the route handlers.
 */
import type { LangSuffix } from '@/i18n'
import type {
  CountedValue,
  Decision,
  DecisionsPage,
  Facets,
  StoredDecision,
  YearCount,
} from '@/types/decision'
import type { Filters } from '@/types/filters'
import { DEFAULT_FILTERS } from '@/types/filters'
import type { DecisionStore } from '@/lib/decisions-store'
import { PAGE_SIZE } from '@/lib/decisions-config'
import { CANTONS } from '@/lib/cantons'
import { normalize } from '@eddb/showcase-kit/text'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const CANTON_CODES = new Set(CANTONS.map((c) => c.code))

export const parseFilters = (params: URLSearchParams): Filters => {
  const page = Number(params.get('page') ?? '1')
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const canton = params.get('canton') ?? ''
  return {
    ...DEFAULT_FILTERS,
    q: (params.get('q') ?? '').trim(),
    canton: CANTON_CODES.has(canton) ? canton : '',
    keywords: params.getAll('keyword').filter(Boolean),
    from: ISO_DATE.test(from) ? from : '',
    to: ISO_DATE.test(to) ? to : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sortDir: params.get('sort') === 'asc' ? 'asc' : 'desc',
  }
}

export const parseLang = (params: URLSearchParams): LangSuffix =>
  params.get('lang') === 'de' ? 'DE' : 'FR'

const haystacks = new WeakMap<StoredDecision, Partial<Record<LangSuffix, string>>>()

// Title, abstract and keywords of a decision, in one language.
const haystackOf = (d: StoredDecision, store: DecisionStore, lang: LangSuffix): string => {
  const cached = haystacks.get(d) ?? {}
  if (cached[lang] === undefined) {
    cached[lang] = normalize(
      [
        d.title[lang],
        d.abstract[lang],
        ...d.keywordIds.map((id) => store.keywordsById.get(id)?.label[lang] ?? ''),
      ].join(' \n ')
    )
    haystacks.set(d, cached)
  }
  return cached[lang]
}

// `ignorePeriod` keeps the period out of the filter, for the timeline.
export const filterDecisions = (
  store: DecisionStore,
  filters: Filters,
  lang: LangSuffix,
  ignorePeriod = false
): StoredDecision[] => {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean)
  return store.decisions.filter((d) => {
    if (filters.canton && d.canton !== filters.canton) return false
    // Keywords narrow the results: a decision must carry all of them.
    if (filters.keywords.some((k) => !d.keywordIds.includes(k))) return false
    if (!ignorePeriod) {
      if (filters.from && d.date < filters.from) return false
      if (filters.to && d.date > filters.to) return false
    }
    if (terms.length > 0) {
      const haystack = haystackOf(d, store, lang)
      if (!terms.every((t) => haystack.includes(t))) return false
    }
    return true
  })
}

// Equal dates fall back on the title.
export const sortDecisions = (
  decisions: StoredDecision[],
  dir: 'asc' | 'desc',
  lang: LangSuffix
): StoredDecision[] =>
  [...decisions].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date)
    if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
    return a.title[lang].localeCompare(b.title[lang])
  })

export const localize = (d: StoredDecision, store: DecisionStore, lang: LangSuffix): Decision => ({
  id: d.id,
  title: d.title[lang],
  abstract: d.abstract[lang],
  canton: d.canton,
  date: d.date,
  hasPdf: d.hasPdf,
  keywords: d.keywordIds.flatMap((id) => {
    const kw = store.keywordsById.get(id)
    if (!kw) return []
    return [{ id, label: kw.label[lang], category: store.categories.get(kw.categoryId)?.[lang] ?? '' }]
  }),
})

export const countYears = (decisions: StoredDecision[]): YearCount[] => {
  const counts = new Map<number, number>()
  for (const d of decisions) {
    const year = Number(d.date.slice(0, 4))
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()].map(([year, count]) => ({ year, count })).sort((a, b) => a.year - b.year)
}

export const queryDecisions = (store: DecisionStore, filters: Filters, lang: LangSuffix): DecisionsPage => {
  const matches = sortDecisions(filterDecisions(store, filters, lang), filters.sortDir, lang)
  const totalRows = matches.length
  const lastPage = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const page = Math.min(filters.page, lastPage)
  const start = (page - 1) * PAGE_SIZE
  return {
    list: matches.slice(start, start + PAGE_SIZE).map((d) => localize(d, store, lang)),
    pageInfo: {
      totalRows,
      page,
      pageSize: PAGE_SIZE,
      isFirstPage: page === 1,
      isLastPage: page === lastPage,
    },
    years: countYears(filterDecisions(store, filters, lang, true)),
  }
}

/**
 * Counts for the filters, given the active ones. Cantons count against
 * every other filter but not the canton, so the user can switch from one
 * canton to another. Keywords, combined with "and", count against every
 * filter, keywords included: the number of decisions left if one is added.
 * The year range is the base's, for a stable timeline axis.
 */
export const computeFacets = (
  store: DecisionStore,
  filters: Filters = DEFAULT_FILTERS,
  lang: LangSuffix = 'FR'
): Facets => {
  const matching = filterDecisions(store, filters, lang)
  const byCanton = filterDecisions(store, { ...filters, canton: '' }, lang)

  const cantonCounts = new Map<string, number>()
  for (const d of byCanton) cantonCounts.set(d.canton, (cantonCounts.get(d.canton) ?? 0) + 1)
  const cantons: CountedValue[] = CANTONS.map((c) => ({ value: c.code, count: cantonCounts.get(c.code) ?? 0 }))

  const keywordCounts = new Map<string, number>()
  for (const d of matching) for (const id of d.keywordIds) keywordCounts.set(id, (keywordCounts.get(id) ?? 0) + 1)

  const years = store.decisions.map((d) => Number(d.date.slice(0, 4)))

  return {
    total: matching.length,
    cantons,
    keywords: store.keywords.map((kw) => ({
      id: kw.id,
      label: kw.label[lang],
      category: store.categories.get(kw.categoryId)?.[lang] ?? '',
      count: keywordCounts.get(kw.id) ?? 0,
    })),
    years: {
      min: years.length ? Math.min(...years) : 0,
      max: years.length ? Math.max(...years) : 0,
    },
  }
}
