import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationController } from './notification.controller';
import { SharedModule, SharedRateLimitGuard, LoggingInterceptor, ResponseInterceptor } from '@you-fizz/shared';
import { getRateLimitingConfig } from './rate-limiting.config';

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRoot(getRateLimitingConfig()),
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService, SharedRateLimitGuard, LoggingInterceptor, ResponseInterceptor],
})
export class AppModule {}
