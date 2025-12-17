FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install all dependencies (needed for build tools)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npx nx build upload

# Expose port
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3006/api/upload/health || exit 1

# Start the application
CMD ["node", "dist/apps/upload/main.js"]
