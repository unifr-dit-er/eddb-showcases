/**
 * NocoDB tables of the Datacant base, and the only fields this app reads.
 * Server-side only (route handlers and src/lib/decisions-*.ts).
 */
export const NOCODB_TABLES = {
  DECISIONS: 'merxbxhfvr09g66',
  KEYWORDS: 'mp7ev44j9pdsyxs',
  CATEGORIES: 'mpqb34djokcbpcy',
  // Junction table of the Decisions <-> Keywords many-to-many relationship.
  DECISIONS_KEYWORDS: 'm4g9te8g00mpzkl',
} as const

// Whitelist: anything else in the base never reaches the app. The
// attachment is read only to know whether a decision has a PDF; its link,
// signed for a couple of hours, is fetched afresh on each download.
export const DECISION_FIELDS = [
  'Id',
  'DescriptionFR',
  'DescriptionDE',
  'AbstractFR',
  'AbstractDE',
  'Canton',
  'Date',
  'Attachment',
] as const

export const KEYWORD_FIELDS = ['Id', 'KeywordFR', 'KeywordDE', 'Categories_id'] as const

export const CATEGORY_FIELDS = ['Id', 'CategoryFR', 'CategoryDE'] as const

export const LINK_FIELDS = ['Decisions_id', 'Keywords_id'] as const

export const PAGE_SIZE = 25

// An hour of cache only delays corrections made in NocoDB.
export const STORE_TTL_MS = 60 * 60 * 1000
