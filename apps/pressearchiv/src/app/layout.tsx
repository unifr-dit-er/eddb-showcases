import type { Metadata } from 'next'
import {
  Atkinson_Hyperlegible_Next,
  Atkinson_Hyperlegible_Mono,
  Newsreader,
} from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

// Next.js has no fallback metrics for the Atkinson fonts: without an explicit
// fallback, Turbopack warns and the text shows in the browser's default serif
// until the font loads.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: '--font-atkinson',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
})

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  variable: '--font-atkinson-mono',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
})

// Serif for the masthead and the titles of the archived documents: the
// press tone of this showcase, on top of the interface font shared with
// datacant.
const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
})

// Note: metadata and html[lang] are static (server-rendered) and cannot be driven
// by the client-side LanguageContext. They reflect the default locale (FR).
export const metadata: Metadata = {
  title: 'Pressearchiv — Institut de plurilinguisme',
  description:
    'Articles de presse et littérature grise sur l’enseignement des langues et la politique linguistique en Suisse',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      data-faculty="lettres"
      lang="fr"
      className={`${atkinson.variable} ${atkinsonMono.variable} ${newsreader.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
