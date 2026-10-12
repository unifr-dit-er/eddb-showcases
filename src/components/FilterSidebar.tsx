'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollectionTree } from '@/components/CollectionTree'
import { FacetList } from '@/components/FacetList'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFacets } from '@/hooks/useFacets'
import { useFilters, type ResettableFilter } from '@/hooks/useFilters'
import { useMemo, useState } from 'react'

const ALL = '_all'

const SectionHeader = ({
  children,
  onReset,
}: {
  children: React.ReactNode
  onReset?: () => void
}) => {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/45">{children}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
        >
          {t('sidebar.clear')}
        </button>
      )}
    </div>
  )
}

const Divider = () => <div className="h-px bg-sidebar-border/50 my-1" />

const selectTriggerClass = 'w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-9 text-sm'

export const FilterSidebar = () => {
  const { filters, setFilter, setFilters, toggleKeyword, resetFilter, resetFilters, hasActiveFilters } = useFilters()
  const { data: facets } = useFacets()
  const { t, label, locale } = useLanguage()
  const [qInput, setQInput] = useState(filters.q)
  const [syncedQ, setSyncedQ] = useState(filters.q)

  // The field follows the URL (reset, back button) without an effect.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    setQInput(filters.q)
  }

  const years = useMemo(() => {
    if (!facets || !facets.years.max) return []
    const list = []
    for (let y = facets.years.max; y >= facets.years.min; y--) list.push(String(y))
    return list
  }, [facets])

  const languages = useMemo(
    () =>
      (facets?.languages ?? [])
        .map((l) => ({ ...l, name: label('language', l.value) }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, locale)),
    [facets, label, locale]
  )

  const reset = (key: ResettableFilter, active: boolean) => (active ? () => resetFilter(key) : undefined)

  const setYear = (bound: 'from' | 'to', value: string) => {
    const next = { from: filters.from, to: filters.to, [bound]: value === ALL ? '' : value }
    // Keep the period in order whichever bound moved.
    if (next.from && next.to && next.from > next.to) {
      if (bound === 'from') next.to = next.from
      else next.from = next.to
    }
    setFilters(next)
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {hasActiveFilters && (
        <>
          <button
            onClick={resetFilters}
            className="w-full text-[13px] text-sidebar-foreground/45 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
          >
            {t('sidebar.resetFilters')}
          </button>
          <Divider />
        </>
      )}

      <div>
        <SectionHeader onReset={reset('q', !!filters.q)}>{t('sidebar.search.label')}</SectionHeader>
        <Input
          type="search"
          placeholder={t('sidebar.search.placeholder')}
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFilter('q', qInput)
          }}
          onBlur={() => qInput !== filters.q && setFilter('q', qInput)}
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
        />
      </div>

      <Divider />

      <div>
        <SectionHeader onReset={reset('collections', !!filters.series)}>{t('sidebar.collections.label')}</SectionHeader>
        {facets && <CollectionTree series={facets.series} />}
      </div>

      <Divider />

      <div>
        <SectionHeader onReset={reset('period', !!(filters.from || filters.to))}>{t('sidebar.period.label')}</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          {(['from', 'to'] as const).map((bound) => (
            <div key={bound}>
              <p className="text-[11px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">
                {t(bound === 'from' ? 'sidebar.period.from' : 'sidebar.period.to')}
              </p>
              <Select value={filters[bound] || ALL} onValueChange={(v) => setYear(bound, v)}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t('sidebar.period.any')}</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div>
        <SectionHeader onReset={reset('language', !!filters.language)}>{t('sidebar.language.label')}</SectionHeader>
        <Select value={filters.language || ALL} onValueChange={(v) => setFilter('language', v === ALL ? '' : v)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('sidebar.language.all')}</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.name} ({l.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Divider />

      <div>
        <SectionHeader onReset={reset('journal', !!filters.journal)}>{t('sidebar.journal.label')}</SectionHeader>
        {facets && (
          <FacetList
            id="journal"
            values={facets.journals}
            selected={filters.journal ? [filters.journal] : []}
            onToggle={(v) => setFilter('journal', filters.journal === v ? '' : v)}
            placeholder={t('sidebar.journal.placeholder')}
          />
        )}
      </div>

      <Divider />

      <div>
        <SectionHeader onReset={reset('keywords', filters.keywords.length > 0)}>{t('sidebar.keywords.label')}</SectionHeader>
        {facets && (
          <FacetList
            id="keyword"
            values={facets.keywords}
            selected={filters.keywords}
            onToggle={toggleKeyword}
            placeholder={t('sidebar.keywords.placeholder')}
            multiple
            initialCount={12}
          />
        )}
      </div>
    </div>
  )
}
