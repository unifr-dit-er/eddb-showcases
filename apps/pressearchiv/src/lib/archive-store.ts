/**
 * In-memory copy of the public archive, loaded from NocoDB and refreshed
 * every hour. Use ONLY in route handlers (src/app/api/).
 *
 * The archive is small (about 4,000 records) and no longer grows: holding it
 * in memory lets the routes filter, count and paginate in one place, and
 * expose only whitelisted fields.
 */
import type { Article, Series } from '@/types/archive'
import { fetchAllRecords } from '@eddb/showcase-kit/nocodb'
import { cachedLoader } from '@eddb/showcase-kit/cached-loader'
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
}

// Always through the NocoDB API, in development as in production, so the
// app behaves the same with the same token.
const loadRaw = async () => {
  const [articles, series] = await Promise.all([
    fetchAllRecords(NOCODB_TABLES.ARTICLES, ARTICLE_FIELDS, '(ok_for_public,eq,YES)'),
    fetchAllRecords(NOCODB_TABLES.SERIES, SERIES_FIELDS),
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
  }
}

export const getArchive = cachedLoader(async () => {
  const { articles, series } = await loadRaw()
  return buildArchive(articles, series)
}, ARCHIVE_TTL_MS)
