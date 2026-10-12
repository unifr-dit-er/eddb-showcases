'use client'

import { DEFAULT_FILTERS, type ArchiveFilters } from '@/types/archive'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

// URL parameter of each filter; the URL is the single source of truth, so
// any view of the archive can be shared as a link.
const PARAM: Record<keyof ArchiveFilters, string> = {
  q: 'q',
  series: 'series',
  collection: 'collection',
  journal: 'journal',
  keywords: 'keyword',
  language: 'lang',
  from: 'from',
  to: 'to',
  page: 'page',
  sortDir: 'sort',
}

export type ResettableFilter = 'q' | 'collections' | 'period' | 'journal' | 'language' | 'keywords'

const RESET_PARAMS: Record<ResettableFilter, string[]> = {
  q: ['q'],
  collections: ['series', 'collection'],
  period: ['from', 'to'],
  journal: ['journal'],
  language: ['lang'],
  keywords: ['keyword'],
}

export const filtersToQueryString = (filters: ArchiveFilters): string => {
  const params = new URLSearchParams()
  ;(Object.keys(PARAM) as (keyof ArchiveFilters)[]).forEach((key) => {
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

  const filters: ArchiveFilters = useMemo(() => {
    const collection = searchParams.get('collection')
    return {
      q: searchParams.get('q') ?? '',
      series: searchParams.get('series') ?? '',
      collection: collection === 'press' || collection === 'documents' ? collection : '',
      journal: searchParams.get('journal') ?? '',
      keywords: searchParams.getAll('keyword'),
      language: searchParams.get('lang') ?? '',
      from: searchParams.get('from') ?? '',
      to: searchParams.get('to') ?? '',
      page: Number(searchParams.get('page') ?? '1') || 1,
      sortDir: searchParams.get('sort') === 'asc' ? 'asc' : 'desc',
    }
  }, [searchParams])

  const push = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  // Several filters at once (e.g. a series and its collection, a period).
  const setFilters = useCallback(
    (changes: Partial<ArchiveFilters>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Any change but the page itself goes back to the first page.
      if (!('page' in changes)) params.delete('page')
      ;(Object.keys(changes) as (keyof ArchiveFilters)[]).forEach((key) => {
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
    <K extends keyof ArchiveFilters>(key: K, value: ArchiveFilters[K]) =>
      setFilters({ [key]: value } as Partial<ArchiveFilters>),
    [setFilters]
  )

  const toggleKeyword = useCallback(
    (keyword: string) =>
      setFilter(
        'keywords',
        filters.keywords.includes(keyword)
          ? filters.keywords.filter((k) => k !== keyword)
          : [...filters.keywords, keyword]
      ),
    [filters.keywords, setFilter]
  )

  const resetFilter = useCallback(
    (key: ResettableFilter) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      RESET_PARAMS[key].forEach((name) => params.delete(name))
      push(params)
    },
    [searchParams, push]
  )

  // Keeps the open article and the sort order, drops every filter.
  const resetFilters = useCallback(() => {
    const params = new URLSearchParams()
    const article = searchParams.get('article')
    const sort = searchParams.get('sort')
    if (article) params.set('article', article)
    if (sort) params.set('sort', sort)
    push(params)
  }, [searchParams, push])

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.series ||
      filters.collection ||
      filters.journal ||
      filters.language ||
      filters.keywords.length ||
      filters.from ||
      filters.to
  )

  return { filters, setFilter, setFilters, toggleKeyword, resetFilter, resetFilters, hasActiveFilters }
}
