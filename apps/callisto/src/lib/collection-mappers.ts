import type { Representation } from '@/types/collection'

type NocoDBRecord = Record<string, unknown>

const text = (value: unknown): string =>
  value == null ? '' : String(value).trim()

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
