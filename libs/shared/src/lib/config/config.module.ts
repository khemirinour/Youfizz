import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  databaseConfig,
  emailConfig,
  redisConfig,
  rateLimitConfig,
  serviceConfig,
  authServiceConfig,
  userServiceConfig,
  notificationServiceConfig,
  apiGatewayConfig,
  articleServiceConfig,
  cmdServiceConfig,
} from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        emailConfig,
        redisConfig,
        rateLimitConfig,
        serviceConfig,
        authServiceConfig,
        userServiceConfig,
        notificationServiceConfig,
        apiGatewayConfig,
        articleServiceConfig,
        cmdServiceConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}

