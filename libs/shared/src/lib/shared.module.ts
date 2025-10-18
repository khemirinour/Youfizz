import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { EmailModule } from './email/email.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { SharedRateLimitGuard } from './guards/rate-limit.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  imports: [DatabaseModule, EmailModule, AppConfigModule, AuthModule],
  providers: [
    DatabaseService,
    SharedRateLimitGuard,
    LoggingInterceptor,
    ResponseInterceptor,
  ],
  exports: [
    DatabaseModule,
    DatabaseService,
    EmailModule,
    AppConfigModule,
    AuthModule,
    SharedRateLimitGuard,
    LoggingInterceptor,
    ResponseInterceptor,
  ],
})
export class SharedModule {}