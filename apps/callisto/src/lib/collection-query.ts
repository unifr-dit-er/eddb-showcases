/**
 * Filtering, sorting, pagination and counts over the in-memory collection.
 * Pure functions, shared by the route handlers.
 */
import { linkLabels } from '@eddb/showcase-kit/text'
import type {
  CollectionFilters,
  CountedValue,
  Facets,
  Representation,
  RepresentationDetail,
  RepresentationsPage,
  RepresentationSummary,
  SortKey,
} from '@/types/collection'
import { DEFAULT_FILTERS } from '@/types/collection'
import { EXCERPT_LENGTH, PAGE_SIZE } from '@/lib/collection-config'
import { normalize } from '@eddb/showcase-kit/text'

export { normalize }

// A year, possibly negative (before the common era).
const YEAR = /^-?\d{1,4}$/
const SORT_KEYS: readonly SortKey[] = ['number', 'title', 'date']

export const parseFilters = (params: URLSearchParams): CollectionFilters => {
  const page = Number(params.get('page') ?? '1')
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const sort = params.get('sort') as SortKey
  const all = (name: string) => params.getAll(name).filter(Boolean)
  return {
    ...DEFAULT_FILTERS,
    q: (params.get('q') ?? '').trim(),
    periods: all('period'),
    materials: all('material'),
    categories: all('category'),
    forms: all('form'),
    centres: all('centre'),
    subjects: all('subject'),
    from: YEAR.test(from) ? from : '',
    to: YEAR.test(to) ? to : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sort: SORT_KEYS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
    sortDir: params.get('dir') === 'desc' ? 'desc' : 'asc',
  }
}

const haystacks = new WeakMap<Representation, string>()

// The free search covers what the former showcase searched field by field:
// title, description, places, production centre, sources and bibliography.
const haystackOf = (r: Representation): string => {
  let value = haystacks.get(r)
  if (value === undefined) {
    value = normalize(
      [
        r.title,
        r.description,
        r.form,
        ...r.subjects,
        r.discoveryPlace,
        r.conservationPlace,
        r.productionCentre,
        r.sources,
        r.bibliography,
      ].join(' \n ')
    )
    haystacks.set(r, value)
  }
  return value
}

const matchesAny = (selected: string[], value: string) => selected.length === 0 || selected.includes(value)

// `ignoreYears` keeps the period out of the filter, for the timeline.
export const filterRepresentations = (
  items: Representation[],
  filters: CollectionFilters,
  ignoreYears = false
): Representation[] => {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean)
  const from = filters.from ? Number(filters.from) : null
  const to = filters.to ? Number(filters.to) : null

  return items.filter((r) => {
    if (!matchesAny(filters.periods, r.period)) return false
    if (!matchesAny(filters.materials, r.material)) return false
    if (!matchesAny(filters.categories, r.category)) return false
    if (!matchesAny(filters.forms, r.form)) return false
    if (!matchesAny(filters.centres, r.productionCentre)) return false
    if (filters.subjects.some((s) => !r.subjects.includes(s))) return false
    if (!ignoreYears && (from !== null || to !== null)) {
      if (r.dateFrom === null) return false
      if (from !== null && r.dateFrom < from) return false
      if (to !== null && r.dateFrom > to) return false
    }
    if (terms.length > 0) {
      const haystack = haystackOf(r)
      if (!terms.every((t) => haystack.includes(t))) return false
    }
    return true
  })
}

const byNumber = (a: Representation, b: Representation) => Number(a.id) - Number(b.id)

// Undated records always come last whatever the direction; ties fall back
// on the record number.
export const sortRepresentations = (
  items: Representation[],
  sort: SortKey,
  dir: 'asc' | 'desc'
): Representation[] => {
  const sign = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    if (sort === 'date') {
      if (a.dateFrom === null || b.dateFrom === null) {
        if (a.dateFrom === b.dateFrom) return byNumber(a, b)
        return a.dateFrom === null ? 1 : -1
      }
      return sign * (a.dateFrom - b.dateFrom) || byNumber(a, b)
    }
    if (sort === 'title') return sign * a.title.localeCompare(b.title, 'fr') || byNumber(a, b)
    return sign * byNumber(a, b)
  })
}

// Links are reduced to their labels first: a card cannot hold a link, and a
// cut must never leave half of one.
export const excerptOf = (description: string): string => {
  const text = linkLabels(description)
  if (text.length <= EXCERPT_LENGTH) return text
  const cut = text.slice(0, EXCERPT_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : EXCERPT_LENGTH).trimEnd()}…`
}

// The list carries an excerpt of the description; the rest is read in the
// detail panel.
export const toSummary = (r: Representation): RepresentationSummary => ({
  id: r.id,
  title: r.title,
  dateFrom: r.dateFrom,
  dateTo: r.dateTo,
  period: r.period,
  material: r.material,
  category: r.category,
  form: r.form,
  subjects: r.subjects,
  excerpt: excerptOf(r.description),
})

export const toDetail = (r: Representation): RepresentationDetail => ({ ...r })

const countBy = (values: Iterable<string>): CountedValue[] => {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'fr'))
}

export const countYears = (items: Representation[]): { year: number; count: number }[] => {
  const counts = new Map<number, number>()
  for (const r of items) if (r.dateFrom !== null) counts.set(r.dateFrom, (counts.get(r.dateFrom) ?? 0) + 1)
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year)
}

export const queryRepresentations = (
  items: Representation[],
  filters: CollectionFilters
): RepresentationsPage => {
  const matches = sortRepresentations(filterRepresentations(items, filters), filters.sort, filters.sortDir)
  const totalRows = matches.length
  const lastPage = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const page = Math.min(filters.page, lastPage)
  const start = (page - 1) * PAGE_SIZE
  return {
    list: matches.slice(start, start + PAGE_SIZE).map(toSummary),
    pageInfo: {
      totalRows,
      page,
      pageSize: PAGE_SIZE,
      isFirstPage: page === 1,
      isLastPage: page === lastPage,
    },
    years: countYears(filterRepresentations(items, filters, true)),
  }
}

// Counts of `values`, in the order of `order` (zero kept): every value of
// the collection stays listed, greyed out when it has no match.
const countInOrder = (order: string[], values: string[]): CountedValue[] => {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return order.map((value) => ({ value, count: counts.get(value) ?? 0 }))
}

// Long lists (subjects) keep only values present in the results, most
// frequent first, plus the selected ones even when they fall to zero.
const countPresent = (values: string[], selected: string[]): CountedValue[] => {
  const counted = countBy(values)
  const missing = selected.filter((s) => !counted.some((c) => c.value === s))
  return [...counted, ...missing.map((value) => ({ value, count: 0 }))]
}

/**
 * Counts for the filters, given the active ones. Each single-valued filter
 * (combined with "or") counts its values against every other active filter
 * but not itself, so the user can add a second period or material.
 * Subjects, combined with "and", count against every filter, subjects
 * included. The year range is the collection's, for a stable timeline axis.
 */
export const computeFacets = (
  items: Representation[],
  filters: CollectionFilters = DEFAULT_FILTERS
): Facets => {
  const without = (changes: Partial<CollectionFilters>) => filterRepresentations(items, { ...filters, ...changes })
  const matching = filterRepresentations(items, filters)
  const years = items.map((r) => r.dateFrom).filter((y): y is number => y !== null)
  const facet = (key: 'periods' | 'materials' | 'categories' | 'forms' | 'centres', pick: (r: Representation) => string) =>
    countInOrder(
      countBy(items.map(pick)).map((c) => c.value),
      without({ [key]: [] }).map(pick)
    )

  return {
    total: matching.length,
    periods: facet('periods', (r) => r.period),
    materials: facet('materials', (r) => r.material),
    categories: facet('categories', (r) => r.category),
    forms: facet('forms', (r) => r.form),
    centres: facet('centres', (r) => r.productionCentre),
    subjects: countPresent(
      matching.flatMap((r) => r.subjects),
      filters.subjects
    ),
    years: {
      min: years.length ? Math.min(...years) : 0,
      max: years.length ? Math.max(...years) : 0,
    },
  }
}
