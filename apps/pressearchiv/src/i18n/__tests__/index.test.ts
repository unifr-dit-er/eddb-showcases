import { describe, it, expect } from 'vitest'
import { getLabels, getTranslations } from '../index'

describe('getTranslations', () => {
  it('returns french translations for "fr"', () => {
    expect(getTranslations('fr')['sidebar.search.label']).toBe('Recherche')
  })

  it('returns german translations for "de"', () => {
    expect(getTranslations('de')['sidebar.search.label']).toBe('Suche')
  })

  it('both locales have the same keys', () => {
    expect(Object.keys(getTranslations('fr')).sort()).toEqual(
      Object.keys(getTranslations('de')).sort()
    )
  })
})

describe('getLabels', () => {
  it('both locales label the same values', () => {
    const fr = getLabels('fr')
    const de = getLabels('de')
    expect(Object.keys(fr.recordType).sort()).toEqual(Object.keys(de.recordType).sort())
    expect(Object.keys(fr.language).sort()).toEqual(Object.keys(de.language).sort())
  })
})
