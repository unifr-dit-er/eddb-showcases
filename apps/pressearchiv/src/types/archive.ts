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

// Each series held a press and a documents sub-collection in the original
// base; the sub-series were dropped in NocoDB and are derived again from the
// record type.
export type Collection = 'press' | 'documents'

export interface Series {
  id: string
  titleDE: string
  titleFR: string
  // "CH: Presse" and "CH: Graue Literatur" cover the whole of Switzerland.
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
  collection: Collection
  languages: string[]
  seriesId: string
  keywords: string[]
  // Opening lines of the article, as recorded in the archive.
  teaser: string
}

export interface Article extends ArticleSummary {
  url: string
  internalNo: string
}

export interface CountedValue {
  value: string
  count: number
}

export interface SeriesFacet extends Series {
  press: number
  documents: number
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
  collection: '' | Collection
  journal: string
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
  collection: '',
  journal: '',
  keywords: [],
  language: '',
  from: '',
  to: '',
  page: 1,
  sortDir: 'desc',
}
