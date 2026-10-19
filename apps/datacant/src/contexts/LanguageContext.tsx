'use client'

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react'
import { useLocalSetting } from '@eddb/showcase-kit/use-local-setting'
import {
  type Locale,
  type LangSuffix,
  type Translations,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getTranslations,
  getLangSuffix,
  getPageTitle,
} from '@/i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations) => string
  langSuffix: LangSuffix
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LOCALES: readonly Locale[] = ['fr', 'de']

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Hydration-safe: the server and the first render use the default locale,
  // then the stored one (see useLocalSetting).
  const [locale, setLocale] = useLocalSetting<Locale>(LOCALE_STORAGE_KEY, LOCALES, DEFAULT_LOCALE)

  const t = useCallback(
    (key: keyof Translations) => getTranslations(locale)[key],
    [locale]
  )
  const langSuffix = getLangSuffix(locale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, langSuffix }}>
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
