'use client'

import type { ComponentProps } from 'react'
import { Info } from 'lucide-react'

interface AboutButtonProps extends ComponentProps<'button'> {
  label: string
}

// Opens the About dialog of a showcase (as the child of its DialogTrigger,
// with `asChild`): the icon and, from small screens up, its label. The icon
// alone was not visible enough (Institute of Multilingualism, 29.10.2026).
export const AboutButton = ({ label, className, ...props }: AboutButtonProps) => (
  <button
    type="button"
    {...props}
    className={
      'flex items-center gap-1.5 shrink-0 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer' +
      (className ? ` ${className}` : '')
    }
  >
    <Info className="h-4 w-4" aria-hidden />
    <span className="hidden sm:inline">{label}</span>
    <span className="sr-only sm:hidden">{label}</span>
  </button>
)
