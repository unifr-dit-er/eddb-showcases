# Build from the monorepo root:
#   podman build -f apps/callisto/Dockerfile -t eddb-callisto:latest .
# Under a sub-path of eddb.unifr.ch, add --build-arg NEXT_PUBLIC_BASE_PATH=/callisto
FROM node:22-alpine AS builder
WORKDIR /repo
ARG NEXT_PUBLIC_BASE_PATH=
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY package.json package-lock.json ./
COPY apps/callisto/package.json apps/callisto/
# The shared kit is a workspace of the monorepo, not a registry package.
COPY packages/showcase-kit/package.json packages/showcase-kit/
RUN npm ci --workspace=apps/callisto --workspace=packages/showcase-kit --include-workspace-root
COPY packages/showcase-kit packages/showcase-kit
COPY apps/callisto apps/callisto
RUN npm run build --workspace=apps/callisto

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# The standalone output mirrors the monorepo layout from its root.
COPY --from=builder /repo/apps/callisto/.next/standalone ./
COPY --from=builder /repo/apps/callisto/.next/static ./apps/callisto/.next/static
COPY --from=builder /repo/apps/callisto/public ./apps/callisto/public
EXPOSE 3000
USER node
CMD ["node", "apps/callisto/server.js"]
