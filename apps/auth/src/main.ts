/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { setupSwagger } from './app/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser middleware for HttpOnly cookies
  // Use require for CommonJS module
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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Required for cookies
  });
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: 4001 },
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Setup comprehensive Swagger documentation
  setupSwagger(app);

  await app.startAllMicroservices();
  const port = 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🚀 Microservice is listening on TCP port: ${port}`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/api-docs`
  );
}

bootstrap();
