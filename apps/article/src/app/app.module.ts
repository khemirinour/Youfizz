import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Article])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


