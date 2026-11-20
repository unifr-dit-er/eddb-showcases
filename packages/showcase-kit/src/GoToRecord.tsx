'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

// Opt-in: a showcase shows it only when it wants it (callisto for now,
// Alrick, 20.11.2026). Not every showcase numbers its records by their
// NocoDB id (pressearchiv shows its archive number).

// A record number typed or pasted: digits, a leading "#" or "n°"
// tolerated, leading zeros dropped; null when it is not one.
export const parseRecordNumber = (value: string): string | null => {
  const digits = value.trim().replace(/^(#|n°|no\.?)\s*/i, '')
  if (!/^\d+$/.test(digits)) return null
  const id = digits.replace(/^0+(?=\d)/, '')
  return id === '0' ? null : id
}

export interface GoToRecordLabels {
  // Visible from small screens up, before the field ("Fiche n°").
  field: string
  // Accessible name of the field and of the form.
  label: string
  // Tooltip of the field, which may name the shortcut.
  hint: string
  submit: string
  // Announced when the input is not a record number.
  invalid: string
}

interface GoToRecordProps {
  labels: GoToRecordLabels
  // Opens the record: the showcase sets its URL (`?item=<id>`…) and its
  // panel says when no published record has that number.
  onOpen: (id: string) => void
  parse?: (value: string) => string | null
  // Key that focuses the field from anywhere outside a text field; null
  // for none.
  shortcut?: string | null
}

export const GoToRecord = ({ labels, onOpen, parse = parseRecordNumber, shortcut = '#' }: GoToRecordProps) => {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== shortcut || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcut])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const id = parse(value)
    if (!id) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setValue('')
    inputRef.current?.blur()
    onOpen(id)
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label={labels.label} className="flex items-center gap-1.5">
      <label htmlFor={inputId} className="hidden sm:block font-mono text-[0.75rem] text-muted-foreground whitespace-nowrap">
        {labels.field}
      </label>
      <div
        className={
          'flex items-center rounded border bg-background transition-colors focus-within:border-primary-ink ' +
          (invalid ? 'border-destructive' : 'border-border')
        }
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setInvalid(false)
          }}
          placeholder={shortcut ?? undefined}
          title={labels.hint}
          aria-label={labels.label}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className="w-14 bg-transparent px-2 py-1 font-mono text-[0.8125rem] tabular-nums outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          aria-label={labels.submit}
          className="px-1.5 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      {invalid && (
        <span id={errorId} role="alert" className="sr-only">
          {labels.invalid}
        </span>
      )}
    </form>
  )
}
