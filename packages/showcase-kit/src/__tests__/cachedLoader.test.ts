import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cachedLoader } from '../cachedLoader'

describe('cachedLoader', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('loads once while fresh, shared by concurrent callers', async () => {
    const load = vi.fn().mockResolvedValue('a')
    const get = cachedLoader(load, 1000)
    expect(await Promise.all([get(), get()])).toEqual(['a', 'a'])
    expect(await get()).toBe('a')
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('reloads after the TTL', async () => {
    const load = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b')
    const get = cachedLoader(load, 1000)
    await get()
    vi.advanceTimersByTime(1001)
    expect(await get()).toBe('b')
  })

  it('keeps the previous copy when a refresh fails', async () => {
    const load = vi.fn().mockResolvedValueOnce('a').mockRejectedValueOnce(new Error('down'))
    const get = cachedLoader(load, 1000)
    await get()
    vi.advanceTimersByTime(1001)
    expect(await get()).toBe('a')
  })

  it('fails when nothing was ever loaded', async () => {
    const get = cachedLoader(vi.fn().mockRejectedValue(new Error('down')), 1000)
    await expect(get()).rejects.toThrow('down')
  })
})
