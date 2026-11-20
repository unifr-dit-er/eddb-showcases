import { describe, expect, it } from 'vitest'
import { paragraphs } from '../format'

describe('paragraphs', () => {
  it('splits on any run of blank lines, whitespace included', () => {
    expect(paragraphs('A.\n\n\n\nB.\n\n \n\n\nC.\n\n\n\n\n\t\n\t\tD.')).toEqual(['A.', 'B.', 'C.', 'D.'])
  })

  it('keeps a single line break inside a paragraph', () => {
    expect(paragraphs('Ligne 1\nLigne 2\n\nSuite')).toEqual(['Ligne 1\nLigne 2', 'Suite'])
  })

  it('drops leading, trailing and empty paragraphs', () => {
    expect(paragraphs('\n\n  A.  \n\n\n\n')).toEqual(['A.'])
    expect(paragraphs('')).toEqual([])
  })
})
