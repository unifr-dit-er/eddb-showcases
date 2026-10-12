/**
 * NocoDB tables of the "Pressearchiv Public" base: a copy of the archive
 * without the copyrighted full texts, the only base this app reads.
 * Server-side only (route handlers and src/lib/archive-*.ts).
 */
export const NOCODB_TABLES = {
  ARTICLES: 'mp4j2pa1lhvi78j',
  SERIES: 'm8v65j6m9rjy1bh',
} as const

// Whitelist of the fields read from NocoDB. Anything else (pdf_filename,
// pdf_path, archivists' fields…) never reaches the app, even if the base
// were to gain sensitive columns again.
export const ARTICLE_FIELDS = [
  'Id',
  'internal_no',
  'record_level',
  'title',
  'date_start',
  'authors',
  'creator_roles',
  'journal',
  'teaser_text',
  'key_words',
  'language_codes',
  'url',
  'Series_id',
  'Series',
  'ok_for_public',
] as const

export const SERIES_FIELDS = ['Id', 'internal_no', 'title_ger', 'title_fre'] as const

// Series that cover the whole of Switzerland rather than one canton.
export const NATIONAL_SERIES_PREFIX = 'CH:'

// Record types filed in the documents collection of a series; every other
// type belongs to the press collection (to be confirmed by the institute).
export const DOCUMENT_TYPES = new Set([
  'Document',
  'Report',
  'Bill',
  'Book',
  'Presentation',
  'publication',
])

export const PAGE_SIZE = 25

// The archive no longer grows: an hour of cache only delays corrections.
export const ARCHIVE_TTL_MS = 60 * 60 * 1000
