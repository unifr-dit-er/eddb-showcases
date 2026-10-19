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

// Serif of the sidebar masthead (shared press tone of the showcases).
const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
})

// Note: metadata and html[lang] are static (server-rendered) and cannot be driven
// by the client-side LanguageContext. They reflect the default locale (FR).
// Canton labels in src/lib/cantons.ts are also French-only (follow-up task).
export const metadata: Metadata = {
  title: 'Base de données — Protection des données',
  description: 'Décisions juridiques cantonales suisses concernant la protection des données',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html data-faculty="droit" lang="fr" className={`${atkinson.variable} ${atkinsonMono.variable} ${newsreader.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
