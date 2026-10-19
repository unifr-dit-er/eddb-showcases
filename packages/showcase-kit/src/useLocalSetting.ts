'use client'

import { useCallback, useSyncExternalStore } from 'react'

// Same-tab subscribers; other tabs are reached through the `storage` event.
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * A viewer preference kept in localStorage (locale, text size).
 *
 * The server, which has no localStorage, renders the fallback; React hydrates
 * with that same value, then switches to the stored one. Reading localStorage
 * during the first render instead made the server and client HTML differ
 * (hydration error when the stored locale was "de").
 */
export const useLocalSetting = <T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T
): [T, (value: T) => void] => {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const stored = read(key)
      return stored !== null && (allowed as readonly string[]).includes(stored) ? (stored as T) : fallback
    },
    () => fallback
  )

  const setValue = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, next)
      } catch {
        // Private mode or blocked storage: the choice lasts until reload.
      }
      listeners.forEach((listener) => listener())
    },
    [key]
  )

  return [value, setValue]
}
