'use client'

import { Badge } from '@/components/ui/badge'
import type { Decision } from '@/types/decision'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { getCantonLabel } from '@/lib/cantons'
import { cn } from '@/lib/utils'
import { FileText, Landmark } from 'lucide-react'

interface DecisionCardProps {
  decision: Decision
  isActive: boolean
  onClick: () => void
}

const MAX_KEYWORDS = 4

// Card in the manner of the pressearchiv showcase: a dateline (canton,
// date, PDF), the title in serif, the opening of the abstract, keywords.
const DecisionCard = ({ decision, isActive, onClick }: DecisionCardProps) => {
  const { locale, langSuffix } = useLanguage()
  const { filters, setFilter } = useFilters()

  const formattedDate = new Date(decision.date).toLocaleDateString(`${locale}-CH`, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const handleCantonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFilter('canton', filters.canton === decision.canton ? '' : decision.canton)
  }

  const handleKeywordClick = (e: React.MouseEvent, kwId: string) => {
    e.stopPropagation()
    setFilter(
      'keywords',
      filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
    )
  }

  const keywords = [...decision.keywords].sort((a, b) => a.label.localeCompare(b.label))
  const extraKeywords = keywords.length - MAX_KEYWORDS

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group w-full text-left rounded-xl bg-card border shadow-sm px-5 py-4 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        isActive
          ? 'border-primary-tint-2 shadow-md ring-1 ring-primary-tint-3'
          : 'border-border hover:shadow-md hover:border-primary-tint-2'
      )}
    >
      {/* Dateline, as at the head of a press clipping */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-[0.8125rem]">
        {decision.canton && (
          <span
            onClick={handleCantonClick}
            className={cn(
              'flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.15em] uppercase transition-colors cursor-pointer',
              filters.canton === decision.canton
                ? 'text-primary-ink'
                : 'text-muted-foreground hover:text-primary-ink'
            )}
          >
            <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {getCantonLabel(decision.canton, langSuffix)}
          </span>
        )}
        {decision.date && (
          <>
            <span className="text-border" aria-hidden>|</span>
            <span className="text-primary-ink font-medium tabular-nums">{formattedDate}</span>
          </>
        )}
        {decision.pdfUrl && (
          <span className="ml-auto flex items-center gap-1 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            PDF
          </span>
        )}
      </div>

      <h3 className="font-serif text-[1.1875rem] font-semibold leading-snug text-foreground line-clamp-2 mb-1.5">
        {decision.title}
      </h3>

      {decision.abstract && (
        <p className="text-[0.9375rem] leading-relaxed text-foreground/70 line-clamp-2 mb-3">{decision.abstract}</p>
      )}

      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.slice(0, MAX_KEYWORDS).map((kw) => (
            <Badge
              key={kw.id}
              variant="secondary"
              onClick={(e) => handleKeywordClick(e, kw.id)}
              className={cn(
                'text-xs px-1.5 py-0 font-normal cursor-pointer transition-colors',
                filters.keywords.includes(kw.id)
                  ? 'bg-primary-tint-3 text-primary-ink hover:bg-primary-tint-2'
                  : 'hover:bg-primary-tint-2 hover:text-primary-ink'
              )}
            >
              {kw.label}
            </Badge>
          ))}
          {extraKeywords > 0 && <span className="text-xs text-muted-foreground">+{extraKeywords}</span>}
        </div>
      )}
    </article>
  )
}

export default DecisionCard
