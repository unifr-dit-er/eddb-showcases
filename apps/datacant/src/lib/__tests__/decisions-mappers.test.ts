import { describe, expect, it } from 'vitest'
import { attachmentPath, groupLinks, mapDecision, mapKeyword } from '../decisions-mappers'

const record = {
  Id: 5,
  DescriptionFR: 'Installation de webcams ',
  DescriptionDE: 'Installation von Webcams',
  AbstractFR: 'Résumé',
  AbstractDE: 'Zusammenfassung',
  Canton: 'VD',
  Date: '2005-06-28',
  Attachment: [{ path: 'download/a.pdf', signedPath: 'dltemp/x/a.pdf' }],
}

describe('mapDecision', () => {
  it('keeps both languages, trimmed', () => {
    const d = mapDecision(record, ['3'])
    expect(d.title).toEqual({ FR: 'Installation de webcams', DE: 'Installation von Webcams' })
    expect(d.abstract.DE).toBe('Zusammenfassung')
    expect(d).toMatchObject({ id: '5', canton: 'VD', date: '2005-06-28', hasPdf: true, keywordIds: ['3'] })
  })

  it('knows when there is no PDF', () => {
    expect(mapDecision({ ...record, Attachment: null }).hasPdf).toBe(false)
  })
})

describe('mapKeyword', () => {
  it('maps labels and category id', () => {
    expect(mapKeyword({ Id: 3, KeywordFR: 'Par vidéo', KeywordDE: 'Videoüberwachung', Categories_id: 7 })).toEqual({
      id: '3',
      label: { FR: 'Par vidéo', DE: 'Videoüberwachung' },
      categoryId: '7',
    })
  })
})

describe('groupLinks', () => {
  it('groups keyword ids by decision, without duplicates', () => {
    const links = groupLinks([
      { Decisions_id: 1, Keywords_id: 3 },
      { Decisions_id: 1, Keywords_id: 4 },
      { Decisions_id: 1, Keywords_id: 3 },
      { Decisions_id: 2, Keywords_id: 3 },
    ])
    expect(links.get('1')).toEqual(['3', '4'])
    expect(links.get('2')).toEqual(['3'])
  })
})

describe('attachmentPath', () => {
  it('prefers a full URL, then the signed path', () => {
    expect(attachmentPath({ Attachment: [{ url: 'https://s3/a.pdf', signedPath: 'x' }] })).toBe('https://s3/a.pdf')
    expect(attachmentPath(record)).toBe('dltemp/x/a.pdf')
    expect(attachmentPath({ Attachment: [] })).toBe('')
  })
})
