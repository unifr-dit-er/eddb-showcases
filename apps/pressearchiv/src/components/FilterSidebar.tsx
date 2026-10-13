'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FacetCombobox } from '@/components/FacetCombobox'
import { FacetList } from '@/components/FacetList'
import { FilterSection } from '@/components/FilterSection'
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
      <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/65">{children}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
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
  const { filters, setFilter, setFilters, toggleKeyword, toggleType, resetFilter, resetFilters, hasActiveFilters } = useFilters()
  const { data: facets } = useFacets()
  const { t, label, locale, seriesTitle } = useLanguage()
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

  // Server order (frequency in the whole archive): stable while filtering.
  const languages = useMemo(
    () => (facets?.languages ?? []).map((l) => ({ ...l, name: label('language', l.value) })),
    [facets, label]
  )

  // The series as they are in the base, the two Swiss-wide ones first.
  const series = useMemo(() => {
    const list = [...(facets?.series ?? [])].sort(
      (a, b) =>
        Number(b.national) - Number(a.national) || seriesTitle(a).localeCompare(seriesTitle(b), locale)
    )
    return {
      values: list.map((s) => ({ value: s.id, count: s.count })),
      titles: new Map(list.map((s) => [s.id, seriesTitle(s)])),
      national: new Set(list.filter((s) => s.national).map((s) => s.id)),
    }
  }, [facets, seriesTitle, locale])

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
            className="w-full text-[13px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
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
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
        />
      </div>

      <Divider />

      <FilterSection
        title={t('sidebar.series.label')}
        activeCount={filters.series ? 1 : 0}
        onReset={reset('series', !!filters.series)}
        defaultOpen
      >
        {facets && (
          <FacetList
            id="series"
            values={series.values}
            selected={filters.series ? [filters.series] : []}
            onToggle={(v) => setFilter('series', filters.series === v ? '' : v)}
            label={(v) => series.titles.get(v) ?? v}
            initialCount={series.values.length}
            columns={2}
            wide={(v) => series.national.has(v)}
          />
        )}
      </FilterSection>

      <Divider />

      <FilterSection
        title={t('sidebar.types.label')}
        activeCount={filters.types.length}
        onReset={reset('types', filters.types.length > 0)}
        defaultOpen
      >
        {facets && (
          <FacetList
            id="type"
            values={facets.recordTypes}
            selected={filters.types}
            onToggle={toggleType}
            label={(v) => label('recordType', v)}
            multiple
            initialCount={facets.recordTypes.length}
          />
        )}
      </FilterSection>

      <Divider />

      <FilterSection
        title={t('sidebar.period.label')}
        activeCount={(filters.from ? 1 : 0) + (filters.to ? 1 : 0)}
        onReset={reset('period', !!(filters.from || filters.to))}
      >
        <div className="grid grid-cols-2 gap-2">
          {(['from', 'to'] as const).map((bound) => (
            <div key={bound}>
              <p className="text-[11px] text-sidebar-foreground/65 mb-1 tracking-widest uppercase">
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
      </FilterSection>

      <Divider />

      <FilterSection
        title={t('sidebar.language.label')}
        activeCount={filters.language ? 1 : 0}
        onReset={reset('language', !!filters.language)}
      >
        <Select value={filters.language || ALL} onValueChange={(v) => setFilter('language', v === ALL ? '' : v)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('sidebar.language.all')}</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l.value} value={l.value} disabled={l.count === 0 && l.value !== filters.language}>
                {l.name} ({l.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <Divider />

      <FilterSection
        title={t('sidebar.journal.label')}
        activeCount={filters.journal ? 1 : 0}
        onReset={reset('journal', !!filters.journal)}
      >
        {facets && (
          <FacetCombobox
            values={facets.journals}
            selected={filters.journal}
            onSelect={(v) => setFilter('journal', v)}
            placeholder={t('sidebar.journal.choose')}
            searchPlaceholder={t('sidebar.journal.placeholder')}
            emptyLabel={t('sidebar.journal.empty')}
            removeLabel={t('activeFilters.remove')}
          />
        )}
      </FilterSection>

      <Divider />

      <FilterSection
        title={t('sidebar.keywords.label')}
        activeCount={filters.keywords.length}
        onReset={reset('keywords', filters.keywords.length > 0)}
      >
        {facets && (
          <FacetList
            id="keyword"
            values={facets.keywords}
            selected={filters.keywords}
            onToggle={toggleKeyword}
            placeholder={t('sidebar.keywords.placeholder')}
            multiple
            initialCount={8}
            scroll
          />
        )}
      </FilterSection>
    </div>
  )
}
