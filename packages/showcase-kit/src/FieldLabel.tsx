import type { ReactNode } from 'react'

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

interface FieldLabelProps {
  children: ReactNode
  // `dt` in a grid of fields (<dl>), `p` above a block (description,
  // keywords…).
  as?: 'p' | 'dt'
  className?: string
}

// Name of a field in a detail panel, in small spaced capitals. One style
// for every field name, whether it heads a block or labels a row of a grid
// (Alrick, 19.11.2026): they are the same kind of thing. In a grid, align
// the rows on their baseline (`items-baseline`), the label being smaller
// than the value.
export const FieldLabel = ({ children, as: Tag = 'p', className }: FieldLabelProps) => (
  <Tag className={cx('text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground', className)}>
    {children}
  </Tag>
)
