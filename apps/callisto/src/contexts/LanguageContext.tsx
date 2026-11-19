'use client'

import type { ReactNode } from 'react'
import { DEFAULT_LOCALE, getPageTitle, translations, type Locale, type Translations } from '@/i18n'

interface LanguageValue {
  locale: Locale
  t: (key: keyof Translations) => string
}

const value: LanguageValue = {
  locale: DEFAULT_LOCALE,
  t: (key) => translations[key],
}

// French only: the "context" is a constant, kept so that the components
// read their texts the same way as in the other showcases.
export const LanguageProvider = ({ children }: { children: ReactNode }) => (
  <>
    <title>{getPageTitle()}</title>
    {children}
  </>
)

export const useLanguage = (): LanguageValue => value
