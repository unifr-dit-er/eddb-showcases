import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAllRecords, fetchNocoDB } from '../nocodb'

describe('fetchNocoDB', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_NOCODB_API_URL', 'http://localhost:8080')
    vi.stubEnv('NOCODB_API_TOKEN', 'test-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('calls the correct URL with auth header', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ list: [], pageInfo: {} }),
    } as Response)

    await fetchNocoDB('/api/v1/db/data/noco/decisions')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/db/data/noco/decisions',
      expect.objectContaining({
        headers: expect.objectContaining({ 'xc-token': 'test-token' }),
      })
    )
  })

  it('appends query params when provided', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await fetchNocoDB('/api/v1/db/data/noco/decisions', { where: '(canton,eq,GE)', limit: '25' })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('where=%28canton%2Ceq%2CGE%29')
    expect(calledUrl).toContain('limit=25')
  })

  it('throws when response is not ok', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as unknown as Response)

    await expect(fetchNocoDB('/api/v1/db/data/noco/decisions')).rejects.toThrow('NocoDB error: 401')
  })
})

describe('fetchAllRecords', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_NOCODB_API_URL', 'http://localhost:8080')
    vi.stubEnv('NOCODB_API_TOKEN', 'test-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('follows the pages and asks only for the given fields', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ list: [{ Id: 1 }], pageInfo: { isLastPage: false } }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ list: [{ Id: 2 }], pageInfo: { isLastPage: true } }) } as Response)

    expect(await fetchAllRecords('t1', ['Id', 'Date'])).toEqual([{ Id: 1 }, { Id: 2 }])
    const second = new URL(mockFetch.mock.calls[1][0] as string)
    expect(second.searchParams.get('fields')).toBe('Id,Date')
    expect(second.searchParams.get('offset')).toBe('1000')
  })
})
