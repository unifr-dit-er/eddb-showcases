// Case- and accent-insensitive form used for text matching.
export const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Entities left in the texts of a base by an earlier editor ("n&deg;" in
// 584 records of callisto, 20.11.2026): the numeric ones and the usual named
// ones are decoded, any other is left as is.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', thinsp: '\u2009',
  ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', deg: '°',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', sbquo: '‚', bdquo: '„',
  szlig: 'ß', ograve: 'ò', oacute: 'ó', agrave: 'à', eacute: 'é', egrave: 'è', ecirc: 'ê',
  ccedil: 'ç', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü',
}

export const decodeEntities = (value: string): string =>
  value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== '#') return NAMED_ENTITIES[name] ?? entity
    const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : Number(name.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity
  })

// Control characters other than tab and line breaks (a stray "&#2;" in
// pressearchiv) never belong in a text.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g

// A text field of a NocoDB record, ready to show: entities decoded, control
// characters removed, trimmed.
export const recordText = (value: unknown): string =>
  value == null ? '' : decodeEntities(String(value)).replace(CONTROL, '').trim()

// Paragraphs of a long text: every line break, single or repeated, starts a
// new one; blank lines are dropped (Alrick, 20.11.2026). The bases separate
// paragraphs by one to six breaks (\n or \r\n), sometimes with spaces or
// tabs between them.
export const paragraphs = (value: string): string[] =>
  value
    .split(/\r\n?|\n/)
    .map((line) => line.trim())
    .filter(Boolean)

// Markdown links in the texts of a base, [label](https://…) (callisto,
// 23.11.2026). Only http and https addresses are links, with at most one
// level of parentheses inside the address (Wikipedia); anything else stays
// as written. A stray " (" before the closing parenthesis, left by an earlier
// editor in callisto ("[Projekt Dyabola](http://… ()", three records), is
// dropped.
const LINK = /\[([^\]\n]+)\]\((https?:\/\/(?:[^\s()]|\([^\s()]*\))+)(?: \()?\)/g

export interface TextPart {
  text: string
  href?: string
}

// A text cut into plain parts and links, in order.
export const linkParts = (value: string): TextPart[] => {
  const parts: TextPart[] = []
  let last = 0
  for (const match of value.matchAll(LINK)) {
    if (match.index > last) parts.push({ text: value.slice(last, match.index) })
    parts.push({ text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < value.length) parts.push({ text: value.slice(last) })
  return parts
}

// The same text with each link reduced to its label, for places that cannot
// hold a link (cards, which are links themselves; excerpts).
export const linkLabels = (value: string): string => value.replace(LINK, '$1')
