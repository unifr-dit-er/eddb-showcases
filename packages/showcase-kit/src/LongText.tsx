import type { ReactNode } from 'react'
import { paragraphs } from './text'

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

interface LongTextProps {
  text: string
  // Inline rendering of one paragraph (callisto shows *asterisks* in italics).
  renderParagraph?: (paragraph: string) => ReactNode
  className?: string
}

// A long text of a record (description, abstract, sources…): one evenly
// spaced paragraph per line of the base, whatever the number of breaks.
export const LongText = ({ text, renderParagraph = (paragraph) => paragraph, className }: LongTextProps) => (
  <div className={cx('space-y-3 text-base leading-relaxed text-foreground/85', className)}>
    {paragraphs(text).map((paragraph, index) => (
      <p key={index}>{renderParagraph(paragraph)}</p>
    ))}
  </div>
)
