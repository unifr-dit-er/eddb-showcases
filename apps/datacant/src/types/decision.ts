import type { LangSuffix } from '@/i18n'
import type { Keyword, KeywordFacet } from './keyword'

// A decision as the client sees it, in one language.
export interface Decision {
  id: string
  title: string
  abstract: string
  canton: string
  date: string
  keywords: Keyword[]
  hasPdf: boolean
}

export interface PageInfo {
  totalRows: number
  page: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface YearCount {
  year: number
  count: number
}

export interface CountedValue {
  value: string
  count: number
}

export interface DecisionsPage {
  list: Decision[]
  pageInfo: PageInfo
  // Matching decisions by year, every filter but the period (timeline).
  years: YearCount[]
}

export interface Facets {
  total: number
  // Every canton, counted against every filter but the canton.
  cantons: CountedValue[]
  // Every keyword, counted against every filter (keywords combine with "and").
  keywords: KeywordFacet[]
  // Span of the whole base, for a stable timeline axis.
  years: { min: number; max: number }
}

// Server side: the base held in memory, in both languages.
export type Localized = Record<LangSuffix, string>

export interface StoredDecision {
  id: string
  title: Localized
  abstract: Localized
  canton: string
  date: string
  hasPdf: boolean
  keywordIds: string[]
}

export interface StoredKeyword {
  id: string
  label: Localized
  categoryId: string
}
