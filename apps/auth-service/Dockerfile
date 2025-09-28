FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy shared libraries
COPY libs/ ./libs/

# Copy app source
COPY apps/auth-service/ ./apps/auth-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build auth-service

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/apps/auth-service/main.js"]
