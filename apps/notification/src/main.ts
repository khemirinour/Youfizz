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
  
  // Remove microservice configuration for HTTP-only service
  // app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: { port: 3003 },
  // });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Setup comprehensive Swagger documentation
  setupSwagger(app);

  // Remove microservice startup
  // await app.startAllMicroservices();
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  Logger.log(
    `🚀 Notification service is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/api`
  );
}

bootstrap();
