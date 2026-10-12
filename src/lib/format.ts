import type { Locale } from '@/i18n'

// Dates are ISO strings (YYYY-MM-DD) read as calendar days, without time zone.
export const formatDate = (iso: string, locale: Locale, month: 'long' | '2-digit' = 'long'): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(`${locale}-CH`, {
    day: month === 'long' ? 'numeric' : '2-digit',
    month,
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// "Meile, Silvan" → "Silvan Meile"; institutions keep their name.
export const displayName = (name: string): string => {
  const parts = name.split(',').map((p) => p.trim())
  return parts.length === 2 && parts[1] ? `${parts[1]} ${parts[0]}` : name
}

// Short forms of the ISO 639-2 codes used by the archive.
const SHORT_LANGUAGE: Record<string, string> = {
  ger: 'DE',
  gsw: 'GSW',
  fre: 'FR',
  ita: 'IT',
  roh: 'RM',
  eng: 'EN',
}

export const shortLanguage = (code: string): string =>
  SHORT_LANGUAGE[code] ?? code.toUpperCase()
