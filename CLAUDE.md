# EDDB showcases — monorepo

Public showcases of EDDB databases: one Next.js application per showcase in
`apps/`, a shared kit in `packages/` (empty for now). Each application keeps
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

# Tooling

- npm workspaces, **npm 11** (npm 10.9 fails to resolve this workspace;
  `npm ci` still works with it, as in the Dockerfiles). Install with
  `npm ci` at the root. `overrides` and `allowScripts` live in the root
  `package.json` only.
- `npm run check` (lint, typecheck, tests) and `npm run build` run every
  workspace.
- Dockerfiles build from the repository root:
  `podman build -f apps/<showcase>/Dockerfile .`
