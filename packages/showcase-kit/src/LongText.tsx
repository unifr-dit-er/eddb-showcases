import { Fragment, type ReactNode } from 'react'
import { linkParts, paragraphs } from './text'

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

type RenderText = (text: string) => ReactNode

const plain: RenderText = (text) => text

interface LinkedTextProps {
  text: string
  // Inline rendering of the plain parts and of the link labels (callisto
  // shows *asterisks* in italics).
  renderText?: RenderText
}

// A text whose links, Markdown ([label](https://…)) or bare addresses, are
// shown as links, opened in a new tab (Alrick, 23.11.2026, for every
// showcase), in the faculty colour (primary-link). Long addresses may break
// anywhere.
export const LinkedText = ({ text, renderText = plain }: LinkedTextProps) => (
  <>
    {linkParts(text).map((part, index) =>
      part.href ? (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-link [overflow-wrap:anywhere] underline underline-offset-2 hover:decoration-2"
        >
          {renderText(part.text)}
        </a>
      ) : (
        <Fragment key={index}>{renderText(part.text)}</Fragment>
      )
    )}
  </>
)

interface LongTextProps extends LinkedTextProps {
  className?: string
}

// A long text of a record (description, abstract, sources…): one evenly
// spaced paragraph per line of the base, whatever the number of breaks, with
// its links.
export const LongText = ({ text, renderText, className }: LongTextProps) => (
  <div className={cx('space-y-3 text-base leading-relaxed text-foreground/85', className)}>
    {paragraphs(text).map((paragraph, index) => (
      <p key={index}>
        <LinkedText text={paragraph} renderText={renderText} />
      </p>
    ))}
  </div>
)
