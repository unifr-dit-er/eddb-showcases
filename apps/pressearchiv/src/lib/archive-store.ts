/**
 * In-memory copy of the public archive, loaded from NocoDB and refreshed
 * every hour. Use ONLY in route handlers (src/app/api/).
 *
 * The archive is small (about 4,000 records) and no longer grows: holding it
 * in memory lets the routes filter, count and paginate in one place, and
 * expose only whitelisted fields.
 */
import type { Article, KeywordLabels, Series } from '@/types/archive'
import { fetchAllRecords } from '@eddb/showcase-kit/nocodb'
import { cachedLoader } from '@eddb/showcase-kit/cached-loader'
import {
  ARCHIVE_TTL_MS,
  ARTICLE_FIELDS,
  NOCODB_TABLES,
  SERIES_FIELDS,
  THESAURUS_FIELDS,
} from '@/lib/archive-config'
import { isPublic, mapArticle, mapSeries, mapThesaurusTerm } from '@/lib/archive-mappers'

type NocoDBRecord = Record<string, unknown>

export interface Archive {
  articles: Article[]
  articlesById: Map<string, Article>
  series: Series[]
  seriesById: Map<string, Series>
  // Labels of the keywords present in the public records, hidden ones left out.
  keywordLabels: Map<string, KeywordLabels>
}

// Always through the NocoDB API, in development as in production, so the
// app behaves the same with the same token.
const loadRaw = async () => {
  const [articles, series, thesaurus] = await Promise.all([
    fetchAllRecords(NOCODB_TABLES.ARTICLES, ARTICLE_FIELDS, '(ok_for_public,eq,YES)'),
    fetchAllRecords(NOCODB_TABLES.SERIES, SERIES_FIELDS),
    fetchAllRecords(NOCODB_TABLES.THESAURUS, THESAURUS_FIELDS),
  ])
  return { articles, series, thesaurus }
}

export const buildArchive = (
  rawArticles: NocoDBRecord[],
  rawSeries: NocoDBRecord[],
  rawThesaurus: NocoDBRecord[] = []
): Archive => {
  const terms = new Map(rawThesaurus.map(mapThesaurusTerm).filter((t) => t.en).map((t) => [t.en, t]))
  // Filtered again here: the NocoDB `where` is the first barrier, not the only one.
  const articles = rawArticles
    .filter(isPublic)
    .map(mapArticle)
    .filter((a) => a.id && a.title)
    .map((a) => {
      const keywords = a.keywords.filter((k) => !terms.get(k)?.hidden)
      const keywordTerms = keywords.flatMap((k) => {
        const t = terms.get(k)
        return t ? [t.de, t.fr, t.it] : []
      })
      return { ...a, keywords, keywordTerms }
    })
  const series = rawSeries.map(mapSeries).filter((s) => s.id)
  // A keyword missing from the thesaurus keeps its stored form everywhere.
  const keywordLabels = new Map<string, KeywordLabels>()
  for (const k of new Set(articles.flatMap((a) => a.keywords))) {
    const t = terms.get(k)
    keywordLabels.set(k, t ? { en: t.en, de: t.de, fr: t.fr, it: t.it } : { en: k, de: k, fr: k, it: k })
  }
  return {
    articles,
    articlesById: new Map(articles.map((a) => [a.id, a])),
    series,
    seriesById: new Map(series.map((s) => [s.id, s])),
    keywordLabels,
  }
}

export const getArchive = cachedLoader(async () => {
  const { articles, series, thesaurus } = await loadRaw()
  return buildArchive(articles, series, thesaurus)
}, ARCHIVE_TTL_MS)
