# Build stage
FROM node:24.19.0-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm run db:generate

# Production stage
FROM node:24.19.0-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
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
# Run migrations and apply RLS before starting the server
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && ./node_modules/.bin/tsx src/scripts/apply-rls-prod.ts && node dist/server.js"]
