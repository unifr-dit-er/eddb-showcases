export interface Filters {
  q: string
  canton: string
  keywords: string[]
  from: string
  to: string
  page: number
  sortDir: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  canton: '',
  keywords: [],
  from: '',
  to: '',
  page: 1,
  sortDir: 'desc',
}
