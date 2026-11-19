/**
 * Shapes of the Callisto collection as exposed by the app's own API routes.
 * Only public metadata appears here: never the images (their rights are not
 * cleared) nor the administrative columns of the NocoDB base.
 */

export interface RepresentationSummary {
  id: string
  title: string
  // Years, negative before the common era; null when unknown.
  dateFrom: number | null
  dateTo: number | null
  period: string
  material: string
  category: string
  form: string
  subjects: string[]
  // Opening of the description, for the list.
  excerpt: string
}

// What the detail panel reads.
export interface RepresentationDetail extends Omit<RepresentationSummary, 'excerpt'> {
  description: string
  dimensions: string
  discoveryPlace: string
  conservationPlace: string
  productionCentre: string
  sources: string
  bibliography: string
}

export type Representation = RepresentationDetail

export interface CountedValue {
  value: string
  count: number
}

export interface Facets {
  total: number
  periods: CountedValue[]
  materials: CountedValue[]
  categories: CountedValue[]
  forms: CountedValue[]
  subjects: CountedValue[]
  centres: CountedValue[]
  years: { min: number; max: number }
}

export interface PageInfo {
  totalRows: number
  page: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface RepresentationsPage {
  list: RepresentationSummary[]
  pageInfo: PageInfo
  // Distribution by starting year of the current results, period filter
  // excluded, so the timeline keeps showing where the rest of the matches lie.
  years: { year: number; count: number }[]
}

export type SortKey = 'number' | 'title' | 'date'

export interface CollectionFilters {
  q: string
  // Single-valued fields: a record matches if it has any of the values.
  periods: string[]
  materials: string[]
  categories: string[]
  forms: string[]
  centres: string[]
  // Subjects narrow the results: a record must carry all of them.
  subjects: string[]
  // Starting years (negative before the common era), '' when open.
  from: string
  to: string
  page: number
  sort: SortKey
  sortDir: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: CollectionFilters = {
  q: '',
  periods: [],
  materials: [],
  categories: [],
  forms: [],
  centres: [],
  subjects: [],
  from: '',
  to: '',
  page: 1,
  sort: 'number',
  sortDir: 'asc',
}
