/**
 * NocoDB table of the "Callisto" base, the only one this app reads.
 * Server-side only (route handlers and src/lib/collection-*.ts).
 */
export const NOCODB_TABLES = {
  REPRESENTATIONS: 'mzl90y8p2067uzf',
} as const

// Whitelist of the fields read from NocoDB. The images (`Image`,
// `ImagesAdditionnelles`) are left out on purpose: their rights are not
// cleared for the public (decision of 19.11.2026). The partial English
// fields (`FormeEN`, `SujetsEN`, `CentreProducteurEN`) are not used either:
// the showcase is in French only.
export const REPRESENTATION_FIELDS = [
  'Id',
  'Titre',
  'Description',
  'DatationDebut',
  'DatationFin',
  'Periode',
  'Materiau',
  'Categorie',
  'Forme',
  'Sujets',
  'Dimensions',
  'LieuDeDecouverte',
  'LieuDeConservation',
  'CentreProducteur',
  'Sources',
  'Bibliographie',
  'Publication',
] as const

// Only the records cleared for publication. `eq`, not `is`: the latter is
// ignored on checkboxes by NocoDB 2026.10.1 (issue #15005).
export const PUBLISHED_WHERE = '(Publication,eq,true)'

export const PAGE_SIZE = 25

// Length of the description shown in the list.
export const EXCERPT_LENGTH = 280

// The timeline counts the starting years by centuries: the dates run from
// the second millennium BCE to the sixth century CE. The axis starts at the
// eighth century BCE, the span of the collection; the three Minoan and
// Mycenaean records before it share a bar. A selected century opens by
// decades: half of the records start in the fifth century BCE.
export const TIMELINE_BUCKET = 100
export const TIMELINE_FLOOR = -800
export const TIMELINE_ZOOM = 10

// The collection no longer grows: an hour of cache only delays corrections.
export const COLLECTION_TTL_MS = 60 * 60 * 1000
