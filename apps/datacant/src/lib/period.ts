// Text of a period filter (ISO dates): whole years read as years
// (« 2016 », « 2016–2018 »), other bounds as dates of the locale.
export const formatPeriod = (from: string, to: string, locale: string): string => {
  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(`${locale}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fromYear = from.endsWith('-01-01') ? from.slice(0, 4) : ''
  const toYear = to.endsWith('-12-31') ? to.slice(0, 4) : ''

  if (from && to) {
    if (fromYear && toYear) return fromYear === toYear ? fromYear : `${fromYear}–${toYear}`
    return `${date(from)}–${date(to)}`
  }
  if (from) return `≥ ${fromYear || date(from)}`
  if (to) return `≤ ${toYear || date(to)}`
  return ''
}
