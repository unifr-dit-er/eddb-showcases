'use client'

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react'
import {
  type Labels,
  type Locale,
  type Translations,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  getLabels,
  getTranslations,
  getPageTitle,
} from '@/i18n'
import type { Series } from '@/types/archive'
import { useLocalSetting } from '@eddb/showcase-kit/use-local-setting'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations) => string
  // Label of a data value (record type, language code), or the value itself.
  label: (kind: keyof Labels, value: string) => string
  seriesTitle: (series: Pick<Series, 'titleDE' | 'titleFR' | 'titleIT'>) => string
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
    (series: Pick<Series, 'titleDE' | 'titleFR' | 'titleIT'>) => {
      // The base has no English titles: the German ones stand in for them.
      if (locale === 'fr') return series.titleFR
      if (locale === 'it') return series.titleIT
      return series.titleDE
    },
    [locale]
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, label, seriesTitle }}>
      {/* Rendered by the server too (unlike the page, which reads the URL):
          React hoists it into <head>, in the viewer's language. */}
      <title>{getPageTitle(locale)}</title>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
