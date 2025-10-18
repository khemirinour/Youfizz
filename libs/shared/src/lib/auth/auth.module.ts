import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('authService.jwtSecret'),
        signOptions: { 
          expiresIn: configService.get<string>('authService.jwtExpiresIn') || '1h',
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, TokenBlacklistService],
  exports: [PassportModule, JwtModule, JwtAuthGuard, TokenBlacklistService],
})
export class AuthModule {}


