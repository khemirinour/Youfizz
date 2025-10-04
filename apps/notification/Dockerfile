FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/notification ./apps/notification
COPY libs ./libs

# Build the application
RUN npx nx build notification

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "dist/apps/notification/main.js"]


