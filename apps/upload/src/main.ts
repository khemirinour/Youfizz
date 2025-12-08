/**
 * Upload Service - Handles file uploads to MinIO
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable cookie parser middleware to read cookies from requests
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: configService.get('uploadService.microservicePort') || 4006 },
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
  );
  
  const config = new DocumentBuilder()
    .setTitle('Upload Service')
    .setDescription('File Upload API - MinIO Integration')
    .setVersion('1.0')
    .addTag('upload')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.startAllMicroservices();
  const port = configService.get('uploadService.port') || 3006;
  await app.listen(port);
  Logger.log(
    `🚀 Upload Service is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🚀 Microservice is listening on TCP port: ${configService.get('uploadService.microservicePort') || 4006}`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/api-docs`
  );
}

bootstrap();

