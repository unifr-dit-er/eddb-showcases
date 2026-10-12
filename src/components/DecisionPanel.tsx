'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDecision } from '@/hooks/useDecision'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { getCantonLabel } from '@/lib/cantons'
import { cn } from '@/lib/utils'
import { Check, Copy, Download } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DecisionPanelProps {
  decisionId: string | null
  onClose: () => void
}

const DecisionPanel = ({ decisionId, onClose }: DecisionPanelProps) => {
  const { data: decision, isLoading } = useDecision(decisionId)
  const { t, locale, langSuffix } = useLanguage()
  const { filters, setFilter } = useFilters()
  const [linkCopied, setLinkCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(!!decisionId)

  // The open/closed state is kept local rather than driven directly by
  // `decisionId` so the sheet always closes instantly on click — in some
  // production setups the URL update triggered by onClose() can lag or be
  // cached, which otherwise left the panel stuck open.
  useEffect(() => {
    if (decisionId) setIsOpen(true)
  }, [decisionId])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) onClose()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleCantonClick = () => {
    if (!decision?.canton) return
    setFilter('canton', filters.canton === decision.canton ? '' : decision.canton)
  }

  const handleKeywordClick = (kwId: string) => {
    setFilter(
      'keywords',
      filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
    )
  }

  const groupedKeywords = decision?.keywords.reduce<Record<string, string[]>>(
    (acc, kw) => {
      if (!acc[kw.category]) acc[kw.category] = []
      acc[kw.category].push(kw.label)
      return acc
    },
    {}
  )

  const formattedDate = decision
    ? new Date(decision.date).toLocaleDateString(`${locale}-CH`, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto px-6 pb-6 w-[42vw] min-w-[420px] max-w-[760px] sm:max-w-[760px]" showCloseButton={false}>
        <SheetHeader className="px-0 pt-6 pb-0 mb-6">
          <SheetTitle className="font-heading text-2xl font-bold leading-snug text-foreground">
            {decision?.title ?? (isLoading ? t('decision.loading') : '')}
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        )}

        {decision && (
          <div className="space-y-4">
            {decision.pdfUrl && (
              <div className="flex items-center gap-2 -mt-2 mb-6">
                <a
                  href={decision.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Download className="h-4 w-4" />
                  {t('decision.downloadPdf')}
                </a>
                <a
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors"
                  title="CC0 1.0 Universal"
                >
                  <span className="border border-current rounded px-1 py-px tracking-normal font-bold text-[9px]">CC0</span>
                </a>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              {decision.canton && (
                <span
                  onClick={handleCantonClick}
                  className={cn(
                    'text-[0.6875rem] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                    filters.canton === decision.canton
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary'
                  )}
                >
                  {getCantonLabel(decision.canton, langSuffix)}
                </span>
              )}
              <span className="text-[0.8125rem] text-primary font-medium">{formattedDate}</span>
            </div>

            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <p className="text-base leading-relaxed text-foreground/85">{decision.abstract}</p>
                <div className="mt-3 pt-2 border-t border-border/60 flex justify-end">
                  <a
                    href="https://creativecommons.org/licenses/by-nc/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                    title="CC BY-NC 4.0"
                  >
                    <span className="border border-current rounded px-1 py-px tracking-normal font-bold text-[9px]">CC BY-NC</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {groupedKeywords && Object.keys(groupedKeywords).length > 0 && (
              <div className="space-y-4">
                {Object.keys(groupedKeywords).map((category) => (
                  <div key={category}>
                    <p className="text-[0.6875rem] tracking-[0.2em] uppercase font-semibold text-muted-foreground mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {decision.keywords
                        .filter((kw) => kw.category === category)
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((kw) => (
                        <Badge
                          key={kw.id}
                          variant="secondary"
                          onClick={() => handleKeywordClick(kw.id)}
                          className={cn(
                            'text-xs px-2 py-0.5 font-normal cursor-pointer transition-colors',
                            filters.keywords.includes(kw.id)
                              ? 'bg-primary/15 text-primary hover:bg-primary/25'
                              : 'hover:bg-primary/15 hover:text-primary'
                          )}
                        >
                          {kw.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleCopyLink}
                title={t('decision.copyLink')}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer',
                  linkCopied ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopied ? t('decision.linkCopied') : t('decision.copyLink')}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DecisionPanel
