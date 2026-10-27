import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider, useLanguage } from '../LanguageContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to "fr"', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.locale).toBe('fr')
  })

  it('reads stored locale from localStorage', () => {
    localStorage.setItem('locale', 'de')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.locale).toBe('de')
  })

  it('setLocale updates locale and persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    act(() => {
      result.current.setLocale('de')
    })
    expect(result.current.locale).toBe('de')
    expect(localStorage.getItem('locale')).toBe('de')
  })

  it('t() returns the correct translation string', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('sidebar.search.label')).toBe('Recherche')
    act(() => {
      result.current.setLocale('de')
    })
    expect(result.current.t('sidebar.search.label')).toBe('Suche')
  })

  it('label() translates data values and falls back on the value', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.label('recordType', 'Newspaper article')).toBe('Article de presse')
    expect(result.current.label('language', 'ger')).toBe('Allemand')
    expect(result.current.label('language', 'xyz')).toBe('xyz')
  })

  it('seriesTitle() follows the locale', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    const series = { titleDE: 'Freiburg', titleFR: 'Fribourg', titleIT: 'Friburgo' }
    expect(result.current.seriesTitle(series)).toBe('Fribourg')
    act(() => {
      result.current.setLocale('de')
    })
    expect(result.current.seriesTitle(series)).toBe('Freiburg')
    act(() => {
      result.current.setLocale('it')
    })
    expect(result.current.seriesTitle(series)).toBe('Friburgo')
    act(() => {
      result.current.setLocale('en')
    })
    expect(result.current.seriesTitle(series)).toBe('Freiburg')
  })

  it('throws when used outside LanguageProvider', () => {
    expect(() => renderHook(() => useLanguage())).toThrow(
      'useLanguage must be used within LanguageProvider'
    )
  })
})
