/**
 * From NocoDB records (whitelisted fields) to the in-memory base.
 */
import type { Localized, StoredDecision, StoredKeyword } from '@/types/decision'

type NocoDBRecord = Record<string, unknown>

const text = (value: unknown): string => (value == null ? '' : String(value).trim())

const localized = (record: NocoDBRecord, field: string): Localized => ({
  FR: text(record[`${field}FR`]),
  DE: text(record[`${field}DE`]),
})

export const mapDecision = (record: NocoDBRecord, keywordIds: string[] = []): StoredDecision => ({
  id: text(record.Id),
  title: localized(record, 'Description'),
  abstract: localized(record, 'Abstract'),
  canton: text(record.Canton),
  date: text(record.Date).slice(0, 10),
  hasPdf: Array.isArray(record.Attachment) && record.Attachment.length > 0,
  keywordIds,
})

export const mapKeyword = (record: NocoDBRecord): StoredKeyword => ({
  id: text(record.Id),
  label: localized(record, 'Keyword'),
  categoryId: text(record.Categories_id),
})

export const mapCategory = (record: NocoDBRecord): { id: string; label: Localized } => ({
  id: text(record.Id),
  label: localized(record, 'Category'),
})

// Keyword ids of each decision, from the junction table.
export const groupLinks = (links: NocoDBRecord[]): Map<string, string[]> => {
  const byDecision = new Map<string, string[]>()
  for (const link of links) {
    const decisionId = text(link.Decisions_id)
    const keywordId = text(link.Keywords_id)
    if (!decisionId || !keywordId) continue
    const ids = byDecision.get(decisionId) ?? []
    if (!ids.includes(keywordId)) ids.push(keywordId)
    byDecision.set(decisionId, ids)
  }
  return byDecision
}

// The first PDF of an attachment field, as a link relative to NocoDB.
export const attachmentPath = (record: NocoDBRecord): string => {
  const first = Array.isArray(record.Attachment) ? (record.Attachment[0] as NocoDBRecord | undefined) : undefined
  if (!first) return ''
  return text(first.signedUrl) || text(first.url) || text(first.signedPath)
}
