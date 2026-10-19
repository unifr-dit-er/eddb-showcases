'use client'

import { DEFAULT_FILTERS, type Filters } from '@/types/filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

// Query string of the filters for the API routes (same names as the URL).
export const filtersToQueryString = (filters: Filters, extra: Record<string, string> = {}): string => {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.canton) params.set('canton', filters.canton)
  filters.keywords.forEach((k) => params.append('keyword', k))
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.sortDir === 'asc') params.set('sort', 'asc')
  Object.entries(extra).forEach(([key, value]) => params.set(key, value))
  return params.toString()
}

export const useFilters = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: Filters = {
    q: searchParams.get('q') ?? '',
    canton: searchParams.get('canton') ?? '',
    keywords: searchParams.getAll('keyword'),
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    page: Number(searchParams.get('page') ?? '1'),
    sortDir: searchParams.get('sort') === 'asc' ? 'asc' : 'desc',
  }

  const setFilter = useCallback(
    (key: keyof Filters, value: string | string[] | number) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset page when changing any filter
      params.delete('page')

      const paramName = key === 'keywords' ? 'keyword' : key === 'sortDir' ? 'sort' : key

      if (Array.isArray(value)) {
        params.delete(paramName)
        value.forEach((v) => params.append(paramName, v))
      } else if (value === '' || value === 0) {
        params.delete(paramName)
      } else {
        params.set(paramName, String(value))
      }

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [searchParams, router, pathname]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const resetFilter = useCallback(
    (key: 'q' | 'canton' | 'period' | 'keywords') => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      if (key === 'period') {
        params.delete('from')
        params.delete('to')
      } else if (key === 'keywords') {
        params.delete('keyword')
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [searchParams, router, pathname]
  )

  // Several filters at once (both bounds of a period).
  const setFilters = useCallback(
    (changes: Partial<Record<'from' | 'to', string>>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [searchParams, router, pathname]
  )

  return { filters, setFilter, setFilters, resetFilters, resetFilter }
}

// Re-export DEFAULT_FILTERS for convenience (not used in hook body but available)
export { DEFAULT_FILTERS }
