import { describe, expect, it } from 'vitest'
import { buildBars, zoomedStart } from '../YearTimeline'

const years = [
  { year: -1900, count: 1 },
  { year: -1400, count: 2 },
  { year: -450, count: 5 },
  { year: -401, count: 1 },
  { year: -400, count: 3 },
  { year: 120, count: 4 },
]

describe('buildBars', () => {
  it('counts single years without a bucket', () => {
    const bars = buildBars([{ year: 2014, count: 2 }, { year: 2016, count: 1 }], 2014, 2016, 1)
    expect(bars).toEqual([
      { start: 2014, end: 2014, count: 2 },
      { start: 2015, end: 2015, count: 0 },
      { start: 2016, end: 2016, count: 1 },
    ])
  })

  it('puts negative years in the bar below them', () => {
    const bars = buildBars(years, -500, -301, 100)
    expect(bars).toEqual([
      { start: -500, end: -401, count: 6 },
      { start: -400, end: -301, count: 3 },
    ])
  })

  it('gathers the years before the floor in a single bar', () => {
    const bars = buildBars(years, -1900, 199, 100, -800)
    expect(bars[0]).toEqual({ start: null, end: -801, count: 3 })
    expect(bars[1]).toEqual({ start: -800, end: -701, count: 0 })
    expect(bars.at(-1)).toEqual({ start: 100, end: 199, count: 4 })
    expect(bars).toHaveLength(1 + 10)
  })

  it('starts at the first year when nothing lies before the floor', () => {
    const bars = buildBars(years.slice(2), -450, 199, 100, -800)
    expect(bars[0].start).toBe(-500)
  })

  it('details a bar by smaller steps', () => {
    const bars = buildBars(years, -500, -401, 10)
    expect(bars).toHaveLength(10)
    expect(bars.find((b) => b.start === -450)?.count).toBe(5)
    expect(bars.at(-1)).toEqual({ start: -410, end: -401, count: 1 })
    expect(bars.reduce((n, b) => n + b.count, 0)).toBe(6)
  })
})

describe('zoomedStart', () => {
  it('opens the bar that holds the whole period', () => {
    expect(zoomedStart(-500, -401, 100)).toBe(-500)
    expect(zoomedStart(-450, -441, 100)).toBe(-500)
    expect(zoomedStart(100, 199, 100, -800)).toBe(100)
  })

  it('stays closed for an open or wider period', () => {
    expect(zoomedStart(null, null, 100)).toBeNull()
    expect(zoomedStart(-500, null, 100)).toBeNull()
    expect(zoomedStart(-500, -301, 100)).toBeNull()
    expect(zoomedStart(-401, -400, 100)).toBeNull()
  })

  it('never opens the bar before the floor', () => {
    expect(zoomedStart(-1900, -1801, 100, -800)).toBeNull()
  })
})
