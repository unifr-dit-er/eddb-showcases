'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FacetList } from '@/components/FacetList'
import { FilterSection } from '@/components/FilterSection'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFacets } from '@/hooks/useFacets'
import { useFilters, type MultiFilter, type ResettableFilter } from '@/hooks/useFilters'
import { TIMELINE_BUCKET } from '@/lib/collection-config'
import { formatYear } from '@/lib/format'
import type { CountedValue, Facets } from '@/types/collection'
import { useMemo, useState } from 'react'

const ALL = '_all'

const Divider = () => <div className="h-px bg-sidebar-border/50 my-1" />

const selectTriggerClass = 'w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-9 text-sm'

// Facets of the sidebar, in the order of the former showcase. Short lists
// show in full; long ones (forms, subjects) get a search field.
const FACETS: {
  key: MultiFilter
  facet: keyof Pick<Facets, 'periods' | 'materials' | 'categories' | 'forms' | 'centres' | 'subjects'>
  title: Parameters<ReturnType<typeof useLanguage>['t']>[0]
  placeholder?: Parameters<ReturnType<typeof useLanguage>['t']>[0]
  defaultOpen?: boolean
}[] = [
  { key: 'periods', facet: 'periods', title: 'sidebar.periods.label', defaultOpen: true },
  { key: 'materials', facet: 'materials', title: 'sidebar.materials.label' },
  { key: 'categories', facet: 'categories', title: 'sidebar.categories.label' },
  { key: 'forms', facet: 'forms', title: 'sidebar.forms.label', placeholder: 'sidebar.forms.placeholder' },
  { key: 'subjects', facet: 'subjects', title: 'sidebar.subjects.label', placeholder: 'sidebar.subjects.placeholder' },
  { key: 'centres', facet: 'centres', title: 'sidebar.centres.label' },
]

export const FilterSidebar = () => {
  const { filters, setFilter, setFilters, toggleValue, resetFilter, resetFilters, hasActiveFilters } = useFilters()
  const { data: facets } = useFacets()
  const { t } = useLanguage()
  const [qInput, setQInput] = useState(filters.q)
  const [syncedQ, setSyncedQ] = useState(filters.q)

  // The field follows the URL (reset, back button) without an effect.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    setQInput(filters.q)
  }

  // Centuries of the collection, as bounds of the dating filter.
  const centuries = useMemo(() => {
    if (!facets || facets.years.min === facets.years.max) return []
    const list: number[] = []
    const first = Math.floor(facets.years.min / TIMELINE_BUCKET) * TIMELINE_BUCKET
    for (let y = first; y <= facets.years.max; y += TIMELINE_BUCKET) list.push(y)
    return list
  }, [facets])

  const reset = (key: ResettableFilter, active: boolean) => (active ? () => resetFilter(key) : undefined)

  const setBound = (bound: 'from' | 'to', value: string) => {
    if (value === ALL) return setFilters({ [bound]: '' })
    const start = Number(value)
    const next = {
      from: filters.from,
      to: filters.to,
      [bound]: String(bound === 'from' ? start : start + TIMELINE_BUCKET - 1),
    }
    // Keep the period in order whichever bound moved.
    if (next.from && next.to && Number(next.from) > Number(next.to)) {
      if (bound === 'from') next.to = String(start + TIMELINE_BUCKET - 1)
      else next.from = String(start)
    }
    setFilters(next)
  }

  const boundValue = (bound: 'from' | 'to') => {
    const value = filters[bound]
    if (!value) return ALL
    return String(Math.floor(Number(value) / TIMELINE_BUCKET) * TIMELINE_BUCKET)
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {hasActiveFilters && (
        <>
          <button
            onClick={resetFilters}
            className="w-full text-[13px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
          >
            {t('sidebar.resetFilters')}
          </button>
          <Divider />
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/65">
            {t('sidebar.search.label')}
          </p>
          {filters.q && (
            <button
              onClick={() => resetFilter('q')}
              className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
            >
              {t('sidebar.clear')}
            </button>
          )}
        </div>
        <Input
          type="search"
          placeholder={t('sidebar.search.placeholder')}
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFilter('q', qInput)
          }}
          onBlur={() => qInput !== filters.q && setFilter('q', qInput)}
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:border-sidebar-primary focus-visible:ring-sidebar-primary/30 h-9 text-base"
        />
      </div>

      <Divider />

      <FilterSection
        title={t('sidebar.dating.label')}
        activeCount={(filters.from ? 1 : 0) + (filters.to ? 1 : 0)}
        onReset={reset('period', !!(filters.from || filters.to))}
      >
        <div className="grid grid-cols-2 gap-2">
          {(['from', 'to'] as const).map((bound) => (
            <div key={bound}>
              <p className="text-[11px] text-sidebar-foreground/65 mb-1 tracking-widest uppercase">
                {t(bound === 'from' ? 'sidebar.dating.from' : 'sidebar.dating.to')}
              </p>
              <Select value={boundValue(bound)} onValueChange={(v) => setBound(bound, v)}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t('sidebar.dating.any')}</SelectItem>
                  {centuries.map((start) => (
                    <SelectItem key={start} value={String(start)}>
                      {formatYear(bound === 'from' ? start : start + TIMELINE_BUCKET - 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </FilterSection>

      {FACETS.map(({ key, facet, title, placeholder, defaultOpen }) => {
        const values: CountedValue[] = facets?.[facet] ?? []
        return (
          <div key={key} className="space-y-5">
            <Divider />
            <FilterSection
              title={t(title)}
              activeCount={filters[key].length}
              onReset={reset(key, filters[key].length > 0)}
              defaultOpen={defaultOpen}
            >
              {facets && (
                <FacetList
                  id={key}
                  values={values}
                  selected={filters[key]}
                  onToggle={(v) => toggleValue(key, v)}
                  placeholder={placeholder ? t(placeholder) : undefined}
                  multiple
                  initialCount={placeholder ? 8 : values.length}
                  scroll={!!placeholder}
                />
              )}
            </FilterSection>
          </div>
        )
      })}
    </div>
  )
}
