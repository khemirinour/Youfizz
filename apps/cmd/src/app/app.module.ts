import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Order])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


