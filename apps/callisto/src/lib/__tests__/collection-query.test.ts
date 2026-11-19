import { describe, expect, it } from 'vitest'
import type { Representation } from '@/types/collection'
import { DEFAULT_FILTERS } from '@/types/collection'
import {
  computeFacets,
  excerptOf,
  filterRepresentations,
  parseFilters,
  queryRepresentations,
  sortRepresentations,
} from '@/lib/collection-query'
import { formatDating } from '@/lib/format'

const rep = (over: Partial<Representation>): Representation => ({
  id: '1',
  title: 'Titre',
  description: '',
  dateFrom: null,
  dateTo: null,
  period: '',
  material: '',
  category: '',
  form: '',
  subjects: [],
  dimensions: '',
  discoveryPlace: '',
  conservationPlace: '',
  productionCentre: '',
  sources: '',
  bibliography: '',
  ...over,
})

const items = [
  rep({ id: '1', title: 'Chous à l’enfant', dateFrom: -420, period: 'Classique', material: 'Terre cuite', subjects: ['Enfant', 'Balle'] }),
  rep({ id: '2', title: 'Relief funéraire', dateFrom: 150, period: 'Impériale', material: 'Marbre', subjects: ['Enfant'] }),
  rep({ id: '10', title: 'Astragale', dateFrom: null, period: 'Classique', material: 'Os', subjects: ['Osselets'] }),
]

describe('parseFilters', () => {
  it('reads negative years, several values and the sort', () => {
    const f = parseFilters(new URLSearchParams('from=-500&to=-300&period=Classique&period=Romaine&sort=date&dir=desc'))
    expect(f).toMatchObject({ from: '-500', to: '-300', periods: ['Classique', 'Romaine'], sort: 'date', sortDir: 'desc' })
  })

  it('ignores invalid values', () => {
    const f = parseFilters(new URLSearchParams('from=abc&sort=x&page=-2'))
    expect(f).toMatchObject({ from: '', sort: 'number', page: 1, sortDir: 'asc' })
  })
})

describe('filterRepresentations', () => {
  it('combines values of a field with "or", subjects with "and"', () => {
    expect(filterRepresentations(items, { ...DEFAULT_FILTERS, materials: ['Os', 'Marbre'] }).map((r) => r.id)).toEqual(['2', '10'])
    expect(filterRepresentations(items, { ...DEFAULT_FILTERS, subjects: ['Enfant', 'Balle'] }).map((r) => r.id)).toEqual(['1'])
  })

  it('filters by starting year, undated records left out', () => {
    expect(filterRepresentations(items, { ...DEFAULT_FILTERS, from: '-500', to: '-400' }).map((r) => r.id)).toEqual(['1'])
  })

  it('searches without accents or case', () => {
    expect(filterRepresentations(items, { ...DEFAULT_FILTERS, q: 'funeraire' }).map((r) => r.id)).toEqual(['2'])
  })
})

describe('sortRepresentations', () => {
  it('sorts by number numerically', () => {
    expect(sortRepresentations(items, 'number', 'asc').map((r) => r.id)).toEqual(['1', '2', '10'])
  })

  it('keeps undated records last in both directions', () => {
    expect(sortRepresentations(items, 'date', 'asc').map((r) => r.id)).toEqual(['1', '2', '10'])
    expect(sortRepresentations(items, 'date', 'desc').map((r) => r.id)).toEqual(['2', '1', '10'])
  })
})

describe('queryRepresentations and computeFacets', () => {
  it('paginates and counts the years of the matches', () => {
    const page = queryRepresentations(items, DEFAULT_FILTERS)
    expect(page.pageInfo.totalRows).toBe(3)
    expect(page.years).toEqual([{ year: -420, count: 1 }, { year: 150, count: 1 }])
  })

  it('counts a field against the other filters but not itself', () => {
    const facets = computeFacets(items, { ...DEFAULT_FILTERS, periods: ['Impériale'] })
    expect(facets.total).toBe(1)
    expect(facets.periods).toEqual([{ value: 'Classique', count: 2 }, { value: 'Impériale', count: 1 }])
    expect(facets.years).toEqual({ min: -420, max: 150 })
  })

  it('never sends the description in full in the list', () => {
    const long = 'mot '.repeat(200)
    expect(excerptOf(long).length).toBeLessThan(300)
    expect(excerptOf('court')).toBe('court')
  })
})

describe('formatDating', () => {
  it('writes the dates before and after the common era', () => {
    expect(formatDating(-450, -400)).toBe('450–400 av. J.-C.')
    expect(formatDating(100, 150)).toBe('100–150 apr. J.-C.')
    expect(formatDating(-50, 20)).toBe('50 av. J.-C. – 20 apr. J.-C.')
    expect(formatDating(-420, null)).toBe('420 av. J.-C.')
    expect(formatDating(null, null)).toBe('')
  })
})
