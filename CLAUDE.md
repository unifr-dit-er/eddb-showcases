# EDDB showcases — monorepo

Public showcases of EDDB databases: one Next.js application per showcase in
`apps/`, a shared kit in `packages/showcase-kit` (`@eddb/showcase-kit`). Each application keeps
its own `CLAUDE.md`, which applies inside it.

# Why a monorepo

Decided on 12.10.2026: a single developer, no partner contributions, and
showcases that drifted apart as soon as one was copied from another. A fix in
the kit is checked against every showcase in the same commit.

# Rules

- **Extract into `packages/` only what already serves two showcases.** Do
  not design a generic showcase up front (a configuration-driven single app,
  eddb-vue, only ever served one base).
- A showcase may override any kit component with its own.
- **NocoDB through the API only**, with the showcase token, in development
  as in production. No local exports of a base. Direct database access is
  for debugging only.
- Each showcase exposes only whitelisted fields of its NocoDB base, from
  server-side code; never a generic proxy (the service-account token reads
  several bases).
- Sub-path (eddb.unifr.ch/<showcase>) and own domain must both work:
  `basePath` comes from `NEXT_PUBLIC_BASE_PATH` at build time.
- Colours follow the Unifr corporate design (faculty colour for fills,
  midnight blue #071D49 for accented text, never a darkened faculty colour;
  WCAG AA contrast).

# The kit

`@eddb/showcase-kit` is TypeScript source, compiled with each application
(`transpilePackages`); each `globals.css` imports its `theme.css` and lists
its sources with `@source`. It holds:

- `theme.css`: tokens and faculty themes, chosen with `data-faculty` on
  <html> (`lettres`, `droit`; add a faculty from the corporate design manual,
  p. 15). Fills use the faculty colour (`bg-primary`), light surfaces its
  official tints (`bg-primary-tint-1/2/3`), never a transparency of it
  (`bg-primary/10`); accented text is midnight blue (`text-primary-ink`).
- `nocodb` (server-side client), `cached-loader` (in-memory copy of a
  base, the pattern of both showcases), `text`, `api-fetch`, `use-local-setting`
  (hydration-safe viewer preferences), `font-size`, `site-footer`,
  `sidebar-masthead` (each application loads the Newsreader serif),
  `year-timeline`, `active-filter-chips`.

shadcn/ui components stay in each application (`src/components/ui`), as the
shadcn CLI expects.

# Tooling

- npm workspaces, **npm 11** (npm 10.9 fails to resolve this workspace;
  `npm ci` still works with it, as in the Dockerfiles). Install with
  `npm ci` at the root. `overrides` and `allowScripts` live in the root
  `package.json` only.
- `npm run check` (lint, typecheck, tests) and `npm run build` run every
  workspace.
- Dockerfiles build from the repository root:
  `podman build -f apps/<showcase>/Dockerfile .`
