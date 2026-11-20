import { describe, expect, it } from 'vitest'
import { parseRecordNumber } from '@/components/GoToItem'

describe('parseRecordNumber', () => {
  it('keeps a plain number', () => {
    expect(parseRecordNumber('42')).toBe('42')
    expect(parseRecordNumber('  1307 ')).toBe('1307')
  })

  it('tolerates a leading # or n° and leading zeros', () => {
    expect(parseRecordNumber('#42')).toBe('42')
    expect(parseRecordNumber('n° 42')).toBe('42')
    expect(parseRecordNumber('No. 42')).toBe('42')
    expect(parseRecordNumber('0042')).toBe('42')
  })

  it('refuses anything else', () => {
    expect(parseRecordNumber('')).toBeNull()
    expect(parseRecordNumber('0')).toBeNull()
    expect(parseRecordNumber('-3')).toBeNull()
    expect(parseRecordNumber('4a')).toBeNull()
    expect(parseRecordNumber('vase')).toBeNull()
  })
})
