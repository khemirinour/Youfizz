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
