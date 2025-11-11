import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { Article } from '../entities/article.entity';
import { QueryArticlesDto } from '../dto/query-articles.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly uploadServiceUrl: string;
  private readonly defaultBucket = 'youfizz-articles';

  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const uploadPort = this.configService.get('uploadService.port') || 3006;
    this.uploadServiceUrl = `http://localhost:${uploadPort}/api/upload`;
  }

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

  async uploadImage(file: Express.Multer.File, articleId?: string, authorization?: string): Promise<string> {
    try {
      const folder = articleId ? `articles/${articleId}` : 'articles/temp';
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const params = new URLSearchParams();
      params.append('bucket', this.defaultBucket);
      params.append('folder', folder);

      const headers: Record<string, string> = {
        ...formData.getHeaders(),
      };
      
      // Add authorization header if provided
      if (authorization) {
        headers['Authorization'] = authorization;
      }

      const response = await firstValueFrom(
        this.httpService.post<{ url: string; filename: string; objectName: string; size: number; mimeType: string; bucket: string }>(
          `${this.uploadServiceUrl}?${params.toString()}`,
          formData,
          { headers }
        )
      );

      return response.data.url;
    } catch (error: any) {
      this.logger.error(`Error uploading image: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], articleId?: string, authorization?: string): Promise<string[]> {
    try {
      const folder = articleId ? `articles/${articleId}` : 'articles/temp';
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });

      const params = new URLSearchParams();
      params.append('bucket', this.defaultBucket);
      params.append('folder', folder);

      const headers: Record<string, string> = {
        ...formData.getHeaders(),
      };
      
      // Add authorization header if provided
      if (authorization) {
        headers['Authorization'] = authorization;
      }

      const response = await firstValueFrom(
        this.httpService.post<{ files: Array<{ url: string; filename: string; objectName: string; size: number; mimeType: string; bucket: string }>; total: number }>(
          `${this.uploadServiceUrl}/multiple?${params.toString()}`,
          formData,
          { headers }
        )
      );

      return response.data.files.map((f) => f.url);
    } catch (error: any) {
      this.logger.error(`Error uploading images: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload images');
    }
  }

  async addImageToArticle(articleId: string, imageUrl: string): Promise<Article> {
    const article = await this.findOne(articleId);
    if (!article) {
      throw new BadRequestException('Article not found');
    }

    const images = article.images || [];
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      await this.articleRepository.update({ id: articleId }, { images });
    }

    return this.findOne(articleId);
  }

  async addImagesToArticle(articleId: string, imageUrls: string[]): Promise<Article> {
    const article = await this.findOne(articleId);
    if (!article) {
      throw new BadRequestException('Article not found');
    }

    const images = article.images || [];
    imageUrls.forEach((url) => {
      if (!images.includes(url)) {
        images.push(url);
      }
    });

    await this.articleRepository.update({ id: articleId }, { images });
    return this.findOne(articleId);
  }

  async removeImageFromArticle(articleId: string, imageUrl: string): Promise<Article> {
    const article = await this.findOne(articleId);
    if (!article) {
      throw new BadRequestException('Article not found');
    }

    const images = (article.images || []).filter((url) => url !== imageUrl);
    await this.articleRepository.update({ id: articleId }, { images });

    return this.findOne(articleId);
  }
}


