/**
 * Filtering, sorting, pagination and counts over the in-memory archive.
 * Pure functions, shared by the route handlers.
 */
import type {
  ArchiveFilters,
  Article,
  ArticlesPage,
  ArticleSummary,
  CountedValue,
  Facets,
  Series,
} from '@/types/archive'
import { DEFAULT_FILTERS } from '@/types/archive'
import { PAGE_SIZE } from '@/lib/archive-config'
import { normalize } from '@/lib/text'

export { normalize }

const YEAR = /^\d{4}$/

export const parseFilters = (params: URLSearchParams): ArchiveFilters => {
  const page = Number(params.get('page') ?? '1')
  const collection = params.get('collection')
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  return {
    ...DEFAULT_FILTERS,
    q: (params.get('q') ?? '').trim(),
    series: params.get('series') ?? '',
    collection: collection === 'press' || collection === 'documents' ? collection : '',
    journal: params.get('journal') ?? '',
    keywords: params.getAll('keyword').filter(Boolean),
    language: params.get('lang') ?? '',
    from: YEAR.test(from) ? from : '',
    to: YEAR.test(to) ? to : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sortDir: params.get('sort') === 'asc' ? 'asc' : 'desc',
  }
}

const haystacks = new WeakMap<Article, string>()

const haystackOf = (article: Article): string => {
  let value = haystacks.get(article)
  if (value === undefined) {
    value = normalize(
      [
        article.title,
        article.teaser,
        article.journal,
        ...article.authors.map((a) => a.name),
        ...article.keywords,
      ].join(' \n ')
    )
    haystacks.set(article, value)
  }
  return value
}

const yearOf = (article: Article): number | null =>
  article.date ? Number(article.date.slice(0, 4)) : null

// `ignoreYears` keeps the period out of the filter, for the timeline.
export const filterArticles = (
  articles: Article[],
  filters: ArchiveFilters,
  ignoreYears = false
): Article[] => {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean)
  const from = filters.from ? Number(filters.from) : null
  const to = filters.to ? Number(filters.to) : null

  return articles.filter((a) => {
    if (filters.series && a.seriesId !== filters.series) return false
    if (filters.collection && a.collection !== filters.collection) return false
    if (filters.journal && a.journal !== filters.journal) return false
    if (filters.language && !a.languages.includes(filters.language)) return false
    // Keywords narrow the results: an article must carry all of them.
    if (filters.keywords.some((k) => !a.keywords.includes(k))) return false
    if (!ignoreYears && (from !== null || to !== null)) {
      const year = yearOf(a)
      if (year === null) return false
      if (from !== null && year < from) return false
      if (to !== null && year > to) return false
    }
    if (terms.length > 0) {
      const haystack = haystackOf(a)
      if (!terms.every((t) => haystack.includes(t))) return false
    }
    return true
  })
}

// Undated records always come last; equal dates fall back on the title.
export const sortArticles = (articles: Article[], dir: 'asc' | 'desc'): Article[] =>
  [...articles].sort((a, b) => {
    if (!a.date || !b.date) {
      if (a.date === b.date) return a.title.localeCompare(b.title)
      return a.date ? -1 : 1
    }
    const cmp = a.date.localeCompare(b.date)
    if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
    return a.title.localeCompare(b.title)
  })

// The list leaves out the link and the archive number, read in the detail panel.
export const toSummary = (a: Article): ArticleSummary => ({
  id: a.id,
  title: a.title,
  date: a.date,
  journal: a.journal,
  authors: a.authors,
  recordType: a.recordType,
  collection: a.collection,
  languages: a.languages,
  seriesId: a.seriesId,
  keywords: a.keywords,
  teaser: a.teaser,
})

const countBy = (values: Iterable<string>): CountedValue[] => {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export const countYears = (articles: Article[]): { year: number; count: number }[] => {
  const counts = new Map<number, number>()
  for (const a of articles) {
    const y = yearOf(a)
    if (y !== null) counts.set(y, (counts.get(y) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year)
}

export const queryArticles = (articles: Article[], filters: ArchiveFilters): ArticlesPage => {
  const matches = sortArticles(filterArticles(articles, filters), filters.sortDir)
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
    years: countYears(filterArticles(articles, filters, true)),
  }
}

export const computeFacets = (articles: Article[], series: Series[]): Facets => {
  const years = articles.map(yearOf).filter((y): y is number => y !== null)
  return {
    total: articles.length,
    series: series.map((s) => ({
      ...s,
      press: articles.filter((a) => a.seriesId === s.id && a.collection === 'press').length,
      documents: articles.filter((a) => a.seriesId === s.id && a.collection === 'documents').length,
    })),
    journals: countBy(articles.map((a) => a.journal)),
    keywords: countBy(articles.flatMap((a) => a.keywords)),
    languages: countBy(articles.flatMap((a) => a.languages)),
    recordTypes: countBy(articles.map((a) => a.recordType)),
    years: {
      min: years.length ? Math.min(...years) : 0,
      max: years.length ? Math.max(...years) : 0,
    },
  }
}
