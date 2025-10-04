FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/auth ./apps/auth
COPY libs ./libs

# Build the application
RUN npx nx build auth

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/apps/auth/main.js"]


