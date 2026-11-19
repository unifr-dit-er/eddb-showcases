'use client'

import { DEFAULT_FILTERS, type CollectionFilters, type SortKey } from '@/types/collection'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

// URL parameter of each filter; the URL is the single source of truth, so
// any view of the collection can be shared as a link.
const PARAM: Record<keyof CollectionFilters, string> = {
  q: 'q',
  periods: 'period',
  materials: 'material',
  categories: 'category',
  forms: 'form',
  centres: 'centre',
  subjects: 'subject',
  from: 'from',
  to: 'to',
  page: 'page',
  sort: 'sort',
  sortDir: 'dir',
}

export type MultiFilter = 'periods' | 'materials' | 'categories' | 'forms' | 'centres' | 'subjects'
export type ResettableFilter = 'q' | 'period' | MultiFilter

const SORT_KEYS: readonly SortKey[] = ['number', 'title', 'date']

export const filtersToQueryString = (filters: CollectionFilters): string => {
  const params = new URLSearchParams()
  ;(Object.keys(PARAM) as (keyof CollectionFilters)[]).forEach((key) => {
    const value = filters[key]
    if (Array.isArray(value)) value.forEach((v) => params.append(PARAM[key], v))
    else if (value !== DEFAULT_FILTERS[key] && value !== '') params.set(PARAM[key], String(value))
  })
  return params.toString()
}

export const useFilters = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: CollectionFilters = useMemo(() => {
    const sort = searchParams.get('sort') as SortKey
    return {
      q: searchParams.get('q') ?? '',
      periods: searchParams.getAll('period'),
      materials: searchParams.getAll('material'),
      categories: searchParams.getAll('category'),
      forms: searchParams.getAll('form'),
      centres: searchParams.getAll('centre'),
      subjects: searchParams.getAll('subject'),
      from: searchParams.get('from') ?? '',
      to: searchParams.get('to') ?? '',
      page: Number(searchParams.get('page') ?? '1') || 1,
      sort: SORT_KEYS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
      sortDir: searchParams.get('dir') === 'desc' ? 'desc' : 'asc',
    }
  }, [searchParams])

  const push = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  // Several filters at once (e.g. both bounds of a period).
  const setFilters = useCallback(
    (changes: Partial<CollectionFilters>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Any change but the page itself goes back to the first page.
      if (!('page' in changes)) params.delete('page')
      ;(Object.keys(changes) as (keyof CollectionFilters)[]).forEach((key) => {
        const value = changes[key]
        const name = PARAM[key]
        params.delete(name)
        if (Array.isArray(value)) value.forEach((v) => params.append(name, v))
        else if (value !== undefined && value !== '' && value !== DEFAULT_FILTERS[key]) {
          params.set(name, String(value))
        }
      })
      push(params)
    },
    [searchParams, push]
  )

  const setFilter = useCallback(
    <K extends keyof CollectionFilters>(key: K, value: CollectionFilters[K]) =>
      setFilters({ [key]: value } as Partial<CollectionFilters>),
    [setFilters]
  )

  // Adds or removes one value of a multi-valued filter.
  const toggleValue = useCallback(
    (key: MultiFilter, value: string) =>
      setFilter(
        key,
        filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value]
      ),
    [filters, setFilter]
  )

  const resetFilter = useCallback(
    (key: ResettableFilter) => {
      if (key === 'period') setFilters({ from: '', to: '' })
      else if (key === 'q') setFilter('q', '')
      else setFilter(key, [])
    },
    [setFilter, setFilters]
  )

  // Keeps the open record and the sort order, drops every filter.
  const resetFilters = useCallback(() => {
    const params = new URLSearchParams()
    for (const name of ['item', 'sort', 'dir']) {
      const value = searchParams.get(name)
      if (value) params.set(name, value)
    }
    push(params)
  }, [searchParams, push])

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.periods.length ||
      filters.materials.length ||
      filters.categories.length ||
      filters.forms.length ||
      filters.centres.length ||
      filters.subjects.length ||
      filters.from ||
      filters.to
  )

  return { filters, setFilter, setFilters, toggleValue, resetFilter, resetFilters, hasActiveFilters }
}
