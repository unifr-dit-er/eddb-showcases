'use client'

import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { normalize } from '@eddb/showcase-kit/text'
import { cn } from '@/lib/utils'
import type { CountedValue } from '@/types/archive'
import { ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface FacetComboboxProps {
  values: CountedValue[]
  selected: string
  onSelect: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
  removeLabel: string
}

// A single choice among many values (sources): one line in the sidebar, a
// floating list with search and counts, the choice shown as a chip.
export const FacetCombobox = ({
  values,
  selected,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  removeLabel,
}: FacetComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const q = normalize(query.trim())
    return q ? values.filter((v) => normalize(v.value).includes(q)) : values
  }, [values, query])

  const choose = (value: string) => {
    onSelect(value)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full h-9 flex items-center justify-between gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-3 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground/80 transition-colors">
          <span className="truncate">{placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches.length > 0) choose(matches[0].value)
            }}
            placeholder={searchPlaceholder}
            className="h-8 text-sm mb-2"
          />
          <ul className="max-h-72 overflow-y-auto space-y-0.5">
            {matches.length === 0 && <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</li>}
            {matches.map((v) => (
              <li key={v.value}>
                <button
                  onClick={() => choose(v.value)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm transition-colors',
                    v.value === selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  <span className="truncate">{v.value}</span>
                  <span className="text-[10px] tabular-nums shrink-0 opacity-70">{v.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {selected && (
        <button
          onClick={() => onSelect('')}
          aria-label={`${removeLabel} : ${selected}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-sm text-primary-foreground"
        >
          <span className="truncate">{selected}</span>
          <X className="h-3.5 w-3.5 shrink-0" />
        </button>
      )}
    </div>
  )
}
