'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'
import { normalize } from '@/lib/text'
import { cn } from '@/lib/utils'
import type { CountedValue } from '@/types/archive'
import { useMemo, useState } from 'react'

interface FacetListProps {
  id: string
  values: CountedValue[]
  selected: string[]
  onToggle: (value: string) => void
  placeholder: string
  // Single choice (sources) shows plain rows, several (keywords) checkboxes.
  multiple?: boolean
  initialCount?: number
}

// A long list of values with their counts, most frequent first: a text
// filter, the first few values, and the rest on demand. Selected values
// always stay visible.
export const FacetList = ({
  id,
  values,
  selected,
  onToggle,
  placeholder,
  multiple = false,
  initialCount = 8,
}: FacetListProps) => {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const matches = useMemo(() => {
    const q = normalize(query.trim())
    return q ? values.filter((v) => normalize(v.value).includes(q)) : values
  }, [values, query])

  const visible = useMemo(() => {
    if (expanded || query) return matches
    const head = matches.slice(0, initialCount)
    const extra = matches.filter((v) => selected.includes(v.value) && !head.includes(v))
    return [...extra, ...head]
  }, [matches, expanded, query, initialCount, selected])

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 h-8 text-sm"
      />
      <ul className="space-y-0.5">
        {visible.map((v) => {
          const isSelected = selected.includes(v.value)
          const inputId = `${id}-${v.value}`
          return (
            <li key={v.value}>
              {multiple ? (
                <div className="flex items-center gap-2.5 py-1">
                  <Checkbox
                    id={inputId}
                    checked={isSelected}
                    onCheckedChange={() => onToggle(v.value)}
                    className="border-sidebar-border/60"
                  />
                  <label
                    htmlFor={inputId}
                    className="flex-1 flex items-center justify-between gap-1.5 text-sm text-sidebar-foreground/80 cursor-pointer leading-tight"
                  >
                    <span>{v.value}</span>
                    <span className="text-[10px] text-sidebar-foreground/65 tabular-nums shrink-0">{v.count}</span>
                  </label>
                </div>
              ) : (
                <button
                  onClick={() => onToggle(v.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm leading-tight transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <span className="truncate">{v.value}</span>
                  <span
                    className={cn(
                      'text-[10px] tabular-nums shrink-0',
                      isSelected ? 'text-primary-foreground/80' : 'text-sidebar-foreground/65'
                    )}
                  >
                    {v.count}
                  </span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {!query && matches.length > initialCount && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
        >
          {expanded ? t('sidebar.showLess') : `${t('sidebar.showMore')} (${matches.length})`}
        </button>
      )}
    </div>
  )
}
