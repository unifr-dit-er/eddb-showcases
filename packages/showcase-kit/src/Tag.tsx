'use client'

import type { MouseEvent, ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  // `caps`: a property of the record (series, canton, language);
  // `keyword`: capitals too, but tighter and lighter, for long labels.
  variant?: 'caps' | 'keyword'
  // A tag with `onClick` filters on its value; `active` when it does.
  active?: boolean
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
  title?: string
}

const VARIANTS = {
  caps: 'text-[0.6875rem] leading-4 font-bold tracking-[0.15em] uppercase',
  keyword: 'text-[0.6875rem] leading-4 font-semibold tracking-[0.06em] uppercase',
}

// The tags of the showcase entries (cards and detail panels), one shape for
// all: slightly rounded corners, muted until selected. A span, not a button:
// cards are buttons themselves.
export const Tag = ({ children, variant = 'keyword', active = false, onClick, title }: TagProps) => {
  const colours = active
    ? 'bg-primary-tint-3 text-primary-ink hover:bg-primary-tint-2'
    : `bg-muted ${variant === 'keyword' ? 'text-foreground/80' : 'text-muted-foreground'}`
  return (
    <span
      onClick={onClick}
      title={title}
      className={[
        'inline-flex items-center rounded px-1.5 py-0.5 transition-colors',
        VARIANTS[variant],
        colours,
        onClick ? 'cursor-pointer' : '',
        onClick && !active ? 'hover:bg-primary-tint-3 hover:text-primary-ink' : '',
      ].join(' ')}
    >
      {children}
    </span>
  )
}
