'use client'

import { Tag } from '@eddb/showcase-kit/tag'
import { FieldLabel } from '@eddb/showcase-kit/field-label'
import { Emphasis } from '@/components/Emphasis'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ItemNotFoundError, useItem } from '@/hooks/useItem'
import { useFilters, type MultiFilter } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDating, paragraphs } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Translations } from '@/i18n'
import { Check, Copy, ImageOff } from 'lucide-react'
import { useState } from 'react'

interface ItemPanelProps {
  itemId: string | null
  onClose: () => void
}

// Long texts: one evenly spaced paragraph per blank-line block of the base,
// single line breaks kept inside a paragraph.
const LongText = ({ children }: { children: string }) => (
  <div className="space-y-3 text-base leading-relaxed text-foreground/85">
    {paragraphs(children).map((paragraph, index) => (
      <p key={index} className="whitespace-pre-line">
        <Emphasis>{paragraph}</Emphasis>
      </p>
    ))}
  </div>
)

export const ItemPanel = ({ itemId, onClose }: ItemPanelProps) => {
  const { data: item, isLoading, error } = useItem(itemId)
  const notFound = error instanceof ItemNotFoundError
  const { t } = useLanguage()
  const { filters, toggleValue } = useFilters()
  const [linkCopied, setLinkCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(!!itemId)
  const [shownId, setShownId] = useState(itemId)

  // Local open state, as in the other showcases: the sheet closes at once
  // even if the URL update triggered by onClose() lags. A new record reopens it.
  if (itemId !== shownId) {
    setShownId(itemId)
    if (itemId) setIsOpen(true)
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

  // Facts of the record: a filter value is a link that toggles the filter.
  type Fact = { label: keyof Translations; value: string; filter?: MultiFilter }
  const allFacts: Fact[] = item
    ? [
        { label: 'item.period', value: item.period, filter: 'periods' },
        { label: 'item.category', value: item.category, filter: 'categories' },
        { label: 'item.form', value: item.form, filter: 'forms' },
        { label: 'item.material', value: item.material, filter: 'materials' },
        { label: 'item.dimensions', value: item.dimensions },
        { label: 'item.productionCentre', value: item.productionCentre, filter: 'centres' },
        { label: 'item.discoveryPlace', value: item.discoveryPlace },
        { label: 'item.conservationPlace', value: item.conservationPlace },
      ]
    : []
  const facts = allFacts.filter((f) => f.value)

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="overflow-y-auto px-6 pb-6 w-full sm:w-[42vw] sm:min-w-[440px] max-w-[760px] sm:max-w-[760px]"
        showCloseButton={false}
      >
        <SheetHeader className="px-0 pt-6 pb-0 mb-5 gap-3">
          {item && (
            <p className="font-mono text-[0.75rem] text-muted-foreground tabular-nums">
              {t('item.number')} {item.id}
            </p>
          )}
          <SheetTitle className="font-serif text-[1.75rem] font-semibold leading-tight text-foreground">
            {item?.title ?? (isLoading ? t('item.loading') : notFound ? `${t('item.number')} ${itemId}` : '')}
          </SheetTitle>
          {item && (
            <SheetDescription className="text-[0.9375rem] text-primary-ink font-medium">
              {formatDating(item.dateFrom, item.dateTo) || t('item.undated')}
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

        {notFound && <p className="text-base text-muted-foreground">{t('item.notFound')}</p>}

        {item && (
          <div className="space-y-6">
            {item.description && (
              <div>
                <FieldLabel className="mb-2">{t('item.description')}</FieldLabel>
                <LongText>{item.description}</LongText>
              </div>
            )}

            {facts.length > 0 && (
              <dl className="grid grid-cols-[minmax(0,12rem)_1fr] items-baseline gap-x-4 gap-y-2 text-[0.9375rem]">
                {facts.map((f) => (
                  <div key={f.label} className="contents">
                    <FieldLabel as="dt">{t(f.label)}</FieldLabel>
                    <dd>
                      {f.filter ? (
                        <button
                          onClick={() => toggleValue(f.filter!, f.value)}
                          className={cn(
                            'text-left transition-colors',
                            filters[f.filter].includes(f.value) ? 'text-primary-ink' : 'hover:text-primary-ink'
                          )}
                        >
                          {f.value}
                        </button>
                      ) : (
                        f.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {item.subjects.length > 0 && (
              <div>
                <FieldLabel className="mb-2">{t('item.subjects')}</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {[...item.subjects]
                    .sort((a, b) => a.localeCompare(b, 'fr'))
                    .map((s) => (
                      <Tag key={s} onClick={() => toggleValue('subjects', s)} active={filters.subjects.includes(s)}>
                        {s}
                      </Tag>
                    ))}
                </div>
              </div>
            )}

            {item.sources && (
              <div>
                <FieldLabel className="mb-2">{t('item.sources')}</FieldLabel>
                <LongText>{item.sources}</LongText>
              </div>
            )}

            {item.bibliography && (
              <div>
                <FieldLabel className="mb-2">{t('item.bibliography')}</FieldLabel>
                <LongText>{item.bibliography}</LongText>
              </div>
            )}

            <div className="rounded-lg bg-muted/70 px-4 py-3 flex gap-3 text-[0.875rem] text-muted-foreground leading-relaxed">
              <ImageOff className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p>{t('item.noImage')}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleCopyLink}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer',
                  linkCopied ? 'text-primary-ink' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopied ? t('item.linkCopied') : t('item.copyLink')}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
