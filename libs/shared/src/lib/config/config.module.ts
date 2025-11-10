import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  databaseConfig,
  emailConfig,
  redisConfig,
  minioConfig,
  rateLimitConfig,
  serviceConfig,
  authServiceConfig,
  userServiceConfig,
  notificationServiceConfig,
  apiGatewayConfig,
  articleServiceConfig,
  cmdServiceConfig,
  uploadServiceConfig,
} from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        emailConfig,
        redisConfig,
        minioConfig,
        rateLimitConfig,
        serviceConfig,
        authServiceConfig,
        userServiceConfig,
        notificationServiceConfig,
        apiGatewayConfig,
        articleServiceConfig,
        cmdServiceConfig,
        uploadServiceConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}

