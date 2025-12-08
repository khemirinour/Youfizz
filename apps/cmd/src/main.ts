/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser middleware to read cookies from requests
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: 4005 },
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const config = new DocumentBuilder()
    .setTitle('Command Service')
    .setDescription('Command API')
    .setVersion('1.0')
    .addTag('cmd')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.startAllMicroservices();
  const port = 3005;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🚀 Microservice is listening on TCP port: 4005`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/api-docs`
  );
}

bootstrap();


