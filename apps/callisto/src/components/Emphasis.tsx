import { Fragment } from 'react'

// The base marks titles in italics with asterisks (*Corpus Vasorum
// Antiquorum*): they are shown in italics, as plain text otherwise (no HTML
// is ever interpreted). An unpaired asterisk stays as it is.
export const Emphasis = ({ children }: { children: string }) => (
  <>
    {children.split(/(\*[^*\n]+\*)/).map((part, i) =>
      /^\*[^*\n]+\*$/.test(part) ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>
    )}
  </>
)
