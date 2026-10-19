'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import {
  type Labels,
  type Locale,
  type Translations,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getLabels,
  getTranslations,
} from '@/i18n'
import type { Series } from '@/types/archive'
import { useLocalSetting } from '@eddb/showcase-kit/use-local-setting'

const LOCALES: readonly Locale[] = ['fr', 'de']

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations) => string
  // Label of a data value (record type, language code), or the value itself.
  label: (kind: keyof Labels, value: string) => string
  seriesTitle: (series: Pick<Series, 'titleDE' | 'titleFR'>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useLocalSetting<Locale>(LOCALE_STORAGE_KEY, LOCALES, DEFAULT_LOCALE)

  const t = useCallback(
    (key: keyof Translations) => getTranslations(locale)[key],
    [locale]
  )

  const label = useCallback(
    (kind: keyof Labels, value: string) => getLabels(locale)[kind][value] ?? value,
    [locale]
  )

  const seriesTitle = useCallback(
    (series: Pick<Series, 'titleDE' | 'titleFR'>) =>
      locale === 'de' ? series.titleDE : series.titleFR,
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, label, seriesTitle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
