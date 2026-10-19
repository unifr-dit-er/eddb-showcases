# Build from the monorepo root:
#   podman build -f apps/datacant/Dockerfile -t eddb-datacant:latest .
# Under a sub-path of eddb.unifr.ch, add --build-arg NEXT_PUBLIC_BASE_PATH=/datacant
FROM node:22-alpine AS builder
WORKDIR /repo
ARG NEXT_PUBLIC_BASE_PATH=
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY package.json package-lock.json ./
COPY apps/datacant/package.json apps/datacant/
RUN npm ci --workspace=apps/datacant --include-workspace-root
COPY apps/datacant apps/datacant
RUN npm run build --workspace=apps/datacant

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# The standalone output mirrors the monorepo layout from its root.
COPY --from=builder /repo/apps/datacant/.next/standalone ./
COPY --from=builder /repo/apps/datacant/.next/static ./apps/datacant/.next/static
COPY --from=builder /repo/apps/datacant/public ./apps/datacant/public
EXPOSE 3000
USER node
CMD ["node", "apps/datacant/server.js"]
