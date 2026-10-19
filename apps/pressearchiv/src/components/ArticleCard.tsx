'use client'

import { Tag } from '@eddb/showcase-kit/tag'
import { RecordTypeIcon } from '@/components/RecordTypeIcon'
import type { ArticleSummary } from '@/types/archive'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { useFacets } from '@/hooks/useFacets'
import { displayName, formatDate, shortLanguage } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: ArticleSummary
  isActive: boolean
  onClick: () => void
}

const MAX_KEYWORDS = 4

export const ArticleCard = ({ article, isActive, onClick }: ArticleCardProps) => {
  const { t, locale, label, seriesTitle } = useLanguage()
  const { filters, setFilter, toggleKeyword, toggleType } = useFilters()
  const { seriesById } = useFacets()
  const series = seriesById.get(article.seriesId)

  const handleSeriesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFilter('series', filters.series === article.seriesId ? '' : article.seriesId)
  }

  const handleLanguageClick = (e: React.MouseEvent, code: string) => {
    e.stopPropagation()
    setFilter('language', filters.language === code ? '' : code)
  }

  const handleTypeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleType(article.recordType)
  }

  const handleKeywordClick = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation()
    toggleKeyword(keyword)
  }

  const authors = article.authors.map((a) => displayName(a.name)).join(', ')
  const extraKeywords = article.keywords.length - MAX_KEYWORDS

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
      {/* Dateline: type, source, date, as at the head of a press clipping */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-[0.8125rem]">
        <span
          onClick={handleTypeClick}
          className={cn(
            'flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.15em] uppercase transition-colors cursor-pointer',
            filters.types.includes(article.recordType)
              ? 'text-primary-ink'
              : 'text-muted-foreground hover:text-primary-ink'
          )}
        >
          <RecordTypeIcon type={article.recordType} />
          {label('recordType', article.recordType)}
        </span>
        {article.journal && (
          <>
            <span className="text-border" aria-hidden>|</span>
            <span className="font-serif italic text-[0.9375rem] text-foreground/80">{article.journal}</span>
          </>
        )}
        <span className="text-border" aria-hidden>|</span>
        <span className="text-primary-ink font-medium tabular-nums">
          {article.date ? formatDate(article.date, locale, '2-digit') : t('article.undated')}
        </span>
      </div>

      <h3 className="font-serif text-[1.1875rem] font-semibold leading-snug text-foreground line-clamp-2 mb-1.5 group-hover:text-foreground">
        {article.title}
      </h3>

      {authors && <p className="text-[0.8125rem] text-muted-foreground mb-2 line-clamp-1">{authors}</p>}

      {article.teaser && (
        <p className="text-[0.9375rem] leading-relaxed text-foreground/70 line-clamp-2 mb-3">{article.teaser}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {series && (
          <Tag variant="caps" onClick={handleSeriesClick} active={filters.series === article.seriesId}>
            {seriesTitle(series)}
          </Tag>
        )}
        {article.languages.map((code) => (
          <Tag
            key={code}
            variant="caps"
            title={label('language', code)}
            onClick={(e) => handleLanguageClick(e, code)}
            active={filters.language === code}
          >
            {shortLanguage(code)}
          </Tag>
        ))}
        {article.keywords.slice(0, MAX_KEYWORDS).map((kw) => (
          <Tag key={kw} onClick={(e) => handleKeywordClick(e, kw)} active={filters.keywords.includes(kw)}>
            {kw}
          </Tag>
        ))}
        {extraKeywords > 0 && <span className="text-xs text-muted-foreground">+{extraKeywords}</span>}
      </div>
    </article>
  )
}
