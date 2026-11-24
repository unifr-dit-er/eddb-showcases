'use client'

import { Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

// Printing a record. Opt-in: a showcase offers it by marking its record
// panel with `data-print-record`, importing `print.css` into its global
// styles and showing these two components (callisto for now, Alrick,
// 24.11.2026). Only the record is printed, as a plain page.

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

interface PrintButtonProps {
  label: string
  className?: string
}

export const PrintButton = ({ label, className }: PrintButtonProps) => (
  <button
    type="button"
    onClick={() => window.print()}
    data-print-hide
    className={cx(
      'flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground',
      className
    )}
  >
    <Printer className="h-4 w-4" aria-hidden />
    {label}
  </button>
)

interface PrintSourceProps {
  // Name of the showcase ("Callisto").
  site: string
  // Before the date ("imprimée le").
  printedOn: string
  locale?: string
}

// Print only: where the record comes from (its address, which opens it)
// and when it was printed. Read when printing starts, so that the address
// is the one of the record shown.
export const PrintSource = ({ site, printedOn, locale = 'fr-CH' }: PrintSourceProps) => {
  const [source, setSource] = useState<{ url: string; date: string } | null>(null)

  useEffect(() => {
    const update = () =>
      flushSync(() => setSource({ url: window.location.href, date: new Date().toLocaleDateString(locale) }))
    window.addEventListener('beforeprint', update)
    return () => window.removeEventListener('beforeprint', update)
  }, [locale])

  return (
    <p className="hidden print:block text-[0.75rem] text-muted-foreground break-all">
      {site}
      {source && (
        <>
          {' · '}
          {source.url}
          {' · '}
          {printedOn} {source.date}
        </>
      )}
    </p>
  )
}
