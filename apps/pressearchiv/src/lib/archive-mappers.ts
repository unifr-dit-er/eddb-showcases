import type { Article, Author, Series } from '@/types/archive'
import { NATIONAL_SERIES_PREFIX } from '@/lib/archive-config'

type NocoDBRecord = Record<string, unknown>

const text = (value: unknown): string =>
  value == null ? '' : String(value).trim()

// Multi-valued fields are joined by " | " in the source export.
export const splitMulti = (value: unknown): string[] =>
  text(value)
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean)

// `date_start` holds "YYYY/MM/DD"; `date_readable`, a NocoDB date, swaps day
// and month for part of the records and is not used.
export const parseDate = (value: unknown): string => {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(text(value))
  if (!match) return ''
  const [, y, m, d] = match
  if (Number(m) < 1 || Number(m) > 12 || Number(d) < 1 || Number(d) > 31) return ''
  return `${y}-${m}-${d}`
}

const mapAuthors = (record: NocoDBRecord): Author[] => {
  const names = splitMulti(record.authors)
  const roles = splitMulti(record.creator_roles)
  return names.map((name, i) => ({ name, role: roles[i] ?? '' }))
}

// The foreign key may come as `Series_id`, or only through the link field.
const seriesIdOf = (record: NocoDBRecord): string => {
  if (record.Series_id != null) return text(record.Series_id)
  const link = record.Series
  if (link && typeof link === 'object' && !Array.isArray(link)) {
    return text((link as NocoDBRecord).Id ?? (link as NocoDBRecord).id)
  }
  return ''
}

export const isPublic = (record: NocoDBRecord): boolean =>
  text(record.ok_for_public).toUpperCase() === 'YES'

export const mapArticle = (record: NocoDBRecord): Article => ({
  id: text(record.Id ?? record.id),
  internalNo: text(record.internal_no),
  title: text(record.title),
  date: parseDate(record.date_start),
  journal: text(record.journal),
  authors: mapAuthors(record),
  recordType: text(record.record_level),
  languages: splitMulti(record.language_codes),
  seriesId: seriesIdOf(record),
  keywords: [...new Set(splitMulti(record.key_words))],
  teaser: text(record.teaser_text),
  url: text(record.url),
})

export const mapSeries = (record: NocoDBRecord): Series => {
  const titleDE = text(record.title_ger)
  return {
    id: text(record.Id ?? record.id),
    titleDE,
    titleFR: text(record.title_fre) || titleDE,
    national: titleDE.startsWith(NATIONAL_SERIES_PREFIX),
  }
}
