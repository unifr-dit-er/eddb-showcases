import { fr } from './fr'
import { de } from './de'
import { en } from './en'
import { it } from './it'

export type Locale = 'fr' | 'de' | 'en' | 'it'

// Order of the language selector.
export const LOCALES: readonly Locale[] = ['fr', 'de', 'en', 'it']

export interface Translations {
  'header.title': string
  'header.prototype': string
  'sidebar.title': string
  'sidebar.subtitle': string
  'sidebar.search.label': string
  'sidebar.search.placeholder': string
  'sidebar.series.label': string
  'sidebar.types.label': string
  'sidebar.period.label': string
  'sidebar.period.from': string
  'sidebar.period.to': string
  'sidebar.period.any': string
  'sidebar.journal.label': string
  'sidebar.journal.placeholder': string
  'activeFilters.label': string
  'activeFilters.clear': string
  'activeFilters.remove': string
  'sidebar.language.label': string
  'sidebar.language.all': string
  'sidebar.keywords.label': string
  'sidebar.keywords.placeholder': string
  'sidebar.showMore': string
  'sidebar.showLess': string
  'sidebar.clear': string
  'sidebar.resetFilters': string
  'sidebar.open': string
  'article.loading': string
  'article.copyLink': string
  'article.linkCopied': string
  'article.original': string
  'article.teaser': string
  'article.fullTextNotice': string
  'fullText.contact': string
  'fullText.urlLabel': string
  'fullText.url': string
  'article.authors': string
  'article.keywords': string
  'article.archiveNo': string
  'article.undated': string
  'articles.error': string
  'articles.empty': string
  'articles.resultUnit_singular': string
  'articles.resultUnit_plural': string
  'articles.sortDate': string
  'articles.page': string
  'articles.prev': string
  'articles.next': string
  'timeline.label': string
  'timeline.hint': string
  'timeline.records_singular': string
  'timeline.records_plural': string
  'footer.faculty': string
  'footer.faculty.url': string
  'footer.institute': string
  'footer.institute.url': string
  'footer.eddb': string
  'footer.eddb.of': string
  'sponsor.lead': string
  'sponsor.name': string
  'sponsor.url': string
  'about.title': string
  'about.content': string
}

// Labels of data values, which stay in their source form in the URL.
export interface Labels {
  recordType: Record<string, string>
  language: Record<string, string>
}

export const LOCALE_STORAGE_KEY = 'locale'
export const DEFAULT_LOCALE: Locale = 'fr'

const LOCALE_TEXTS: Record<Locale, { translations: Translations; labels: Labels }> = { fr, de, en, it }

export const getTranslations = (locale: Locale): Translations => LOCALE_TEXTS[locale].translations

export const getLabels = (locale: Locale): Labels => LOCALE_TEXTS[locale].labels

// Title of the archive chosen by the institute (29.10.2026), in the viewer's
// language: the masthead shows it on two lines, the browser tab, search
// results and the About dialog in full.
export const getPageTitle = (locale: Locale): string => {
  const t = getTranslations(locale)
  return `${t['sidebar.title']} – ${t['sidebar.subtitle']}`
}
