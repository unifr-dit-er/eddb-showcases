/**
 * In-memory copy of the published Callisto records, loaded from NocoDB and
 * refreshed every hour. Use ONLY in route handlers (src/app/api/).
 *
 * The collection is small (about 1,200 records) and no longer grows:
 * holding it in memory lets the routes filter, count and paginate in one
 * place, and expose only whitelisted fields.
 */
import type { Representation } from '@/types/collection'
import { fetchAllRecords } from '@eddb/showcase-kit/nocodb'
import { cachedLoader } from '@eddb/showcase-kit/cached-loader'
import {
  COLLECTION_TTL_MS,
  NOCODB_TABLES,
  PUBLISHED_WHERE,
  REPRESENTATION_FIELDS,
} from '@/lib/collection-config'
import { isPublished, mapRepresentation } from '@/lib/collection-mappers'

type NocoDBRecord = Record<string, unknown>

export interface Collection {
  representations: Representation[]
  representationsById: Map<string, Representation>
}

export const buildCollection = (raw: NocoDBRecord[]): Collection => {
  // Filtered again here: the NocoDB `where` is the first barrier, not the only one.
  const representations = raw
    .filter(isPublished)
    .map(mapRepresentation)
    .filter((r) => r.id && r.title)
  return {
    representations,
    representationsById: new Map(representations.map((r) => [r.id, r])),
  }
}

// Always through the NocoDB API, in development as in production, so the
// app behaves the same with the same token.
export const getCollection = cachedLoader(async () => {
  const raw = await fetchAllRecords(NOCODB_TABLES.REPRESENTATIONS, REPRESENTATION_FIELDS, PUBLISHED_WHERE)
  return buildCollection(raw)
}, COLLECTION_TTL_MS)
