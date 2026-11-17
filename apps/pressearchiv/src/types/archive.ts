/**
 * Shapes of the press archive as exposed by the app's own API routes.
 * Only public metadata appears here: never `full_text`, PDF fields or
 * administrative columns of the NocoDB base.
 */

// `record_level` values of the source base (StarText export).
export type RecordType =
  | 'Newspaper article'
  | 'Magazine article'
  | 'Journal article'
  | 'Audio recording'
  | 'Film'
  | 'Website'
  | 'Blog post'
  | 'Document'
  | 'Report'
  | 'Bill'
  | 'Book'
  | 'Presentation'
  | 'publication'

export interface Series {
  id: string
  titleDE: string
  titleFR: string
  titleIT: string
  titleEN: string
  // "CH: Presse" and "CH: Graue Literatur" cover the whole of Switzerland;
  // they come first in the series filter.
  national: boolean
}

export interface Author {
  name: string
  role: string
}

export interface ArticleSummary {
  id: string
  title: string
  // ISO date (YYYY-MM-DD), or '' when unknown.
  date: string
  journal: string
  authors: Author[]
  recordType: string
  languages: string[]
  seriesId: string
  keywords: string[]
  // Opening lines of the article, as recorded in the archive.
  teaser: string
}

// What the detail panel reads.
export interface ArticleDetail extends ArticleSummary {
  url: string
  internalNo: string
}

export interface Article extends ArticleDetail {
  // The keywords in every language of the thesaurus, for the text search;
  // never sent to the client.
  keywordTerms: string[]
}

// A keyword (its `en` form, as stored in `key_words`) in the four languages
// of the interface, from the thesaurus; a missing translation falls back on it.
export interface KeywordLabels {
  en: string
  de: string
  fr: string
  it: string
}

export interface ThesaurusTerm extends KeywordLabels {
  hidden: boolean
}

export interface CountedValue {
  value: string
  count: number
}

export interface SeriesFacet extends Series {
  count: number
}

export interface Facets {
  total: number
  series: SeriesFacet[]
  journals: CountedValue[]
  keywords: CountedValue[]
  languages: CountedValue[]
  recordTypes: CountedValue[]
  years: { min: number; max: number }
}

export interface PageInfo {
  totalRows: number
  page: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface ArticlesPage {
  list: ArticleSummary[]
  pageInfo: PageInfo
  // Distribution by year of the current results, year filter excluded, so
  // the timeline keeps showing where the rest of the matches lie.
  years: { year: number; count: number }[]
}

export interface ArchiveFilters {
  q: string
  series: string
  // record_level values; a record matches if it has any of them.
  types: string[]
  // Sources; a record matches if it comes from any of them.
  journals: string[]
  keywords: string[]
  language: string
  from: string
  to: string
  page: number
  sortDir: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: ArchiveFilters = {
  q: '',
  series: '',
  types: [],
  journals: [],
  keywords: [],
  language: '',
  from: '',
  to: '',
  page: 1,
  sortDir: 'desc',
}
