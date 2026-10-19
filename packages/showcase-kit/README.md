# @eddb/showcase-kit

Shared kit of the EDDB showcases (`apps/*` of this monorepo): only what
already serves two showcases.

| Import | Content |
|---|---|
| `@eddb/showcase-kit/theme.css` | Tokens and faculty themes (`data-faculty` on `<html>`), official tints |
| `@eddb/showcase-kit/nocodb` | NocoDB API client (`fetchNocoDB`, `fetchAllRecords` for whitelisted fields of a whole table), server-side only |
| `@eddb/showcase-kit/cached-loader` | In-memory copy of a base, reloaded after a TTL, previous copy kept if NocoDB fails |
| `@eddb/showcase-kit/text` | `normalize`: case- and accent-insensitive matching |
| `@eddb/showcase-kit/api-fetch` | `fetch` with the showcase's base path; `withBasePath` for links |
| `@eddb/showcase-kit/use-local-setting` | Viewer preference in localStorage, hydration-safe |
| `@eddb/showcase-kit/font-size` | Text-size context and provider |
| `@eddb/showcase-kit/site-footer` | Footer after the institute layout of the corporate design |
| `@eddb/showcase-kit/sidebar-masthead` | Top of the sidebar: Unifr logo, showcase name in serif between rules, subtitle |
| `@eddb/showcase-kit/year-timeline` | Distribution by year of the results, click to select a year or a period |
| `@eddb/showcase-kit/active-filter-chips` | Chips of the active filters above the results, each removable; the showcase builds them |
| `@eddb/showcase-kit/tag` | Tags of the entries (cards, panels): `caps` for a category (series, canton), `outline` for a code (language), `keyword` for a keyword (capitals, tighter and lighter) |

Rules and theme conventions: root `CLAUDE.md`.
