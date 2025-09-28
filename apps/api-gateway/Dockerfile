FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy shared libraries
COPY libs/ ./libs/

# Copy app source
COPY apps/api-gateway/ ./apps/api-gateway/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build api-gateway

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api-gateway/main.js"]
