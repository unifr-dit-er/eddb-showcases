/**
 * In-memory copy of the public archive, loaded from NocoDB and refreshed
 * every hour. Use ONLY in route handlers (src/app/api/).
 *
 * The archive is small (about 4,000 records) and no longer grows: holding it
 * in memory lets the routes filter, count and paginate in one place, and
 * expose only whitelisted fields.
 */
import type { Article, Series } from '@/types/archive'
import { fetchNocoDB } from '@/lib/nocodb'
import {
  ARCHIVE_TTL_MS,
  ARTICLE_FIELDS,
  NOCODB_TABLES,
  SERIES_FIELDS,
} from '@/lib/archive-config'
import { isPublic, mapArticle, mapSeries } from '@/lib/archive-mappers'

type NocoDBRecord = Record<string, unknown>

export interface Archive {
  articles: Article[]
  articlesById: Map<string, Article>
  series: Series[]
  seriesById: Map<string, Series>
  loadedAt: number
}

const NOCODB_PAGE = 1000

const fetchAll = async (
  tableId: string,
  fields: readonly string[],
  where?: string
): Promise<NocoDBRecord[]> => {
  const records: NocoDBRecord[] = []
  for (let offset = 0; ; offset += NOCODB_PAGE) {
    const params: Record<string, string> = {
      fields: fields.join(','),
      limit: String(NOCODB_PAGE),
      offset: String(offset),
    }
    if (where) params.where = where
    const data = (await fetchNocoDB(`/api/v2/tables/${tableId}/records`, params)) as {
      list?: NocoDBRecord[]
      pageInfo?: { isLastPage?: boolean }
    }
    const list = data.list ?? []
    records.push(...list)
    if (data.pageInfo?.isLastPage !== false || list.length === 0) return records
  }
}

// Always through the NocoDB API, in development as in production, so the
// app behaves the same with the same token.
const loadRaw = async () => {
  const [articles, series] = await Promise.all([
    fetchAll(NOCODB_TABLES.ARTICLES, ARTICLE_FIELDS, '(ok_for_public,eq,YES)'),
    fetchAll(NOCODB_TABLES.SERIES, SERIES_FIELDS),
  ])
  return { articles, series }
}

export const buildArchive = (
  rawArticles: NocoDBRecord[],
  rawSeries: NocoDBRecord[]
): Archive => {
  // Filtered again here: the NocoDB `where` is the first barrier, not the only one.
  const articles = rawArticles
    .filter(isPublic)
    .map(mapArticle)
    .filter((a) => a.id && a.title)
  const series = rawSeries.map(mapSeries).filter((s) => s.id)
  return {
    articles,
    articlesById: new Map(articles.map((a) => [a.id, a])),
    series,
    seriesById: new Map(series.map((s) => [s.id, s])),
    loadedAt: Date.now(),
  }
}

let cache: Archive | null = null
let pending: Promise<Archive> | null = null

export const getArchive = async (): Promise<Archive> => {
  if (cache && Date.now() - cache.loadedAt < ARCHIVE_TTL_MS) return cache
  if (!pending) {
    pending = loadRaw()
      .then(({ articles, series }) => {
        cache = buildArchive(articles, series)
        return cache
      })
      .finally(() => {
        pending = null
      })
  }
  // On a failed refresh, keep serving the previous copy if there is one.
  return pending.catch((error) => {
    if (cache) return cache
    throw error
  })
}
