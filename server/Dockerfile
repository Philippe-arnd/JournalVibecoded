# Build stage
FROM node:24.21.0-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm run db:generate

# Production stage
FROM node:24.21.0-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1
# Pull Alpine security fixes (e.g. openssl) published after the pinned base
# image digest; Renovate bumps the digest, this covers the gap in between.
RUN apk upgrade --no-cache && apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
# npm/npx are only needed to install deps above, never at runtime (the CMD
# below calls the local binaries directly instead of going through `npm
# run`). Removing them drops the base image's bundled npm and its own
# vulnerable transitive deps (tar, undici, ip-address, brace-expansion) from
# the final image entirely.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./src/templates
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000
# Run migrations, backfill account.issuer (better-auth 1.7 sign-in requirement,
# see src/scripts/backfill-account-issuer.ts), apply RLS, then start the server
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && ./node_modules/.bin/tsx src/scripts/backfill-account-issuer.ts && ./node_modules/.bin/tsx src/scripts/apply-rls-prod.ts && node dist/server.js"]
