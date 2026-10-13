'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface FilterSectionProps {
  title: string
  // Number of active values: shown on the closed section, and opens it.
  activeCount: number
  onReset?: () => void
  defaultOpen?: boolean
  children: React.ReactNode
}

// A sidebar filter that folds away. It opens by default when asked, or when
// it holds an active filter (shared link, card badge); once the user opens
// or closes it, their choice wins.
export const FilterSection = ({ title, activeCount, onReset, defaultOpen = false, children }: FilterSectionProps) => {
  const { t } = useLanguage()
  const [userOpen, setUserOpen] = useState<boolean | null>(null)
  const open = userOpen ?? (defaultOpen || activeCount > 0)

  return (
    <Collapsible open={open} onOpenChange={setUserOpen}>
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger className="flex flex-1 items-center gap-1.5 py-1 text-left group">
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 text-sidebar-foreground/65 transition-transform duration-150',
              open && 'rotate-90'
            )}
          />
          <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/65 group-hover:text-sidebar-foreground/80 transition-colors">
            {title}
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 leading-4 font-semibold tabular-nums">
              {activeCount}
            </span>
          )}
        </CollapsibleTrigger>
        {onReset && (
          <button
            onClick={onReset}
            className="text-[11px] text-sidebar-foreground/65 hover:text-sidebar-foreground/80 transition-colors"
          >
            {t('sidebar.clear')}
          </button>
        )}
      </div>
      <CollapsibleContent className="pt-2.5">{children}</CollapsibleContent>
    </Collapsible>
  )
}
