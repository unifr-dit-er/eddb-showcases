'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

// Record numbers are the NocoDB ids shown as "Fiche n°": digits only, a
// leading "#" or "n°" tolerated when pasted from a citation.
export const parseRecordNumber = (value: string): string | null => {
  const digits = value.trim().replace(/^(#|n°|no\.?)\s*/i, '')
  if (!/^\d+$/.test(digits)) return null
  const id = digits.replace(/^0+(?=\d)/, '')
  return id === '0' ? null : id
}

// Opens a record by its number, keeping the filters of the list: the panel
// says when no published record has it. "#" anywhere outside a text field
// focuses the field.
export const GoToItem = () => {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '#' || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const id = parseRecordNumber(value)
    if (!id) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setValue('')
    inputRef.current?.blur()
    const params = new URLSearchParams(searchParams.toString())
    params.set('item', id)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label={t('goto.label')} className="flex items-center gap-1.5">
      <label htmlFor="goto-item" className="hidden sm:block font-mono text-[0.75rem] text-muted-foreground whitespace-nowrap">
        {t('item.number')}
      </label>
      <div
        className={cn(
          'flex items-center rounded border bg-background transition-colors focus-within:border-primary-ink',
          invalid ? 'border-destructive' : 'border-border'
        )}
      >
        <input
          ref={inputRef}
          id="goto-item"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setInvalid(false)
          }}
          placeholder="#"
          title={t('goto.hint')}
          aria-label={t('goto.label')}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? 'goto-item-error' : undefined}
          className="w-14 bg-transparent px-2 py-1 font-mono text-[0.8125rem] tabular-nums outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          aria-label={t('goto.submit')}
          className="px-1.5 py-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {invalid && (
        <span id="goto-item-error" role="alert" className="sr-only">
          {t('goto.invalid')}
        </span>
      )}
    </form>
  )
}
