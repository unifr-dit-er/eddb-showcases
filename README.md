# EDDB showcases

Public showcases of the EDDB databases (Educational Databases, IT services of
the University of Fribourg), in one repository: a shared kit and one
application per showcase.

| Application | Showcase | State |
|---|---|---|
| `apps/pressearchiv` | Press archive of the Institute of Multilingualism | prototype |

## Layout

```
apps/<showcase>/     one Next.js application per showcase
packages/            shared kit (to come: extracted as showcases share code)
```

Rules:

- Only what already serves two showcases moves into the kit.
- A showcase can always replace a kit component with its own.
- Showcases read their NocoDB base **through the API only**, with their
  token, in development as in production.

## Development

Node.js 22+. Dependencies are installed once, at the root:

```bash
npm ci
```

> To add or update a dependency, use npm 11 (`npx npm@11 install …`): npm
> 10.9 fails to resolve this workspace (`Cannot read properties of null
> (reading 'edgesOut')`). `npm ci` works with both.

Each application reads its token from `apps/<showcase>/.env.local`
(ignored by git), then:

```bash
npm run dev --workspace=apps/pressearchiv
npm run check        # lint, types and tests of every workspace
npm run build        # build every application
```

## Deployment

One image per showcase, built from the repository root; the mount point is
fixed at build time (empty for a domain of its own):

```bash
podman build -f apps/pressearchiv/Dockerfile -t eddb-pressearchiv:latest .
podman build -f apps/pressearchiv/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_PATH=/pressearchiv -t eddb-pressearchiv:latest .
```

Procedures of each showcase: `apps/<showcase>/docs/`.
