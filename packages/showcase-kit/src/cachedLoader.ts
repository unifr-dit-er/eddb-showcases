/**
 * A value loaded on demand and kept for `ttlMs`: the in-memory copy of a
 * showcase's base, server-side. Concurrent callers share one load; when a
 * refresh fails, the previous copy keeps being served.
 */
export const cachedLoader = <T>(load: () => Promise<T>, ttlMs: number): (() => Promise<T>) => {
  let cache: { value: T; loadedAt: number } | null = null
  let pending: Promise<T> | null = null

  return () => {
    if (cache && Date.now() - cache.loadedAt < ttlMs) return Promise.resolve(cache.value)
    if (!pending) {
      pending = load()
        .then((value) => {
          cache = { value, loadedAt: Date.now() }
          return value
        })
        .finally(() => {
          pending = null
        })
    }
    return pending.catch((error) => {
      if (cache) return cache.value
      throw error
    })
  }
}
