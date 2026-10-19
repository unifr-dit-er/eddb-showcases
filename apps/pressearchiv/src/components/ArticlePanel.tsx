'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { RecordTypeIcon } from '@/components/RecordTypeIcon'
import { useArticle } from '@/hooks/useArticle'
import { useFacets } from '@/hooks/useFacets'
import { useFilters } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { displayName, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Check, Copy, ExternalLink, Lock } from 'lucide-react'
import { useState } from 'react'

interface ArticlePanelProps {
  articleId: string | null
  onClose: () => void
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground mb-2">
    {children}
  </p>
)

export const ArticlePanel = ({ articleId, onClose }: ArticlePanelProps) => {
  const { data: article, isLoading } = useArticle(articleId)
  const { seriesById } = useFacets()
  const { t, locale, label, seriesTitle } = useLanguage()
  const { filters, setFilter, toggleKeyword, toggleType } = useFilters()
  const [linkCopied, setLinkCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(!!articleId)
  const [shownId, setShownId] = useState(articleId)

  // Local open state, as in datacant: the sheet closes at once even if the
  // URL update triggered by onClose() lags. A new article reopens it.
  if (articleId !== shownId) {
    setShownId(articleId)
    if (articleId) setIsOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) onClose()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const series = article ? seriesById.get(article.seriesId) : undefined

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="overflow-y-auto px-6 pb-6 w-full sm:w-[42vw] sm:min-w-[440px] max-w-[760px] sm:max-w-[760px]"
        showCloseButton={false}
      >
        <SheetHeader className="px-0 pt-6 pb-0 mb-5 gap-3">
          {series && (
            <button
              onClick={() => setFilter('series', filters.series === series.id ? '' : series.id)}
              className="self-start text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-muted-foreground hover:text-primary-ink transition-colors"
            >
              {seriesTitle(series)}
            </button>
          )}
          <SheetTitle className="font-serif text-[1.75rem] font-semibold leading-tight text-foreground">
            {article?.title ?? (isLoading ? t('article.loading') : '')}
          </SheetTitle>
          {article && (
            <SheetDescription asChild>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.875rem] text-muted-foreground">
                <button
                  onClick={() => toggleType(article.recordType)}
                  className={cn(
                    'flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.15em] uppercase transition-colors',
                    filters.types.includes(article.recordType) ? 'text-primary-ink' : 'hover:text-primary-ink'
                  )}
                >
                  <RecordTypeIcon type={article.recordType} />
                  {label('recordType', article.recordType)}
                </button>
                {article.journal && (
                  <button
                    onClick={() => setFilter('journal', filters.journal === article.journal ? '' : article.journal)}
                    className="font-serif italic text-base text-foreground/85 hover:text-primary-ink transition-colors"
                  >
                    {article.journal}
                  </button>
                )}
                <span className="text-primary-ink font-medium">
                  {article.date ? formatDate(article.date, locale) : t('article.undated')}
                </span>
              </div>
            </SheetDescription>
          )}
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {article && (
          <div className="space-y-6">
            {article.authors.length > 0 && (
              <div>
                <SectionLabel>{t('article.authors')}</SectionLabel>
                <p className="text-base text-foreground/85">
                  {article.authors.map((a) => displayName(a.name)).join(' · ')}
                </p>
              </div>
            )}

            {article.teaser && (
              <div>
                <SectionLabel>{t('article.teaser')}</SectionLabel>
                <blockquote className="border-l-2 border-primary-tint-1 pl-4 font-serif text-[1.0625rem] leading-relaxed text-foreground/85">
                  {article.teaser}
                  {/* The archive keeps only the opening lines; some already end with […]. */}
                  {!/(\[(\.\.\.|…)\]|…)\s*$/.test(article.teaser) && (
                    <span className="text-muted-foreground"> […]</span>
                  )}
                </blockquote>
              </div>
            )}

            <div className="rounded-lg bg-muted/70 px-4 py-3 flex gap-3 text-[0.875rem] text-muted-foreground leading-relaxed">
              <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <div className="space-y-2">
                <p>{t('article.fullTextNotice')}</p>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary-ink hover:text-primary-ink/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('article.original')}
                  </a>
                )}
              </div>
            </div>

            {article.keywords.length > 0 && (
              <div>
                <SectionLabel>{t('article.keywords')}</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {[...article.keywords].sort((a, b) => a.localeCompare(b)).map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      onClick={() => toggleKeyword(kw)}
                      className={cn(
                        'text-xs px-2 py-0.5 font-normal cursor-pointer transition-colors',
                        filters.keywords.includes(kw)
                          ? 'bg-primary-tint-3 text-primary-ink hover:bg-primary-tint-2'
                          : 'hover:bg-primary-tint-3 hover:text-primary-ink'
                      )}
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.875rem]">
              {article.languages.length > 0 && (
                <>
                  <dt className="text-muted-foreground">{t('sidebar.language.label')}</dt>
                  <dd>{article.languages.map((code) => label('language', code)).join(', ')}</dd>
                </>
              )}
              {article.internalNo && (
                <>
                  <dt className="text-muted-foreground">{t('article.archiveNo')}</dt>
                  <dd className="font-mono text-[0.8125rem] tabular-nums">{article.internalNo}</dd>
                </>
              )}
            </dl>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleCopyLink}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer',
                  linkCopied ? 'text-primary-ink' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopied ? t('article.linkCopied') : t('article.copyLink')}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
