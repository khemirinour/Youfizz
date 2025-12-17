# Multi-stage build for Next.js production with NX

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/nx.json ./
COPY --from=deps /app/tsconfig.base.json ./

# Copy source code
COPY . .

# Build Next.js application with NX
RUN npx nx build web-ui --configuration=production

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# NX builds Next.js to dist/apps/web-ui with standalone output
COPY --from=builder /app/dist/apps/web-ui/.next/standalone ./
COPY --from=builder /app/dist/apps/web-ui/.next/static ./dist/apps/web-ui/.next/static
COPY --from=builder /app/dist/apps/web-ui/public ./dist/apps/web-ui/public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# NX standalone output structure
CMD ["node", "dist/apps/web-ui/server.js"]

