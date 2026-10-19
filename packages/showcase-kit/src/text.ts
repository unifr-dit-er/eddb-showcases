// Case- and accent-insensitive form used for text matching.
export const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
