/**
 * In-memory copy of the Datacant base, loaded from NocoDB and refreshed every
 * hour. Use ONLY in route handlers (src/app/api/).
 *
 * The base is small (a few hundred decisions): holding it in memory lets the
 * routes filter, count and paginate in one place, and expose only
 * whitelisted fields, instead of a proxy to NocoDB.
 */
import type { Localized, StoredDecision, StoredKeyword } from '@/types/decision'
import { fetchAllRecords } from '@eddb/showcase-kit/nocodb'
import { cachedLoader } from '@eddb/showcase-kit/cached-loader'
import {
  CATEGORY_FIELDS,
  DECISION_FIELDS,
  KEYWORD_FIELDS,
  LINK_FIELDS,
  NOCODB_TABLES,
  STORE_TTL_MS,
} from '@/lib/decisions-config'
import { groupLinks, mapCategory, mapDecision, mapKeyword } from '@/lib/decisions-mappers'

type NocoDBRecord = Record<string, unknown>

export interface DecisionStore {
  decisions: StoredDecision[]
  decisionsById: Map<string, StoredDecision>
  keywords: StoredKeyword[]
  keywordsById: Map<string, StoredKeyword>
  categories: Map<string, Localized>
}

export const buildStore = (raw: {
  decisions: NocoDBRecord[]
  keywords: NocoDBRecord[]
  categories: NocoDBRecord[]
  links: NocoDBRecord[]
}): DecisionStore => {
  const links = groupLinks(raw.links)
  const keywords = raw.keywords.map(mapKeyword).filter((k) => k.id)
  const keywordsById = new Map(keywords.map((k) => [k.id, k]))
  const decisions = raw.decisions
    .map((r) => mapDecision(r, (links.get(String(r.Id)) ?? []).filter((id) => keywordsById.has(id))))
    .filter((d) => d.id && d.date)
  return {
    decisions,
    decisionsById: new Map(decisions.map((d) => [d.id, d])),
    keywords,
    keywordsById,
    categories: new Map(raw.categories.map(mapCategory).map((c) => [c.id, c.label])),
  }
}

// Always through the NocoDB API, in development as in production, so the
// app behaves the same with the same token.
export const getStore = cachedLoader(async () => {
  const [decisions, keywords, categories, links] = await Promise.all([
    fetchAllRecords(NOCODB_TABLES.DECISIONS, DECISION_FIELDS),
    fetchAllRecords(NOCODB_TABLES.KEYWORDS, KEYWORD_FIELDS),
    fetchAllRecords(NOCODB_TABLES.CATEGORIES, CATEGORY_FIELDS),
    fetchAllRecords(NOCODB_TABLES.DECISIONS_KEYWORDS, LINK_FIELDS),
  ])
  return buildStore({ decisions, keywords, categories, links })
}, STORE_TTL_MS)
