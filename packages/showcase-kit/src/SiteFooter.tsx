'use client'

interface FooterLink {
  label: string
  url: string
}

interface SiteFooterProps {
  faculty: FooterLink
  institute: FooterLink
  // "Base de données soutenue par la prestation" … "de", in the page language.
  credit: { lead: string; of: string }
}

// Foot of the page after the institute layout of the Unifr corporate design
// manual (p. 16-19): an indication line in the faculty colour, then the
// sender in capitals (faculty, then institute). The Unifr logo stays at the
// top of the sidebar, so the footer carries no signet; an institute or
// sponsor logo could come here.
export const SiteFooter = ({ faculty, institute, credit }: SiteFooterProps) => (
  <footer className="shrink-0 bg-background">
    <div className="h-1 bg-primary" aria-hidden />
    <div className="px-4 lg:px-6 py-2.5 flex items-end justify-between gap-6 [&_a]:transition-colors">
      <div className="text-[11px] uppercase tracking-[0.12em] leading-snug min-w-0">
        <a
          href={faculty.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-semibold text-foreground hover:text-primary-ink"
        >
          {faculty.label}
        </a>
        <a
          href={institute.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-muted-foreground hover:text-foreground"
        >
          {institute.label}
        </a>
      </div>
      <p className="hidden md:block shrink-0 text-[10px] uppercase tracking-[0.12em] leading-snug text-muted-foreground/80 text-right">
        {credit.lead}{' '}
        <a
          href="https://www.unifr.ch/it/fr/eddb.html"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-muted-foreground hover:text-foreground"
        >
          EDDB
        </a>
        <br />
        {credit.of}{' '}
        <a
          href="https://www.unifr.ch/it/fr/enseignement-et-recherche.html"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-muted-foreground hover:text-foreground"
        >
          DIT-ER
        </a>
      </p>
    </div>
  </footer>
)
