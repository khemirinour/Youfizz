import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('YouFizz Notification API')
    .setDescription(`
      Email notification service for YouFizz platform.
      
      ## Features
      - Password reset email notifications
      - Welcome email notifications
      - Professional HTML email templates
      - Rate limiting for email sending
      - SMTP and MailHog integration
      - Comprehensive error handling
      
      ## Email Templates
      The service provides professional email templates:
      - **Password Reset**: Secure reset links with 1-hour expiration
      - **Welcome**: Branded welcome messages with getting started tips
      - **Responsive Design**: Mobile-friendly HTML templates
      
      ## Rate Limiting
      Email sending is rate limited to prevent abuse:
      - Password Reset Emails: 10 per minute
      - Welcome Emails: 20 per minute
      
      ## Development
      In development mode, emails are captured by MailHog:
      - Web UI: http://localhost:8025
      - SMTP: localhost:1025
      
      ## Production
      Configure SMTP settings for production email delivery:
      - SendGrid, AWS SES, or other SMTP providers
      - Environment-based configuration
      
      ## Test Scenarios
      This API includes comprehensive test examples for:
      - Email sending functionality
      - Rate limiting behavior
      - Error handling and validation
      - Template rendering
    `)
    .setVersion('1.0.0')
    .setContact('YouFizz Team', 'https://youfizz.com', 'support@youfizz.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3003', 'Development Server')
    .addServer('https://notifications.youfizz.com', 'Production Server')
    .addTag('Email Notifications', 'Email sending and notification endpoints')
    .addTag('Rate Limiting', 'Rate limiting and security information')
    .addTag('Templates', 'Email template information')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'YouFizz Notification API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 5px; }
    `,
  });

  return document;
}


