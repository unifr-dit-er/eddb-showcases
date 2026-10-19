import { describe, it, expect } from 'vitest'
import type { Decision, DecisionsPage } from '../decision'
import type { Filters } from '../filters'

describe('Types', () => {
  it('Decision type accepts a valid decision object', () => {
    const decision: Decision = {
      id: '1',
      title: 'Arrêt du Tribunal fédéral',
      abstract: 'Résumé de la décision.',
      canton: 'GE',
      date: '2024-03-15',
      keywords: [
        {
          id: 'k1',
          label: 'Santé',
          category: 'Santé et sécurité sociale',
        },
      ],
      hasPdf: true,
    }
    expect(decision.id).toBe('1')
  })

  it('Filters type has all required fields', () => {
    const filters: Filters = {
      q: '',
      canton: '',
      keywords: [],
      from: '',
      to: '',
      page: 1,
      sortDir: 'desc',
    }
    expect(filters.page).toBe(1)
  })

  it('DecisionsPage wraps a list with pageInfo and years', () => {
    const response: DecisionsPage = {
      list: [],
      pageInfo: {
        totalRows: 0,
        page: 1,
        pageSize: 25,
        isFirstPage: true,
        isLastPage: true,
      },
      years: [],
    }
    expect(response.pageInfo.totalRows).toBe(0)
  })
})
