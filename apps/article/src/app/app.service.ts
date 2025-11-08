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

  async findAll(query: QueryArticlesDto) {
    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.status) where.status = query.status;
    if (query.search) where.title = ILike(`%${query.search}%`);
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    const [items, total] = await this.articleRepository.findAndCount({
      where,
      take: query.limit,
      skip: query.offset,
      order: { title: 'ASC' },
    });
    return { items, total };
  }

  findOne(id: string) {
    return this.articleRepository.findOne({ where: { id } });
  }
  async findByVendor(vendorId: string, query: QueryArticlesDto) {
    const where: any = { vendorId }; // Always filter by vendorId
    
    if (query.status) where.status = query.status;
    if (query.search) where.title = ILike(`%${query.search}%`);
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    console.log("where", where);
    console.log("query", query);

    const [items, total] = await this.articleRepository.findAndCount({
      where,
      take: query.limit,
      skip: query.offset,
      order: { title: 'ASC' },
    });
    return { items, total };
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

  async setActive(id: string, active: boolean) {
    await this.articleRepository.update({ id }, { isActive: active });
    return this.findOne(id);
  }

  async getArticleStats() {
    const [total, byStatus, activeCount, inactiveCount] = await Promise.all([
      this.articleRepository.count(),
      this.articleRepository
        .createQueryBuilder('article')
        .select('article.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('article.status')
        .getRawMany(),
      this.articleRepository.count({ where: { isActive: true } }),
      this.articleRepository.count({ where: { isActive: false } }),
    ]);

    const byStatusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      byStatusMap[item.status] = parseInt(item.count, 10);
    });

    // Calculate total stock quantity
    const stockResult = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.stock)', 'total')
      .getRawOne();
    const totalStock = stockResult?.total ? parseInt(stockResult.total, 10) : 0;

    return {
      total,
      byStatus: byStatusMap,
      active: activeCount,
      inactive: inactiveCount,
      totalStock,
    };
  }
}


