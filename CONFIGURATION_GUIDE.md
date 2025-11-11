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

### MinIO Configuration
```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=youfizz-uploads
```

**Note**: MinIO is automatically started via Docker Compose. The default credentials (`minioadmin`/`minioadmin`) should be changed in production.

### Service Ports
```bash
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
AUTH_MICROSERVICE_PORT=4001
USER_SERVICE_PORT=3002
USER_MICROSERVICE_PORT=3002
NOTIFICATION_SERVICE_PORT=3003
NOTIFICATION_MICROSERVICE_PORT=3003
UPLOAD_SERVICE_PORT=3006
UPLOAD_MICROSERVICE_PORT=4006
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
   
   # Terminal 5 - Upload Service
   nx serve upload
   ```

## Production Setup

1. Set appropriate production values for all environment variables
2. Use a proper SMTP service for email delivery
3. Configure Redis for production use
4. Set strong JWT secrets
5. Configure proper database credentials
6. Configure MinIO with secure credentials and SSL enabled
7. Set NODE_ENV=production

## Rate Limiting

Rate limiting is automatically configured based on the NODE_ENV:
- **Development**: More lenient limits for testing
- **Production**: Stricter limits for security

You can customize rate limits by modifying the configuration in `libs/shared/src/lib/config/app.config.ts`.

## MinIO Setup

MinIO is an S3-compatible object storage service used for file uploads. The service is automatically configured when you start Docker Compose.

### Accessing MinIO Console

1. Start Docker Compose: `docker-compose up -d`
2. Access the MinIO Console at: `http://localhost:9001`
3. Login with default credentials:
   - Username: `minioadmin`
   - Password: `minioadmin`

### Buckets

The upload service automatically creates the following buckets on startup:
- `youfizz-articles` - For article images
- `youfizz-users` - For user profile images
- `youfizz-categories` - For category images

### Upload Service API

The upload service provides the following endpoints:
- `POST /api/upload` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/files/:bucket/:objectName` - Get presigned URL for a file
- `DELETE /api/upload/files/:bucket/:objectName` - Delete a file
- `GET /api/upload/files/:bucket` - List files in a bucket
- `GET /api/upload/health` - Health check endpoint

All upload endpoints require JWT authentication and appropriate roles (admin or vendeur).
