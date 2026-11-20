import { describe, expect, it } from 'vitest'
import { decodeEntities, normalize, paragraphs, recordText } from '../text'

describe('normalize', () => {
  it('ignores case and accents', () => {
    expect(normalize('Überwachung à Genève')).toBe('uberwachung a geneve')
  })
})

describe('decodeEntities', () => {
  it('decodes numeric and usual named entities', () => {
    expect(decodeEntities('n&deg; 405, l&rsquo;&#233;t&#xE9; &amp; Co')).toBe('n° 405, l’été & Co')
  })

  it('leaves unknown or invalid entities as they are', () => {
    expect(decodeEntities('&unknown; &#0;')).toBe('&unknown; &#0;')
  })
})

describe('recordText', () => {
  it('decodes, removes control characters and trims', () => {
    expect(recordText('  Texte&#2; n&deg; 3\n')).toBe('Texte n° 3')
    expect(recordText(null)).toBe('')
    expect(recordText(42)).toBe('42')
  })
})

describe('paragraphs', () => {
  it('starts a paragraph at every line break, blank lines dropped', () => {
    expect(paragraphs('A.\n\n\n\nB.\n\n \n\n\nC.\nD.\n\n\n\n\n\t\n\t\tE.')).toEqual(['A.', 'B.', 'C.', 'D.', 'E.'])
  })

  it('reads Windows line breaks', () => {
    expect(paragraphs('A. \r\n\r\nB.\r\nC.')).toEqual(['A.', 'B.', 'C.'])
  })

  it('gives nothing for an empty text', () => {
    expect(paragraphs('  \n\n ')).toEqual([])
  })
})
