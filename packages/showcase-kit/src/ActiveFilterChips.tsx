'use client'

import { X } from 'lucide-react'

export interface FilterChip {
  key: string
  text: string
  remove: () => void
}

interface ActiveFilterChipsProps {
  chips: FilterChip[]
  onClear: () => void
  labels: { group: string; remove: string; clear: string }
}

// Reminder of every active filter above the results, each removable on the
// spot: the sidebar sections can stay folded. Each showcase builds its chips.
export const ActiveFilterChips = ({ chips, onClear, labels }: ActiveFilterChipsProps) => {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label={labels.group}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remove}
          aria-label={`${labels.remove} : ${chip.text}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary-tint-2 bg-primary-tint-3 px-2.5 py-0.5 text-[0.8125rem] text-primary-ink hover:bg-primary-tint-2 transition-colors"
        >
          <span className="truncate">{chip.text}</span>
          <X className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClear}
          className="ml-1 text-[0.8125rem] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          {labels.clear}
        </button>
      )}
    </div>
  )
}
