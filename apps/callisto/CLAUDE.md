# Project Overview

Read-only public showcase of the Callisto base (Prof. Véronique Dasen, ERC
Locus Ludi): material culture and representations of play and childhood in
antiquity, with data fetched from a NocoDB API. It follows the pressearchiv
showcase (same stack, same look). There is no authentication and no
database — all data comes from NocoDB. It replaces the callisto
configuration of `eddb-vue` (decision of 19.11.2026).

# Monorepo

Part of `eddb-showcases`: theme, NocoDB client and cache, viewer
preferences, timeline and shared components come from `@eddb/showcase-kit`
(`packages/showcase-kit`); the faculty theme is `data-faculty="lettres"` on
<html>. See the root `CLAUDE.md`.

# Environment Variables

```
NEXT_PUBLIC_NOCODB_API_URL=   # NocoDB base URL (.env, versioned)
NOCODB_API_TOKEN=              # token of this showcase (.env.local, server-side only)
```

# Rules

- **No images.** The rights of the images are not cleared for the public:
  `Image` and `ImagesAdditionnelles` stay out of the whitelist
  (`src/lib/collection-config.ts`) and are never requested from NocoDB.
- **Published records only**: `(Publication,eq,true)` in the NocoDB query,
  checked again when building the collection (`eq`, not `is`: see the
  config).
- **French only**: the partial English fields of the base are ignored; the
  texts live in `src/i18n/index.ts`.
- Dates are years, negative before the common era; some records end before
  they start or have no dating: they are shown as stored.
- The base marks italics with asterisks; `Emphasis` renders them, and no
  HTML from the base is ever interpreted.

# Architecture

- `src/lib/collection-store.ts` loads the published records into memory,
  refreshed every hour; the route handlers in `/app/api/` (`items`,
  `items/[id]`, `facets`) filter, count and paginate them
  (`src/lib/collection-query.ts`). Values of a field combine with "or",
  subjects with "and"; counts are contextual. The API token stays
  server-side.
- The timeline counts starting years by centuries (`TIMELINE_BUCKET`), with
  the `bucket` and `formatYear` options of the kit's `YearTimeline`.
- Client data fetching goes through TanStack Query hooks in `src/hooks/`;
  the URL holds every filter, the sort and the open record (`?item=`).
