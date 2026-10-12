import { describe, it, expect } from 'vitest'
import { collectionOf, isPublic, mapArticle, mapSeries, parseDate, splitMulti } from '../archive-mappers'

describe('splitMulti', () => {
  it('splits " | " separated values and drops blanks', () => {
    expect(splitMulti('ger | fre |  ')).toEqual(['ger', 'fre'])
    expect(splitMulti(null)).toEqual([])
  })
})

describe('parseDate', () => {
  it('reads YYYY/MM/DD as an ISO date', () => {
    expect(parseDate('2017/03/05')).toBe('2017-03-05')
  })

  it('rejects malformed or impossible dates', () => {
    expect(parseDate('2016Dezember/01/01')).toBe('')
    expect(parseDate('2017/13/01')).toBe('')
    expect(parseDate(null)).toBe('')
  })
})

describe('collectionOf', () => {
  it('files documents and press by record type', () => {
    expect(collectionOf('Document')).toBe('documents')
    expect(collectionOf('Bill')).toBe('documents')
    expect(collectionOf('Newspaper article')).toBe('press')
    expect(collectionOf('Audio recording')).toBe('press')
  })
})

describe('isPublic', () => {
  it('only accepts records cleared for publication', () => {
    expect(isPublic({ ok_for_public: 'YES' })).toBe(true)
    expect(isPublic({ ok_for_public: 'NO' })).toBe(false)
    expect(isPublic({})).toBe(false)
  })
})

describe('mapArticle', () => {
  const record = {
    Id: 12,
    internal_no: '000009374',
    record_level: 'Newspaper article',
    title: 'Schulgemeinden fürchten Kosten',
    date_start: '2017/09/08',
    authors: 'Meile, Silvan | Felber, Philipp',
    creator_roles: 'Author | Author',
    journal: 'Thurgauer Zeitung',
    teaser_text: 'Am Montag ist Schulbeginn.',
    key_words: 'Schools | Thurgau | Schools',
    language_codes: 'ger',
    url: '',
    Series_id: 24,
    full_text: 'must never be mapped',
    pdf_path: 'must never be mapped',
  }

  it('maps the public fields', () => {
    const a = mapArticle(record)
    expect(a).toMatchObject({
      id: '12',
      internalNo: '000009374',
      date: '2017-09-08',
      collection: 'press',
      seriesId: '24',
      languages: ['ger'],
      keywords: ['Schools', 'Thurgau'],
    })
    expect(a.authors).toEqual([
      { name: 'Meile, Silvan', role: 'Author' },
      { name: 'Felber, Philipp', role: 'Author' },
    ])
  })

  it('never carries fields outside the whitelist', () => {
    const json = JSON.stringify(mapArticle(record))
    expect(json).not.toContain('must never be mapped')
  })

  it('falls back on the link field for the series', () => {
    expect(mapArticle({ Id: 1, Series: { Id: 7, title_ger: 'Bern' } }).seriesId).toBe('7')
  })
})

describe('mapSeries', () => {
  it('flags national series', () => {
    expect(mapSeries({ Id: 20, title_ger: 'CH: Presse', title_fre: 'CH : presse' }).national).toBe(true)
    expect(mapSeries({ Id: 9, title_ger: 'Freiburg', title_fre: 'Fribourg' })).toEqual({
      id: '9',
      titleDE: 'Freiburg',
      titleFR: 'Fribourg',
      national: false,
    })
  })
})
