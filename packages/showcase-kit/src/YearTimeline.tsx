'use client'

import { useMemo, useState } from 'react'

export interface YearCount {
  year: number
  count: number
}

// A bar covers the years from `start` to `end`, both included; a null start
// is the bar that gathers every year before the floor.
export interface TimelineBar {
  start: number | null
  end: number
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
    // With `floor`: axis label of the bar before it ("avant").
    before?: string
    // With `zoom`: title and hint of the detailed view (the range is the
    // label of the bar shown in detail), and the way back.
    zoomTitle?: (range: string) => string
    zoomHint?: string
    back?: string
  }
  // Width of a bar in years (default 1). With a wider bar, `years` still
  // counts single years; a click selects the whole span of the bar.
  bucket?: number
  // Display of a year on the axis and in the hover line (default: as is).
  formatYear?: (year: number) => string
  // Lowest first year of the axis: the few years before it share a single
  // bar on the left, so that a handful of outliers do not stretch the axis.
  floor?: number
  // Width in years of the bars of the detailed view: when the selected
  // period lies within a single bar, the timeline shows that bar in detail.
  zoom?: number
}

const HEIGHT = 56

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

// A bar is named by its first year; negative years (before the common era)
// fall in the bar below them (-450 in the bar of -500).
const barStart = (year: number, bucket: number) => Math.floor(year / bucket) * bucket

export const buildBars = (
  years: YearCount[],
  min: number,
  max: number,
  bucket: number,
  floor?: number
): TimelineBar[] => {
  const first = floor === undefined ? barStart(min, bucket) : barStart(floor, bucket)
  const counts = new Map<number, number>()
  let before = 0
  for (const y of years) {
    if (y.year > max) continue
    if (y.year < first) before += y.count
    else counts.set(barStart(y.year, bucket), (counts.get(barStart(y.year, bucket)) ?? 0) + y.count)
  }
  const bars: TimelineBar[] = []
  if (floor !== undefined && min < first) bars.push({ start: null, end: first - 1, count: before })
  for (let y = Math.max(first, barStart(min, bucket)); y <= max; y += bucket)
    bars.push({ start: y, end: y + bucket - 1, count: counts.get(y) ?? 0 })
  return bars
}

// First year of the bar shown in detail: the selected period lies within a
// single bar of the axis (the bar before the floor is never detailed).
export const zoomedStart = (
  from: number | null,
  to: number | null,
  bucket: number,
  floor?: number
): number | null => {
  if (from === null || to === null || to < from) return null
  const start = barStart(from, bucket)
  if (barStart(to, bucket) !== start) return null
  if (floor !== undefined && start < barStart(floor, bucket)) return null
  return start
}

// Single-series column chart: the faculty colour, thin bars with a 2px gap
// and rounded tops, recessive axis; the selected period stays in the full
// colour while the other years take its lightest tint. Click selects a
// bar, shift-click extends the period, a second click clears it. With
// `zoom`, a selected bar opens in detail: a click there selects a part of
// it, a second click comes back to the whole bar.
export const YearTimeline = ({
  years,
  min,
  max,
  from,
  to,
  onSelect,
  labels,
  bucket = 1,
  formatYear,
  floor,
  zoom,
}: YearTimelineProps) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const parent = zoom ? zoomedStart(from, to, bucket, floor) : null
  const zoomed = parent !== null

  const bars = useMemo(
    () =>
      parent !== null && zoom
        ? buildBars(years, parent, parent + bucket - 1, zoom)
        : buildBars(years, min, max, bucket, floor),
    [years, min, max, bucket, floor, zoom, parent]
  )

  if (bars.length === 0) return null

  const peak = Math.max(1, ...bars.map((b) => b.count))
  const hasPeriod = from !== null || to !== null
  const inPeriod = (bar: TimelineBar) =>
    (from === null || bar.end >= from) && (to === null || bar.start === null || bar.start <= to)
  const show = (year: number) => (formatYear ? formatYear(year) : String(year))
  const width = zoomed ? (zoom as number) : bucket
  const barLabel = (bar: TimelineBar) =>
    bar.start === null
      ? `${labels.before ?? '<'} ${show(bar.end + 1)}`
      : width === 1
        ? show(bar.start)
        : `${show(bar.start)} – ${show(bar.end)}`
  // Axis labels thin out with the span: every bar up to 20 bars, then
  // every 5th; twice as sparse on narrow screens.
  const step = bars.length > 20 ? 5 : 1

  const select = (bar: TimelineBar, extend: boolean) => {
    const { start, end } = bar
    if (from === start && to === end) {
      // A second click: back to the whole bar in the detailed view, else clear.
      if (parent !== null) onSelect(parent, parent + bucket - 1)
      else onSelect(null, null)
    } else if (extend && hasPeriod) {
      onSelect(start === null || from === null ? null : Math.min(from, start), Math.max(to ?? end, end))
    } else onSelect(start, end)
  }

  // Bars are keyed by their start; the bar before the floor by -Infinity.
  const keyOf = (bar: TimelineBar) => bar.start ?? -Infinity
  const active = bars.find((b) => keyOf(b) === hovered)
  const title = zoomed && labels.zoomTitle ? labels.zoomTitle(barLabel({ start: parent, end: parent + bucket - 1, count: 0 })) : labels.title
  const hint = zoomed ? (labels.zoomHint ?? labels.hint) : labels.hint

  return (
    <figure className="space-y-1.5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-3 min-w-0">
          <span className="text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground">
            {title}
          </span>
          {zoomed && (
            <button
              type="button"
              onClick={() => onSelect(null, null)}
              className="shrink-0 text-[0.75rem] text-primary-link underline underline-offset-2 hover:decoration-2 cursor-pointer"
            >
              {labels.back ? `← ${labels.back}` : '←'}
            </button>
          )}
        </span>
        <span className="text-[0.75rem] text-muted-foreground/70 tabular-nums text-right">
          {active ? (
            `${barLabel(active)} · ${active.count} ${labels.unit(active.count)}`
          ) : (
            <span className="hidden sm:inline">{hint}</span>
          )}
        </span>
      </figcaption>

      <div
        className="flex items-end gap-[2px] border-b border-border"
        style={{ height: HEIGHT }}
        onMouseLeave={() => setHovered(null)}
      >
        {bars.map((bar) => {
          const highlighted = !hasPeriod || inPeriod(bar)
          const height = bar.count === 0 ? 0 : Math.max(2, Math.round((bar.count / peak) * (HEIGHT - 4)))
          const key = keyOf(bar)
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => select(bar, e.shiftKey)}
              onMouseEnter={() => setHovered(key)}
              onFocus={() => setHovered(key)}
              onBlur={() => setHovered(null)}
              aria-label={`${barLabel(bar)} : ${bar.count} ${labels.unit(bar.count)}`}
              aria-pressed={hasPeriod && inPeriod(bar)}
              // The hit target is the whole column, taller than the bar.
              className="group relative flex-1 min-w-0 h-full flex items-end cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-t-sm"
            >
              <span
                className={cx(
                  'w-full rounded-t-[4px] transition-colors',
                  hovered === key
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
          const key = keyOf(bar)
          return (
            <span
              key={key}
              className={cx(
                'flex-1 min-w-0 text-center text-[0.625rem] tabular-nums text-muted-foreground/70 overflow-visible whitespace-nowrap',
                !shownNarrow && 'invisible',
                shown && !shownNarrow && 'sm:visible',
                !shown && 'sm:invisible',
                hovered === key && 'text-foreground'
              )}
            >
              {bar.start === null ? (
                (labels.before ?? '<')
              ) : formatYear ? (
                show(bar.start)
              ) : (
                <>
                  <span className="sm:hidden">{String(bar.start).slice(2)}</span>
                  <span className="hidden sm:inline">{bar.start}</span>
                </>
              )}
            </span>
          )
        })}
      </div>
    </figure>
  )
}
