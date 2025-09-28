FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy shared libraries
COPY libs/ ./libs/

# Copy app source
COPY apps/user-service/ ./apps/user-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build user-service

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "dist/apps/user-service/main.js"]
