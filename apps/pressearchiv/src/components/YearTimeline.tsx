'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'

interface YearTimelineProps {
  // Counts of the current results, year filter excluded.
  years: { year: number; count: number }[]
  // Full span of the archive, so the axis does not jump between filters.
  min: number
  max: number
}

const HEIGHT = 56

// Single-series column chart: one hue (primary), thin bars with a 2px gap and
// rounded tops, recessive axis; the selected period stays in primary while
// the other years recede. Click selects a year, shift-click extends the period.
export const YearTimeline = ({ years, min, max }: YearTimelineProps) => {
  const { t } = useLanguage()
  const { filters, setFilters } = useFilters()
  const [hovered, setHovered] = useState<number | null>(null)

  const bars = useMemo(() => {
    const counts = new Map(years.map((y) => [y.year, y.count]))
    const span = []
    for (let y = min; y <= max; y++) span.push({ year: y, count: counts.get(y) ?? 0 })
    return span
  }, [years, min, max])

  if (bars.length === 0) return null

  const peak = Math.max(1, ...bars.map((b) => b.count))
  const from = filters.from ? Number(filters.from) : null
  const to = filters.to ? Number(filters.to) : null
  const hasPeriod = from !== null || to !== null
  const inPeriod = (year: number) =>
    (from === null || year >= from) && (to === null || year <= to)

  const select = (year: number, extend: boolean) => {
    if (extend && hasPeriod) {
      const start = Math.min(from ?? year, year)
      const end = Math.max(to ?? year, year)
      setFilters({ from: String(start), to: String(end) })
    } else if (from === year && to === year) {
      setFilters({ from: '', to: '' })
    } else {
      setFilters({ from: String(year), to: String(year) })
    }
  }

  const unit = (count: number) =>
    count === 1 ? t('timeline.records_singular') : t('timeline.records_plural')
  const active = bars.find((b) => b.year === hovered)

  return (
    <figure className="space-y-1.5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground">
          {t('timeline.label')}
        </span>
        <span className="text-[0.75rem] text-muted-foreground/70 tabular-nums text-right">
          {active ? (
            `${active.year} · ${active.count} ${unit(active.count)}`
          ) : (
            <span className="hidden sm:inline">{t('timeline.hint')}</span>
          )}
        </span>
      </figcaption>

      <div
        className="flex items-end gap-[2px] border-b border-border"
        style={{ height: HEIGHT }}
        onMouseLeave={() => setHovered(null)}
      >
        {bars.map((bar) => {
          const highlighted = !hasPeriod || inPeriod(bar.year)
          const height = bar.count === 0 ? 0 : Math.max(2, Math.round((bar.count / peak) * (HEIGHT - 4)))
          return (
            <button
              key={bar.year}
              type="button"
              onClick={(e) => select(bar.year, e.shiftKey)}
              onMouseEnter={() => setHovered(bar.year)}
              onFocus={() => setHovered(bar.year)}
              onBlur={() => setHovered(null)}
              aria-label={`${bar.year} : ${bar.count} ${unit(bar.count)}`}
              aria-pressed={hasPeriod && inPeriod(bar.year)}
              // The hit target is the whole column, taller than the bar.
              className="group relative flex-1 min-w-0 h-full flex items-end cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-t-sm"
            >
              <span
                className={cn(
                  'w-full rounded-t-[4px] transition-colors',
                  highlighted ? 'bg-primary' : 'bg-primary-tint-3',
                  hovered === bar.year && (highlighted ? 'bg-primary-tint-1' : 'bg-primary-tint-2')
                )}
                style={{ height }}
              />
            </button>
          )
        })}
      </div>

      <div className="flex gap-[2px]" aria-hidden>
        {bars.map((bar, i) => (
          <span
            key={bar.year}
            className={cn(
              'flex-1 min-w-0 text-center text-[0.625rem] tabular-nums text-muted-foreground/70',
              // Every other year, on two digits, on narrow screens.
              i % 2 === 1 && 'invisible sm:visible',
              hovered === bar.year && 'text-foreground'
            )}
          >
            <span className="sm:hidden">{String(bar.year).slice(2)}</span>
            <span className="hidden sm:inline">{bar.year}</span>
          </span>
        ))}
      </div>
    </figure>
  )
}
