import { describe, expect, it } from 'vitest'
import { normalize } from '../text'

describe('normalize', () => {
  it('ignores case and accents', () => {
    expect(normalize('Überwachung à Genève')).toBe('uberwachung a geneve')
  })
})
