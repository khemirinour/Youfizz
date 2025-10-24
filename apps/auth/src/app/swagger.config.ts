import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('YouFizz Authentication API')
    .setDescription(`
      Comprehensive Authentication API for YouFizz platform.
      
      ## Features
      - User registration and authentication
      - JWT-based access tokens and refresh tokens
      - Password reset functionality with email notifications
      - Role-based access control (RBAC)
      - Rate limiting for security
      - Comprehensive error handling
      
      ## Authentication
      Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
      \`\`\`
      Authorization: Bearer <access_token>
      \`\`\`
      
      ## Rate Limiting
      The API implements rate limiting to prevent abuse:
      - Registration: 5 requests per minute
      - Login: 10 requests per minute
      - Password Reset: 3 requests per 5 minutes
      
      Rate limit information is provided in response headers:
      - \`X-RateLimit-Limit\`: Maximum requests allowed
      - \`X-RateLimit-Remaining\`: Requests remaining in current window
      - \`X-RateLimit-Reset\`: Timestamp when the limit resets
      - \`Retry-After\`: Seconds to wait before retrying
      
      ## Test Scenarios
      This API includes comprehensive test examples for:
      - Complete user registration and authentication flow
      - Password reset process
      - Rate limiting behavior
      - Error handling and validation
      
      ## Postman Collection
      Import the provided Postman collection for automated testing:
      - Complete test scenarios
      - Automated assertions
      - Environment variables
      - Rate limiting tests
    `)
    .setVersion('1.0.0')
    .setContact('YouFizz Team', 'https://youfizz.com', 'support@youfizz.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.youfizz.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Password Reset', 'Password reset and recovery endpoints')
    .addTag('User Management', 'User management and administration endpoints')
    .addTag('Rate Limiting', 'Rate limiting and security information')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add custom headers or modify requests
        return req;
      },
      responseInterceptor: (res) => {
        // Add custom response handling
        return res;
      },
    },
    customSiteTitle: 'YouFizz Auth API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 5px; }
    `,
  });

  return document;
}


