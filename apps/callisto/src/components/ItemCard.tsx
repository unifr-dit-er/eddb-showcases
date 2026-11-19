'use client'

import { Tag } from '@eddb/showcase-kit/tag'
import { Emphasis } from '@/components/Emphasis'
import type { RepresentationSummary } from '@/types/collection'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters, type MultiFilter } from '@/hooks/useFilters'
import { formatDating } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ItemCardProps {
  item: RepresentationSummary
  isActive: boolean
  onClick: () => void
}

const MAX_SUBJECTS = 4

export const ItemCard = ({ item, isActive, onClick }: ItemCardProps) => {
  const { t } = useLanguage()
  const { filters, toggleValue } = useFilters()

  const toggle = (e: React.MouseEvent, key: MultiFilter, value: string) => {
    e.stopPropagation()
    toggleValue(key, value)
  }

  const dating = formatDating(item.dateFrom, item.dateTo)
  const extraSubjects = item.subjects.length - MAX_SUBJECTS
  // Category, form and material: the object at a glance.
  const facts: { key: MultiFilter; value: string }[] = [
    { key: 'categories', value: item.category },
    { key: 'forms', value: item.form },
    { key: 'materials', value: item.material },
  ].filter((f): f is { key: MultiFilter; value: string } => !!f.value)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group w-full text-left rounded-xl bg-card border shadow-sm px-5 py-4 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        isActive
          ? 'border-primary-tint-2 shadow-md ring-1 ring-primary-tint-3'
          : 'border-border hover:shadow-md hover:border-primary-tint-2'
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-[0.8125rem]">
        <span className="font-mono text-[0.75rem] text-muted-foreground tabular-nums">
          {t('item.number')} {item.id}
        </span>
        {item.period && (
          <>
            <span className="text-border" aria-hidden>|</span>
            <span
              onClick={(e) => toggle(e, 'periods', item.period)}
              className={cn(
                'text-[0.6875rem] font-semibold tracking-[0.15em] uppercase transition-colors cursor-pointer',
                filters.periods.includes(item.period) ? 'text-primary-ink' : 'text-muted-foreground hover:text-primary-ink'
              )}
            >
              {item.period}
            </span>
          </>
        )}
        <span className="text-border" aria-hidden>|</span>
        <span className="text-primary-ink font-medium tabular-nums">{dating || t('item.undated')}</span>
      </div>

      <h3 className="font-serif text-[1.1875rem] font-semibold leading-snug text-foreground line-clamp-2 mb-1.5">
        {item.title}
      </h3>

      {item.excerpt && (
        <p className="text-[0.9375rem] leading-relaxed text-foreground/70 line-clamp-2 mb-3">
          <Emphasis>{item.excerpt}</Emphasis>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {facts.map((f) => (
          <Tag
            key={f.key}
            variant="caps"
            onClick={(e) => toggle(e, f.key, f.value)}
            active={filters[f.key].includes(f.value)}
          >
            {f.value}
          </Tag>
        ))}
        {item.subjects.slice(0, MAX_SUBJECTS).map((s) => (
          <Tag key={s} onClick={(e) => toggle(e, 'subjects', s)} active={filters.subjects.includes(s)}>
            {s}
          </Tag>
        ))}
        {extraSubjects > 0 && <span className="text-xs text-muted-foreground">+{extraSubjects}</span>}
      </div>
    </article>
  )
}
