import { describe, expect, it } from 'vitest'
import { formatPeriod } from '@/lib/period'

describe('formatPeriod', () => {
  it('reads whole years as years', () => {
    expect(formatPeriod('2016-01-01', '2016-12-31', 'fr')).toBe('2016')
    expect(formatPeriod('2016-01-01', '2018-12-31', 'fr')).toBe('2016–2018')
  })

  it('reads other bounds as dates', () => {
    expect(formatPeriod('2016-03-15', '2018-12-31', 'fr')).toBe('15.03.2016–31.12.2018')
  })

  it('handles an open bound', () => {
    expect(formatPeriod('2016-01-01', '', 'de')).toBe('≥ 2016')
    expect(formatPeriod('', '2018-06-30', 'de')).toBe('≤ 30.06.2018')
    expect(formatPeriod('', '', 'fr')).toBe('')
  })
})
