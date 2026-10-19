'use client'

import { useMemo, useState } from 'react'

export interface YearCount {
  year: number
  count: number
}

interface YearTimelineProps {
  // Counts of the current results, period filter excluded, so the timeline
  // keeps showing where the other matches lie.
  years: YearCount[]
  // Full span of the base, so the axis does not jump between filters.
  min: number
  max: number
  // Selected period (years), null when open.
  from: number | null
  to: number | null
  onSelect: (from: number | null, to: number | null) => void
  labels: {
    title: string
    hint: string
    unit: (count: number) => string
  }
}

const HEIGHT = 56

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

// Single-series column chart: the faculty colour, thin bars with a 2px gap
// and rounded tops, recessive axis; the selected period stays in the full
// colour while the other years take its lightest tint. Click selects a
// year, shift-click extends the period, a second click clears it.
export const YearTimeline = ({ years, min, max, from, to, onSelect, labels }: YearTimelineProps) => {
  const [hovered, setHovered] = useState<number | null>(null)

  const bars = useMemo(() => {
    const counts = new Map(years.map((y) => [y.year, y.count]))
    const span: YearCount[] = []
    for (let y = min; y <= max; y++) span.push({ year: y, count: counts.get(y) ?? 0 })
    return span
  }, [years, min, max])

  if (bars.length === 0) return null

  const peak = Math.max(1, ...bars.map((b) => b.count))
  const hasPeriod = from !== null || to !== null
  const inPeriod = (year: number) => (from === null || year >= from) && (to === null || year <= to)
  // Axis labels thin out with the span: every year up to 20 bars, then
  // every 5th; twice as sparse on narrow screens.
  const step = bars.length > 20 ? 5 : 1

  const select = (year: number, extend: boolean) => {
    if (extend && hasPeriod) onSelect(Math.min(from ?? year, year), Math.max(to ?? year, year))
    else if (from === year && to === year) onSelect(null, null)
    else onSelect(year, year)
  }

  const active = bars.find((b) => b.year === hovered)

  return (
    <figure className="space-y-1.5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground">
          {labels.title}
        </span>
        <span className="text-[0.75rem] text-muted-foreground/70 tabular-nums text-right">
          {active ? (
            `${active.year} · ${active.count} ${labels.unit(active.count)}`
          ) : (
            <span className="hidden sm:inline">{labels.hint}</span>
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
              aria-label={`${bar.year} : ${bar.count} ${labels.unit(bar.count)}`}
              aria-pressed={hasPeriod && inPeriod(bar.year)}
              // The hit target is the whole column, taller than the bar.
              className="group relative flex-1 min-w-0 h-full flex items-end cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-t-sm"
            >
              <span
                className={cx(
                  'w-full rounded-t-[4px] transition-colors',
                  hovered === bar.year
                    ? highlighted
                      ? 'bg-primary-tint-1'
                      : 'bg-primary-tint-2'
                    : highlighted
                      ? 'bg-primary'
                      : 'bg-primary-tint-3'
                )}
                style={{ height }}
              />
            </button>
          )
        })}
      </div>

      <div className="flex gap-[2px]" aria-hidden>
        {bars.map((bar, i) => {
          const shown = i % step === 0 || i === bars.length - 1
          const shownNarrow = i % (step * 2) === 0 || i === bars.length - 1
          return (
            <span
              key={bar.year}
              className={cx(
                'flex-1 min-w-0 text-center text-[0.625rem] tabular-nums text-muted-foreground/70 overflow-visible whitespace-nowrap',
                !shownNarrow && 'invisible',
                shown && !shownNarrow && 'sm:visible',
                !shown && 'sm:invisible',
                hovered === bar.year && 'text-foreground'
              )}
            >
              <span className="sm:hidden">{String(bar.year).slice(2)}</span>
              <span className="hidden sm:inline">{bar.year}</span>
            </span>
          )
        })}
      </div>
    </figure>
  )
}
