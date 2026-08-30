# Build stage
FROM node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm run db:generate

# Production stage
FROM node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf
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
