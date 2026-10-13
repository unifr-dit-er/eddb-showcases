import { describe, it, expect } from 'vitest'
import { buildArchive } from '../archive-store'
import { computeFacets, normalize, parseFilters, queryArticles } from '../archive-query'
import { DEFAULT_FILTERS } from '@/types/archive'

const raw = [
  { Id: 1, title: 'Frühfranzösisch im Thurgau', date_start: '2016/05/01', journal: 'Thurgauer Zeitung', key_words: 'French | Thurgau', language_codes: 'ger', record_level: 'Newspaper article', Series_id: 1, ok_for_public: 'YES', teaser_text: 'Le débat continue' },
  { Id: 2, title: 'Rapport sur les langues', date_start: '2018/01/10', journal: '', key_words: 'French | Language policy', language_codes: 'fre', record_level: 'Report', Series_id: 1, ok_for_public: 'YES' },
  { Id: 3, title: 'Italiano a scuola', date_start: '2016/11/02', journal: 'Corriere del Ticino', key_words: 'Italian', language_codes: 'ita', record_level: 'Newspaper article', Series_id: 2, ok_for_public: 'YES' },
  { Id: 4, title: 'Sans date', date_start: '', journal: 'Le Temps', key_words: '', language_codes: 'fre', record_level: 'Newspaper article', Series_id: 2, ok_for_public: 'YES' },
  { Id: 5, title: 'test', date_start: '2020/01/01', journal: 'Le Temps', key_words: 'French', language_codes: 'fre', record_level: 'Newspaper article', Series_id: 2, ok_for_public: 'NO' },
]
const series = [
  { Id: 1, title_ger: 'Thurgau', title_fre: 'Thurgovie' },
  { Id: 2, title_ger: 'Tessin', title_fre: 'Tessin' },
]
const { articles, series: allSeries } = buildArchive(raw, series)
const ids = (filters: Partial<typeof DEFAULT_FILTERS>) =>
  queryArticles(articles, { ...DEFAULT_FILTERS, ...filters }).list.map((a) => a.id)

describe('buildArchive', () => {
  it('drops records not cleared for publication', () => {
    expect(articles.map((a) => a.id)).not.toContain('5')
  })
})

describe('parseFilters', () => {
  it('reads and sanitises the query string', () => {
    const f = parseFilters(new URLSearchParams('q=%20lang%20&keyword=A&keyword=B&type=Report&type=Film&from=2016&to=abc&page=-2&sort=asc'))
    expect(f).toMatchObject({ q: 'lang', keywords: ['A', 'B'], types: ['Report', 'Film'], from: '2016', to: '', page: 1, sortDir: 'asc' })
  })
})

describe('queryArticles', () => {
  it('sorts by date, newest first, undated last', () => {
    expect(ids({})).toEqual(['2', '3', '1', '4'])
    expect(ids({ sortDir: 'asc' })).toEqual(['1', '3', '2', '4'])
  })

  it('searches without regard to case or accents', () => {
    expect(ids({ q: 'FRUHFRANZOSISCH' })).toEqual(['1'])
    expect(ids({ q: 'debat' })).toEqual(['1'])
    expect(normalize('Débat')).toBe('debat')
  })

  it('requires every selected keyword', () => {
    expect(ids({ keywords: ['French'] })).toEqual(['2', '1'])
    expect(ids({ keywords: ['French', 'Thurgau'] })).toEqual(['1'])
  })

  it('filters by series, journal, language and years', () => {
    expect(ids({ series: '1' })).toEqual(['2', '1'])
    expect(ids({ journal: 'Le Temps' })).toEqual(['4'])
    expect(ids({ language: 'ita' })).toEqual(['3'])
    expect(ids({ from: '2016', to: '2016' })).toEqual(['3', '1'])
  })

  it('keeps records of any of the selected types', () => {
    expect(ids({ types: ['Report'] })).toEqual(['2'])
    expect(ids({ types: ['Report', 'Newspaper article'] })).toEqual(['2', '3', '1', '4'])
    expect(ids({ series: '1', types: ['Newspaper article'] })).toEqual(['1'])
  })

  it('counts years without the year filter', () => {
    const page = queryArticles(articles, { ...DEFAULT_FILTERS, from: '2018', to: '2018' })
    expect(page.pageInfo.totalRows).toBe(1)
    expect(page.years).toEqual([{ year: 2016, count: 2 }, { year: 2018, count: 1 }])
  })

  it('clamps the page to the last one', () => {
    expect(queryArticles(articles, { ...DEFAULT_FILTERS, page: 99 }).pageInfo.page).toBe(1)
  })
})

describe('computeFacets', () => {
  it('counts records per series and values per facet', () => {
    const f = computeFacets(articles, allSeries)
    expect(f.total).toBe(4)
    expect(f.series.find((s) => s.id === '1')).toMatchObject({ count: 2 })
    expect(f.recordTypes[0]).toEqual({ value: 'Newspaper article', count: 3 })
    expect(f.keywords[0]).toEqual({ value: 'French', count: 2 })
    expect(f.years).toEqual({ min: 2016, max: 2018 })
  })
})
