# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Install only production dependencies for the install cache layer
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Accept the public API URL as a build argument so next.config.mjs can read it
# at build-time (NEXT_PUBLIC_* vars are inlined during build, not at runtime).
ARG NEXT_PUBLIC_API_URL=https://ssssy.org.sy/api
ARG NEXT_PUBLIC_APP_URL=https://ssssy.org.sy
ARG NEXT_PUBLIC_APP_NAME=SSSSY
ARG NEXT_PUBLIC_STORAGE_URL=https://ssssy.org.sy/storage

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S ssssy && adduser -S ssssy -G ssssy

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Standalone server listens on this port
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next.config.mjs `output: 'standalone'` produces a self-contained server bundle.
# Copy only what the standalone server needs:
COPY --from=builder --chown=ssssy:ssssy /app/.next/standalone ./
COPY --from=builder --chown=ssssy:ssssy /app/.next/static ./.next/static
COPY --from=builder --chown=ssssy:ssssy /app/public ./public

EXPOSE 3000
USER ssssy

ENTRYPOINT ["node", "server.js"]
