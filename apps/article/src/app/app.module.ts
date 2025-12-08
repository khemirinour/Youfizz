import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { ArticlesInternalController } from './articles-internal.controller';
import { AppService } from './app.service';
import { SharedModule } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';

@Module({
  imports: [
    SharedModule, 
    TypeOrmModule.forFeature([Article]),
    HttpModule,
  ],
  controllers: [AppController, ArticlesInternalController],
  providers: [AppService],
})
export class AppModule {}


