import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Emphasis } from '@/components/Emphasis'

describe('Emphasis', () => {
  it('shows *titles* in italics and nothing else', () => {
    const { container } = render(<Emphasis>{'*CVA* : Marathon, <b>61</b> * 2'}</Emphasis>)
    expect(container.querySelector('em')?.textContent).toBe('CVA')
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toBe('CVA : Marathon, <b>61</b> * 2')
  })
})
