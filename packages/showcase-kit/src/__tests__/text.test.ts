import { describe, expect, it } from 'vitest'
import { decodeEntities, linkLabels, linkParts, normalize, paragraphs, recordText } from '../text'

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

describe('linkParts', () => {
  const hermitage =
    'http://www.hermitage.ru/wps/portal/hermitage/digital-collection/25.+Archaeological+Artifacts/288877/?lng=fr'

  it('cuts a text into plain parts and Markdown links', () => {
    expect(linkParts(`Voir la [Notice du State Hermitage Museum, St. Petersbourg](${hermitage}).`)).toEqual([
      { text: 'Voir la ' },
      { text: 'Notice du State Hermitage Museum, St. Petersbourg', href: hermitage },
      { text: '.' },
    ])
  })

  it('keeps one level of parentheses in the address', () => {
    expect(linkParts('[Hydrie](https://fr.wikipedia.org/wiki/Hydrie_(vase))')).toEqual([
      { text: 'Hydrie', href: 'https://fr.wikipedia.org/wiki/Hydrie_(vase)' },
    ])
  })

  it('leaves anything but http and https links as written', () => {
    for (const text of ['[x](javascript:alert(1))', '[x](mailto:a@b.ch)', '[x](/relative)', 'plain']) {
      expect(linkParts(text)).toEqual([{ text }])
    }
  })

  it('links bare addresses, without the punctuation that ends the sentence', () => {
    const louvre = 'http://cartelfr.louvre.fr/cartelfr/visite?srv=car_not_frame&idNotice=13116&langue=fr'
    expect(linkParts(`Notice : ${louvre}.`)).toEqual([
      { text: 'Notice : ' },
      { text: louvre, href: louvre },
      { text: '.' },
    ])
    expect(linkParts('(voir https://fr.wikipedia.org/wiki/Hydrie_(vase))')).toEqual([
      { text: '(voir ' },
      { text: 'https://fr.wikipedia.org/wiki/Hydrie_(vase)', href: 'https://fr.wikipedia.org/wiki/Hydrie_(vase)' },
      { text: ')' },
    ])
  })

  it('keeps a broken link whose address is no host as text', () => {
    const text = '[Base de données Arachne ](http://E. Simon, Ara Pacis Augustae (1967) 12 f.'
    expect(linkParts(text)).toEqual([{ text }])
  })

  it('does not link a bare address twice inside a Markdown link', () => {
    expect(linkParts('[https://a.ch/x](https://a.ch/x) et https://b.ch')).toEqual([
      { text: 'https://a.ch/x', href: 'https://a.ch/x' },
      { text: ' et ' },
      { text: 'https://b.ch', href: 'https://b.ch' },
    ])
  })

  it('drops the stray " (" an earlier editor left before the closing parenthesis', () => {
    expect(linkParts('[Projekt Dyabola](http://www.db.dyabola.de/dya/dya_srv2.dll?01&dir=W8A715HE ()')).toEqual([
      { text: 'Projekt Dyabola', href: 'http://www.db.dyabola.de/dya/dya_srv2.dll?01&dir=W8A715HE' },
    ])
  })

  it('finds several links, side by side', () => {
    expect(linkParts('[a](https://a.ch)[b](https://b.ch)').map((part) => part.href)).toEqual([
      'https://a.ch',
      'https://b.ch',
    ])
  })
})

describe('linkLabels', () => {
  it('reduces each link to its label', () => {
    expect(linkLabels('Voir [la notice](https://a.ch/x?y=1) et [*CVA*](https://b.ch).')).toBe('Voir la notice et *CVA*.')
  })
})
