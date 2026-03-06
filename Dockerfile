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

# Build the application (Vite frontend + esbuild backend)
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

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy drizzle schema for migrations (needed at runtime)
COPY drizzle/ ./drizzle/
COPY drizzle.config.ts ./

# Expose the port Railway will assign
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
