import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { QueryArticlesDto } from '../dto/query-articles.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
  ) {}

  getData(): { message: string } {
    return { message: 'Article Service' };
  }

  findAll(query: QueryArticlesDto) {
    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.status) where.status = query.status;
    if (query.search) where.title = ILike(`%${query.search}%`);
    return this.articleRepository.find({
      where,
      take: query.limit,
      skip: query.offset,
      order: { title: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.articleRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Article>) {
    try {
      const entity = this.articleRepository.create(data);
      return await this.articleRepository.save(entity);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: UpdateArticleDto) {
    await this.articleRepository.update({ id }, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.articleRepository.delete({ id });
    return { id };
  }
}


