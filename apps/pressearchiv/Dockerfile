# Build from the monorepo root:
#   podman build -f apps/pressearchiv/Dockerfile -t eddb-pressearchiv:latest .
# Under a sub-path of eddb.unifr.ch, add --build-arg NEXT_PUBLIC_BASE_PATH=/pressearchiv
FROM node:22-alpine AS builder
WORKDIR /repo
ARG NEXT_PUBLIC_BASE_PATH=
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY package.json package-lock.json ./
COPY apps/pressearchiv/package.json apps/pressearchiv/
RUN npm ci --workspace=apps/pressearchiv --include-workspace-root
COPY apps/pressearchiv apps/pressearchiv
RUN npm run build --workspace=apps/pressearchiv

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# The standalone output mirrors the monorepo layout from its root.
COPY --from=builder /repo/apps/pressearchiv/.next/standalone ./
COPY --from=builder /repo/apps/pressearchiv/.next/static ./apps/pressearchiv/.next/static
COPY --from=builder /repo/apps/pressearchiv/public ./apps/pressearchiv/public
EXPOSE 3000
USER node
CMD ["node", "apps/pressearchiv/server.js"]
