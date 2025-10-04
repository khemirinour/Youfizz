# Configuration Guide

This guide explains how to configure the YouFizz application using environment variables.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database Configuration
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=you_fizz
DB_RETRY_ATTEMPTS=10
DB_RETRY_DELAY=3000
```

### Email Configuration
```bash
# Production SMTP
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@youfizz.com
FRONTEND_URL=https://yourdomain.com

# Development MailHog
MAILHOG_HOST=localhost
MAILHOG_PORT=1025
```

### Redis Configuration
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Service Ports
```bash
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
AUTH_MICROSERVICE_PORT=4001
USER_SERVICE_PORT=3002
USER_MICROSERVICE_PORT=3002
NOTIFICATION_SERVICE_PORT=3003
NOTIFICATION_MICROSERVICE_PORT=3003
```

### JWT Configuration
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Application Configuration
```bash
NODE_ENV=development
SERVICE_NAME=you-fizz
```

## Development Setup

1. Copy the environment variables above to a `.env` file
2. Start the required services using Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Run the services individually:
   ```bash
   # Terminal 1 - API Gateway
   nx serve api-gateway
   
   # Terminal 2 - Auth Service
   nx serve auth
   
   # Terminal 3 - User Service
   nx serve user
   
   # Terminal 4 - Notification Service
   nx serve notification
   ```

## Production Setup

1. Set appropriate production values for all environment variables
2. Use a proper SMTP service for email delivery
3. Configure Redis for production use
4. Set strong JWT secrets
5. Configure proper database credentials
6. Set NODE_ENV=production

## Rate Limiting

Rate limiting is automatically configured based on the NODE_ENV:
- **Development**: More lenient limits for testing
- **Production**: Stricter limits for security

You can customize rate limits by modifying the configuration in `libs/shared/src/lib/config/app.config.ts`.
