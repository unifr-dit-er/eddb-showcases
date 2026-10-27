import { describe, it, expect } from 'vitest'
import { LOCALES, getLabels, getTranslations } from '../index'

describe('getTranslations', () => {
  it('returns french translations for "fr"', () => {
    expect(getTranslations('fr')['sidebar.search.label']).toBe('Recherche')
  })

  it('returns german translations for "de"', () => {
    expect(getTranslations('de')['sidebar.search.label']).toBe('Suche')
  })

  it('returns english and italian translations', () => {
    expect(getTranslations('en')['sidebar.search.label']).toBe('Search')
    expect(getTranslations('it')['sidebar.search.label']).toBe('Ricerca')
  })

  it('all locales have the same keys', () => {
    const keys = Object.keys(getTranslations('fr')).sort()
    for (const locale of LOCALES) {
      expect(Object.keys(getTranslations(locale)).sort()).toEqual(keys)
    }
  })
})

describe('getLabels', () => {
  it('all locales label the same values', () => {
    const fr = getLabels('fr')
    for (const locale of LOCALES) {
      const labels = getLabels(locale)
      expect(Object.keys(labels.recordType).sort()).toEqual(Object.keys(fr.recordType).sort())
      expect(Object.keys(labels.language).sort()).toEqual(Object.keys(fr.language).sort())
    }
  })
})
