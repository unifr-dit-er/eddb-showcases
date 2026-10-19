'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import DatePickerFilter from '@/components/DatePickerFilter'
import { useFacets } from '@/hooks/useFacets'
import { CANTONS, getCantonLabel } from '@/lib/cantons'
import { cn } from '@/lib/utils'
import type { KeywordFacet } from '@/types/keyword'
import { ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'

const SectionHeader = ({
  children,
  onReset,
  resetLabel,
}: {
  children: React.ReactNode
  onReset?: () => void
  resetLabel?: string
}) => (
  <div className="flex items-center justify-between mb-2.5">
    <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/65">
      {children}
    </p>
    {onReset && (
      <button
        onClick={onReset}
        className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
      >
        {resetLabel}
      </button>
    )}
  </div>
)

const Divider = () => <div className="h-px bg-sidebar-border/50 my-1" />

const FilterSidebar = () => {
  const { filters, setFilter, resetFilters, resetFilter } = useFilters()
  const { data: facets } = useFacets()
  const keywords = facets?.keywords ?? []
  const cantonCounts = new Map((facets?.cantons ?? []).map((c) => [c.value, c.count]))
  const { t, langSuffix } = useLanguage()
  const [qInput, setQInput] = useState(filters.q)
  const [syncedQ, setSyncedQ] = useState(filters.q)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  // The field follows the URL (reset, back button) without an effect.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    setQInput(filters.q)
  }

  // Group keywords by category. A keyword with multiple categories would appear
  // in each group — the checked state is shared via keyword ID regardless.
  const keywordsByCategory = keywords.reduce<Map<string, KeywordFacet[]>>((acc, kw) => {
    const cat = kw.category || '—'
    if (!acc.has(cat)) acc.set(cat, [])
    acc.get(cat)!.push(kw)
    return acc
  }, new Map())

  const sortedCategories = [...keywordsByCategory.keys()].sort()
  keywordsByCategory.forEach((kws) => kws.sort((a, b) => a.label.localeCompare(b.label)))

  const toggleKeyword = useCallback(
    (kwId: string) => {
      const next = filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
      setFilter('keywords', next)
    },
    [filters.keywords, setFilter]
  )

  const toggleOpen = useCallback((category: string, open: boolean) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (open) next.add(category)
      else next.delete(category)
      return next
    })
  }, [])

  const handleQKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setFilter('q', qInput)
  }

  const hasActiveFilters =
    filters.q ||
    filters.canton ||
    filters.keywords.length > 0 ||
    filters.from ||
    filters.to

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

      {/* Search */}
      <div>
        <SectionHeader
          onReset={filters.q ? () => resetFilter('q') : undefined}
          resetLabel={t('sidebar.clear')}
        >
          {t('sidebar.search.label')}
        </SectionHeader>
        <Input
          placeholder={t('sidebar.search.placeholder')}
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={handleQKeyDown}
          onBlur={() => setFilter('q', qInput)}
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
        />
      </div>

      <Divider />

      {/* Canton */}
      <div>
        <SectionHeader
          onReset={filters.canton ? () => resetFilter('canton') : undefined}
          resetLabel={t('sidebar.clear')}
        >
          {t('sidebar.canton.label')}
        </SectionHeader>
        <Select
          value={filters.canton || '_all'}
          onValueChange={(v) => setFilter('canton', v === '_all' || v === null ? '' : v)}
        >
          <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-9 text-base">
            {/* The name alone: the count belongs to the list. */}
            <SelectValue placeholder={t('sidebar.canton.all')}>
              {filters.canton ? getCantonLabel(filters.canton, langSuffix) : t('sidebar.canton.all')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('sidebar.canton.all')}</SelectItem>
            {CANTONS.map((c) => {
              const count = cantonCounts.get(c.code) ?? 0
              return (
                <SelectItem
                  key={c.code}
                  value={c.code}
                  disabled={!!facets && count === 0 && c.code !== filters.canton}
                  className="[&>span:last-child]:flex-1"
                >
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>{getCantonLabel(c.code, langSuffix)}</span>
                    {facets && <span className="text-xs text-muted-foreground tabular-nums">{count}</span>}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Divider />

      {/* Period */}
      <div>
        <SectionHeader
          onReset={(filters.from || filters.to) ? () => resetFilter('period') : undefined}
          resetLabel={t('sidebar.clear')}
        >
          {t('sidebar.period.label')}
        </SectionHeader>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-sidebar-foreground/65 mb-1 tracking-widest uppercase">
              {t('sidebar.period.from')}
            </p>
            <DatePickerFilter
              value={filters.from}
              onChange={(v) => setFilter('from', v)}
              placeholder={t('sidebar.period.from')}
            />
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/65 mb-1 tracking-widest uppercase">
              {t('sidebar.period.to')}
            </p>
            <DatePickerFilter
              value={filters.to}
              onChange={(v) => setFilter('to', v)}
              placeholder={t('sidebar.period.to')}
            />
          </div>
        </div>
      </div>

      {/* Keywords grouped by category */}
      {sortedCategories.length > 0 && (
        <>
          <Divider />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/65">
                {t('sidebar.keywords.label')}
              </p>
              <div className="flex items-center gap-2.5">
                {filters.keywords.length > 0 && (
                  <button
                    onClick={() => resetFilter('keywords')}
                    className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
                  >
                    {t('sidebar.clear')}
                  </button>
                )}
                {openCategories.size > 0 && (
                  <button
                    onClick={() => setOpenCategories(new Set())}
                    className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
                  >
                    {t('sidebar.keywords.collapseAll')}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-0.5">
              {sortedCategories.map((category) => {
                const catKeywords = keywordsByCategory.get(category)!
                const selectedCount = catKeywords.filter((kw) =>
                  filters.keywords.includes(kw.id)
                ).length
                const isOpen = openCategories.has(category)
                const isEmpty = selectedCount === 0 && catKeywords.every((kw) => kw.count === 0)

                return (
                  <Collapsible
                    key={category}
                    open={isOpen}
                    onOpenChange={(open) => toggleOpen(category, open)}
                  >
                    {/* The clear button sits beside the trigger, not inside
                        it: a button cannot contain another one. */}
                    <div className="flex items-center gap-1.5">
                      <CollapsibleTrigger className="flex flex-1 min-w-0 items-center justify-between py-1.5 text-left group">
                        <span
                          className={cn(
                            'text-sm text-sidebar-foreground/80 font-medium leading-tight',
                            isEmpty && 'opacity-45'
                          )}
                        >
                          {category}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {selectedCount > 0 && (
                            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 leading-5 font-semibold">
                              {selectedCount}
                            </span>
                          )}
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5 text-sidebar-foreground/65 transition-transform duration-150',
                              isOpen && 'rotate-90'
                            )}
                          />
                        </div>
                      </CollapsibleTrigger>
                      {selectedCount > 0 && (
                        <button
                          onClick={() => {
                            const catIds = catKeywords.map((kw) => kw.id)
                            setFilter('keywords', filters.keywords.filter((k) => !catIds.includes(k)))
                          }}
                          aria-label={`${t('sidebar.clear')} : ${category}`}
                          className="shrink-0 text-[10px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <CollapsibleContent>
                      <div className="space-y-2 pl-1 pt-1 pb-2">
                        {catKeywords.map((kw) => {
                          const checked = filters.keywords.includes(kw.id)
                          // A keyword that would leave no decision is greyed out.
                          const empty = kw.count === 0 && !checked
                          return (
                            <div key={kw.id} className={cn('flex items-center gap-2.5', empty && 'opacity-45')}>
                              <Checkbox
                                id={`kw-${category}-${kw.id}`}
                                checked={checked}
                                disabled={empty}
                                onCheckedChange={() => toggleKeyword(kw.id)}
                                className="border-sidebar-border/60"
                              />
                              <label
                                htmlFor={`kw-${category}-${kw.id}`}
                                className={cn(
                                  'flex-1 flex items-center justify-between gap-1.5 text-sm text-sidebar-foreground/80 leading-tight',
                                  empty ? 'cursor-default' : 'cursor-pointer'
                                )}
                              >
                                <span>{kw.label}</span>
                                <span className="text-[10px] text-sidebar-foreground/65 tabular-nums shrink-0">
                                  {kw.count}
                                </span>
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </>
      )}


    </div>
  )
}

export default FilterSidebar
