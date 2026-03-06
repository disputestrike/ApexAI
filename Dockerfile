# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application:
#   - Vite outputs frontend to dist/public/
#   - esbuild outputs server bundle to dist/index.js
RUN pnpm build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy the entire dist/ folder from builder:
#   dist/index.js       → compiled server bundle
#   dist/public/        → compiled frontend (Vite output)
COPY --from=builder /app/dist ./dist

# Copy drizzle schema for migrations (needed at runtime)
COPY drizzle/ ./drizzle/
COPY drizzle.config.ts ./

# Expose the default port (Railway overrides via PORT env var)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server — reads PORT from Railway environment automatically
CMD ["node", "dist/index.js"]
