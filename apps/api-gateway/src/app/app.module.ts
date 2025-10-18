import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayService } from './gateway.service';
import { SharedModule } from '@you-fizz/shared';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@you-fizz/shared';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60,
        limit: 100,
      }],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GatewayService, JwtStrategy],
})
export class AppModule {}
