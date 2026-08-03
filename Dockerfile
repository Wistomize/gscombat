FROM node:22-bookworm-slim AS builder

ENV API_BASE_URL=http://api:3001
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

COPY . .

RUN pnpm config set registry https://registry.npmmirror.com && pnpm install --frozen-lockfile
RUN pnpm --filter @gscombat/api... build && pnpm --filter @gscombat/web... build

FROM node:22-bookworm-slim AS api

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]

FROM node:22-bookworm-slim AS web

ENV API_BASE_URL=http://api:3001
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3200

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3200

CMD ["node", "apps/web/server.js"]
