import { describe, expect, it } from 'vitest'
import { getPageTitle, translations } from '@/i18n'

describe('texts', () => {
  it('has no empty text', () => {
    for (const [key, text] of Object.entries(translations)) expect(text, key).not.toBe('')
  })

  it('has no em dash in the texts', () => {
    for (const [key, text] of Object.entries(translations)) expect(text.includes('—'), key).toBe(false)
  })

  it('titles the page with the base name', () => {
    expect(getPageTitle().startsWith('Callisto')).toBe(true)
  })
})
