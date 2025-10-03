import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { SharedModule } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Vendeur } from '../entities/vendeur.entity';
import { Confermateur } from '../entities/confermateur.entity';
import { SeedService } from './seed.service';
import { VendorsController } from './vendors.controller';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([User, RefreshToken, Vendeur, Confermateur]),
  ],
  controllers: [AppController, VendorsController],
  providers: [AppService, AuthService, SeedService],
})
export class AppModule {}
