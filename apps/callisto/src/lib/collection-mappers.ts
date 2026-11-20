import type { Representation } from '@/types/collection'

type NocoDBRecord = Record<string, unknown>

// The texts of the base keep HTML entities from an earlier editor
// ("n&deg;" in 584 records, "&rsquo;" in 151, 20.11.2026): decode the
// numeric ones and the named ones found in the base; leave any other as is.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', thinsp: '\u2009',
  deg: '°', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', sbquo: '‚',
  szlig: 'ß', ograve: 'ò', oacute: 'ó',
}

export const decodeEntities = (value: string): string =>
  value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== '#') return NAMED_ENTITIES[name] ?? entity
    const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : Number(name.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity
  })

const text = (value: unknown): string =>
  value == null ? '' : decodeEntities(String(value)).trim()

// NocoDB returns a multi-select as its options joined by commas.
export const splitOptions = (value: unknown): string[] => [
  ...new Set(
    text(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  ),
]

export const parseYear = (value: unknown): number | null => {
  if (value == null || value === '') return null
  const year = Number(value)
  return Number.isInteger(year) ? year : null
}

export const isPublished = (record: NocoDBRecord): boolean =>
  record.Publication === true || text(record.Publication).toLowerCase() === 'true'

export const mapRepresentation = (record: NocoDBRecord): Representation => ({
  id: text(record.Id ?? record.id),
  title: text(record.Titre),
  description: text(record.Description),
  dateFrom: parseYear(record.DatationDebut),
  dateTo: parseYear(record.DatationFin),
  period: text(record.Periode),
  material: text(record.Materiau),
  category: text(record.Categorie),
  form: text(record.Forme),
  subjects: splitOptions(record.Sujets),
  dimensions: text(record.Dimensions),
  discoveryPlace: text(record.LieuDeDecouverte),
  conservationPlace: text(record.LieuDeConservation),
  productionCentre: text(record.CentreProducteur),
  sources: text(record.Sources),
  bibliography: text(record.Bibliographie),
})
