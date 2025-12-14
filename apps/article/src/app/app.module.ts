import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { ArticlesInternalController } from './articles-internal.controller';
import { CategoryController } from './category.controller';
import { AppService } from './app.service';
import { CategoryService } from './category.service';
import { CategorySeedService } from './category-seed.service';
import { SharedModule } from '@you-fizz/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { ArticleCategory } from '../entities/article-category.entity';

@Module({
  imports: [
    SharedModule, 
    TypeOrmModule.forFeature([Article, Category, ArticleCategory]),
    HttpModule,
  ],
  controllers: [AppController, ArticlesInternalController, CategoryController],
  providers: [AppService, CategoryService, CategorySeedService],
  exports: [CategoryService],
})
export class AppModule {}


