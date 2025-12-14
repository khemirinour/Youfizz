/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser middleware to read cookies from requests
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: 3002 },
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await app.startAllMicroservices();
  const port = 3002;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🚀 Microservice is listening on TCP port: ${port}`
  );
}

bootstrap();
