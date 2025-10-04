import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { SharedModule, SharedRateLimitGuard, LoggingInterceptor, ResponseInterceptor } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRateLimitingConfig } from './rate-limiting.config';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { Vendeur } from '../entities/vendeur.entity';
import { Confermateur } from '../entities/confermateur.entity';
import { SeedService } from './seed.service';
import { NotificationClient } from './notification.client';
import { VendorsController } from './vendors.controller';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ThrottlerModule.forRoot(getRateLimitingConfig()),
    TypeOrmModule.forFeature([User, RefreshToken, PasswordResetToken, Vendeur, Confermateur]),
  ],
  controllers: [AppController, VendorsController],
  providers: [AppService, AuthService, SeedService, NotificationClient, SharedRateLimitGuard, LoggingInterceptor, ResponseInterceptor],
})
export class AppModule {}
