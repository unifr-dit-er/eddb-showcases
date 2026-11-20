// Years are stored as numbers, negative before the common era.
const BCE = 'av. J.-C.'
const CE = 'apr. J.-C.'

export const formatYear = (year: number): string => (year < 0 ? `${-year} ${BCE}` : `${year} ${CE}`)

// Short form for the timeline axis: "800 av.", "100 apr."; the century
// that starts at 0 is the first of the era.
export const formatAxisYear = (year: number): string => (year < 0 ? `${-year} av.` : `${year || 1} apr.`)

// "450–400 av. J.-C.", "50 av. J.-C. – 20 apr. J.-C.", "120 apr. J.-C.";
// the stored bounds are shown as they are, even when the end comes first.
export const formatDating = (from: number | null, to: number | null): string => {
  if (from === null && to === null) return ''
  if (from === null || to === null || from === to) return formatYear((from ?? to) as number)
  if (from < 0 && to < 0) return `${-from}–${-to} ${BCE}`
  if (from >= 0 && to >= 0) return `${from}–${to} ${CE}`
  return `${formatYear(from)} – ${formatYear(to)}`
}

