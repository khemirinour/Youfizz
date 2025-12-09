import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, In, MoreThanOrEqual, LessThanOrEqual, MoreThan, LessThan } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { Article } from '../entities/article.entity';
import { ArticleCategory } from '../entities/article-category.entity';
import { QueryArticlesDto, SortBy, SortOrder } from '../dto/query-articles.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { CategoryService } from './category.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly uploadServiceUrl: string;
  private readonly defaultBucket = 'youfizz-articles';

  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleCategory) private readonly articleCategoryRepository: Repository<ArticleCategory>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly categoryService: CategoryService,
  ) {
    const uploadPort = this.configService.get('uploadService.port') || 3006;
    this.uploadServiceUrl = `http://localhost:${uploadPort}/api/upload`;
  }

  getData(): { message: string } {
    return { message: 'Article Service' };
  }

  async findAll(query: QueryArticlesDto) {
    this.logger.debug('Query received:', JSON.stringify(query));
    const qb = this.articleRepository.createQueryBuilder('article');

    // Basic filters
    if (query.vendorId) {
      qb.andWhere('article.vendorId = :vendorId', { vendorId: query.vendorId });
    }
    if (query.status) {
      this.logger.debug(`Filtering by status: ${query.status}`);
      qb.andWhere('article.status = :status', { status: query.status });
    }
    if (typeof query.isActive === 'boolean') {
      this.logger.debug(`Filtering by isActive: ${query.isActive}`);
      qb.andWhere('article.isActive = :isActive', { isActive: query.isActive });
    }

    // Full-text search using PostgreSQL tsvector
    if (query.search) {
      const searchTerm = query.search.trim();
      qb.andWhere(
        `(
          to_tsvector('simple', COALESCE(article.title, '')) @@ plainto_tsquery('simple', :search) OR
          to_tsvector('simple', COALESCE(article.description, '')) @@ plainto_tsquery('simple', :search) OR
          to_tsvector('simple', COALESCE(article.sku, '')) @@ plainto_tsquery('simple', :search) OR
          article.title ILIKE :searchLike OR
          article.description ILIKE :searchLike OR
          article.sku ILIKE :searchLike
        )`,
        { search: searchTerm, searchLike: `%${searchTerm}%` }
      );
    }

    // Price range filtering - price is stored as numeric in DB
    if (query.minPrice) {
      const minPriceNum = parseFloat(query.minPrice);
      if (!isNaN(minPriceNum)) {
        qb.andWhere('article.price >= :minPrice', { minPrice: minPriceNum });
      }
    }
    if (query.maxPrice) {
      const maxPriceNum = parseFloat(query.maxPrice);
      if (!isNaN(maxPriceNum)) {
        qb.andWhere('article.price <= :maxPrice', { maxPrice: maxPriceNum });
      }
    }

    // Stock range filtering
    if (query.minStock !== undefined && query.minStock !== null) {
      qb.andWhere('article.stock >= :minStock', { minStock: query.minStock });
    }
    if (query.maxStock !== undefined && query.maxStock !== null) {
      qb.andWhere('article.stock <= :maxStock', { maxStock: query.maxStock });
    }

    // Date range filtering
    if (query.createdAfter) {
      qb.andWhere('article.createdAt >= :createdAfter', { createdAfter: query.createdAfter });
    }
    if (query.createdBefore) {
      qb.andWhere('article.createdAt <= :createdBefore', { createdBefore: query.createdBefore });
    }

    // Category filtering - support both old categoryId and new categoryIds
    const categoryIds: string[] = [];
    if (query.categoryId) {
      categoryIds.push(query.categoryId);
    }
    if (query.categoryIds) {
      this.logger.debug('categoryIds received:', query.categoryIds, 'Type:', typeof query.categoryIds, 'IsArray:', Array.isArray(query.categoryIds));
      if (Array.isArray(query.categoryIds)) {
        if (query.categoryIds.length > 0) {
          categoryIds.push(...query.categoryIds);
        }
      } else {
        // Handle single value (might come from query param parsing before Transform)
        const categoryIdValue = query.categoryIds as any;
        if (typeof categoryIdValue === 'string' && categoryIdValue.length > 0) {
          categoryIds.push(categoryIdValue);
        }
      }
    }
    
    this.logger.debug('Final categoryIds to filter:', categoryIds);
    
    // Load categories for each article (needed for both filtering and response)
    qb.leftJoinAndSelect('article.articleCategories', 'articleCategories');
    qb.leftJoinAndSelect('articleCategories.category', 'category');
    
    if (categoryIds.length > 0) {
      this.logger.debug(`Filtering by categories: ${categoryIds.join(', ')}`);
      // Filter by categories using EXISTS subquery to ensure proper filtering
      qb.andWhere(
        `EXISTS (
          SELECT 1 
          FROM article_categories ac 
          WHERE ac.articleId = article.id 
          AND ac.categoryId IN (:...categoryIds)
        )`,
        { categoryIds }
      );
    }
    
    // Log the generated SQL for debugging
    const sql = qb.getSql();
    this.logger.debug('Generated SQL:', sql);
    this.logger.debug('SQL Parameters:', qb.getParameters());

    // Sorting
    const sortBy = query.sortBy || SortBy.TITLE;
    const sortOrder = query.sortOrder || SortOrder.ASC;
    const sortField = `article.${sortBy}`;
    qb.orderBy(sortField, sortOrder);

    // Pagination
    qb.take(query.limit || 20);
    qb.skip(query.offset || 0);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: string) {
    return this.articleRepository.findOne({
      where: { id },
      relations: ['articleCategories', 'articleCategories.category'],
    });
  }
  async findByVendor(vendorId: string, query: QueryArticlesDto) {
    // Use findAll with vendorId always set
    const vendorQuery = { ...query, vendorId };
    return this.findAll(vendorQuery);
  }

  async create(data: Partial<Article> & { categoryIds?: string[] }) {
    try {
      const { categoryIds, ...articleData } = data;
      const entity = this.articleRepository.create(articleData);
      const savedArticle = await this.articleRepository.save(entity);

      // Handle category associations
      if (categoryIds && categoryIds.length > 0) {
        await this.setArticleCategories(savedArticle.id, categoryIds);
      }

      return savedArticle;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: UpdateArticleDto & { categoryIds?: string[] }) {
    const { categoryIds, ...articleData } = data;
    await this.articleRepository.update({ id }, articleData);

    // Handle category associations if provided
    if (categoryIds !== undefined) {
      await this.setArticleCategories(id, categoryIds);
    }

    return this.findOne(id);
  }

  private async setArticleCategories(articleId: string, categoryIds: string[]): Promise<void> {
    // Validate categories exist
    const categories = await this.categoryService.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map((c) => c.id);
      const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(`Categories not found: ${missingIds.join(', ')}`);
    }

    // Remove existing associations
    await this.articleCategoryRepository.delete({ articleId });

    // Create new associations
    if (categoryIds.length > 0) {
      const associations = categoryIds.map((categoryId) =>
        this.articleCategoryRepository.create({ articleId, categoryId })
      );
      await this.articleCategoryRepository.save(associations);
    }
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


