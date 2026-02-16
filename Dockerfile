# ────────────────────────────────────
# Stage 1: Build Client
# ────────────────────────────────────
FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./

# Build args for Vite env vars (passed at build time)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_API_URL

RUN npm run build

# ────────────────────────────────────
# Stage 2: Build Server
# ────────────────────────────────────
FROM node:20-alpine AS server-build

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ────────────────────────────────────
# Stage 3: Production
# ────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy server build
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/package*.json ./server/

# Copy client build
COPY --from=client-build /app/client/dist ./client/dist

# Install production dependencies
WORKDIR /app/server
RUN npm ci --omit=dev

# Expose port
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:8080/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
