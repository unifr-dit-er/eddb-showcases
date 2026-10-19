'use client'

import { DEFAULT_FILTERS, type Filters } from '@/types/filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

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

  return { filters, setFilter, resetFilters, resetFilter }
}

// Re-export DEFAULT_FILTERS for convenience (not used in hook body but available)
export { DEFAULT_FILTERS }
