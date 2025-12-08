/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser middleware to read cookies from requests
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3006',
      'http://127.0.0.1:3000',
      'http://localhost:4200',
      'http://127.0.0.1:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // Required for cookies
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('You Fizz API Gateway')
    .setDescription('Central API Gateway for You Fizz microservices architecture. Provides unified access to all backend services including authentication, articles, orders, users, notifications, and statistics.')
    .setVersion('1.0')
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
    .addTag('auth', 'Authentication and user management endpoints')
    .addTag('articles', 'Article management endpoints')
    .addTag('orders', 'Order/Command management endpoints')
    .addTag('profile', 'User profile endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('statistics', 'Statistics and analytics endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/${globalPrefix}-docs`
  );
}

bootstrap();
