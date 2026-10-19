import { describe, expect, it } from 'vitest'
import { buildStore } from '../decisions-store'
import { computeFacets, parseFilters, queryDecisions } from '../decisions-query'
import { DEFAULT_FILTERS } from '@/types/filters'

const decision = (Id: number, Canton: string, Date: string, DescriptionFR: string) => ({
  Id,
  DescriptionFR,
  DescriptionDE: `${DescriptionFR} DE`,
  AbstractFR: 'Résumé',
  AbstractDE: 'Zusammenfassung',
  Canton,
  Date,
  Attachment: Id === 1 ? [{ signedPath: 'x' }] : null,
})

const store = buildStore({
  decisions: [
    decision(1, 'FR', '2016-03-01', 'Accès au dossier'),
    decision(2, 'FR', '2018-05-01', 'Vidéosurveillance'),
    decision(3, 'GE', '2016-09-01', 'Données de santé'),
  ],
  keywords: [
    { Id: 10, KeywordFR: 'Droit d’accès', KeywordDE: 'Auskunftsrecht', Categories_id: 1 },
    { Id: 11, KeywordFR: 'Pesée des intérêts', KeywordDE: 'Interessenabwägung', Categories_id: 1 },
  ],
  categories: [{ Id: 1, CategoryFR: 'Principes', CategoryDE: 'Grundsätze' }],
  links: [
    { Decisions_id: 1, Keywords_id: 10 },
    { Decisions_id: 1, Keywords_id: 11 },
    { Decisions_id: 2, Keywords_id: 10 },
    { Decisions_id: 3, Keywords_id: 11 },
  ],
})

const filters = (changes: Partial<typeof DEFAULT_FILTERS>) => ({ ...DEFAULT_FILTERS, ...changes })

describe('parseFilters', () => {
  it('drops malformed values', () => {
    const f = parseFilters(new URLSearchParams('canton=XX&from=2016&to=2018-12-31&page=-2&keyword=10&keyword=11'))
    expect(f).toMatchObject({ canton: '', from: '', to: '2018-12-31', page: 1, keywords: ['10', '11'] })
  })
})

describe('queryDecisions', () => {
  it('combines keywords with "and"', () => {
    expect(queryDecisions(store, filters({ keywords: ['10'] }), 'FR').list.map((d) => d.id)).toEqual(['2', '1'])
    expect(queryDecisions(store, filters({ keywords: ['10', '11'] }), 'FR').list.map((d) => d.id)).toEqual(['1'])
  })

  it('searches title, abstract and keywords, ignoring accents, in the given language', () => {
    expect(queryDecisions(store, filters({ q: 'acces dossier' }), 'FR').pageInfo.totalRows).toBe(1)
    expect(queryDecisions(store, filters({ q: 'interessenabwagung' }), 'DE').pageInfo.totalRows).toBe(2)
    expect(queryDecisions(store, filters({ q: 'interessenabwagung' }), 'FR').pageInfo.totalRows).toBe(0)
  })

  it('filters the period by date and counts years without it', () => {
    const page = queryDecisions(store, filters({ from: '2016-01-01', to: '2016-12-31' }), 'FR')
    expect(page.list.map((d) => d.id)).toEqual(['3', '1'])
    expect(page.years).toEqual([
      { year: 2016, count: 2 },
      { year: 2018, count: 1 },
    ])
  })

  it('localizes the decisions, keywords and categories', () => {
    const [d] = queryDecisions(store, filters({ canton: 'GE' }), 'DE').list
    expect(d).toMatchObject({ title: 'Données de santé DE', abstract: 'Zusammenfassung', hasPdf: false })
    expect(d.keywords).toEqual([{ id: '11', label: 'Interessenabwägung', category: 'Grundsätze' }])
  })
})

describe('computeFacets', () => {
  it('counts cantons against every filter but the canton', () => {
    const facets = computeFacets(store, filters({ canton: 'FR', from: '2016-01-01', to: '2016-12-31' }), 'FR')
    const count = (code: string) => facets.cantons.find((c) => c.value === code)?.count
    expect(facets.total).toBe(1)
    expect(count('FR')).toBe(1)
    expect(count('GE')).toBe(1)
    expect(count('ZH')).toBe(0)
  })

  it('counts keywords against every filter, keywords included', () => {
    const facets = computeFacets(store, filters({ keywords: ['10'] }), 'FR')
    const count = (id: string) => facets.keywords.find((k) => k.id === id)?.count
    expect(count('10')).toBe(2)
    expect(count('11')).toBe(1)
    expect(facets.years).toEqual({ min: 2016, max: 2018 })
  })
})
