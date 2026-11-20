import { describe, expect, it } from 'vitest'
import { decodeEntities, isPublished, mapRepresentation, parseYear, splitOptions } from '@/lib/collection-mappers'
import { buildCollection } from '@/lib/collection-store'
import { REPRESENTATION_FIELDS } from '@/lib/collection-config'

describe('collection mappers', () => {
  it('decodes the HTML entities left in the texts', () => {
    expect(decodeEntities('n&deg; 405, l&rsquo;&#233;t&#xE9; &amp; Co')).toEqual('n° 405, l’été & Co')
    expect(decodeEntities('&unknown; &#0;')).toEqual('&unknown; &#0;')
  })

  it('splits a NocoDB multi-select', () => {
    expect(splitOptions('Jeu de plateau, Pentegrammai ?')).toEqual(['Jeu de plateau', 'Pentegrammai ?'])
    expect(splitOptions(null)).toEqual([])
  })

  it('reads years, negative before the common era', () => {
    expect(parseYear(-450)).toBe(-450)
    expect(parseYear('120')).toBe(120)
    expect(parseYear(null)).toBeNull()
    expect(parseYear('')).toBeNull()
  })

  it('maps a record', () => {
    const r = mapRepresentation({ Id: 7, Titre: ' Chous ', DatationDebut: -420, Sujets: 'Enfant,Balle', Publication: true })
    expect(r).toMatchObject({ id: '7', title: 'Chous', dateFrom: -420, dateTo: null, subjects: ['Enfant', 'Balle'] })
  })

  it('keeps published records only, even if NocoDB sent others', () => {
    expect(isPublished({ Publication: true })).toBe(true)
    expect(isPublished({ Publication: false })).toBe(false)
    const { representations } = buildCollection([
      { Id: 1, Titre: 'A', Publication: true },
      { Id: 2, Titre: 'B', Publication: false },
      { Id: 3, Titre: '', Publication: true },
    ])
    expect(representations.map((r) => r.id)).toEqual(['1'])
  })

  it('never asks NocoDB for the images', () => {
    expect(REPRESENTATION_FIELDS).not.toContain('Image')
    expect(REPRESENTATION_FIELDS).not.toContain('ImagesAdditionnelles')
  })
})
