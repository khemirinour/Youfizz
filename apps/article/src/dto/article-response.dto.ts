import { ApiProperty } from '@nestjs/swagger';
import { Article, ArticleStatus } from '../entities/article.entity';
import { CategoryResponseDto } from './category-response.dto';

export class ArticleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ description: 'Decimal string' })
  price!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ required: false, nullable: true })
  sku?: string | null;

  @ApiProperty({ required: false, nullable: true })
  categoryId?: string | null; // Kept for backward compatibility

  @ApiProperty({ type: [CategoryResponseDto], required: false, nullable: true })
  categories?: CategoryResponseDto[] | null;

  @ApiProperty({ required: false, nullable: true })
  vendorId?: string | null;

  @ApiProperty({ type: [String], required: false, nullable: true })
  images?: string[] | null;

  @ApiProperty({ enum: ArticleStatus })
  status!: ArticleStatus;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: Object, required: false, nullable: true })
  metadata?: Record<string, any> | null;

  @ApiProperty({ type: Object, required: false, nullable: true, description: 'Product specifications/attributes' })
  specifications?: Record<string, any> | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(entity: Article, includeCategories: boolean = false): ArticleResponseDto {
    const dto: ArticleResponseDto = {
      id: entity.id,
      title: entity.title,
      description: entity.description ?? null,
      price: entity.price,
      stock: entity.stock,
      sku: entity.sku ?? null,
      categoryId: entity.categoryId ?? null,
      vendorId: entity.vendorId ?? null,
      images: entity.images ?? null,
      status: entity.status,
      isActive: entity.isActive,
      metadata: entity.metadata ?? null,
      specifications: entity.specifications ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (includeCategories && entity.articleCategories && entity.articleCategories.length > 0) {
      dto.categories = entity.articleCategories.map((ac) => 
        CategoryResponseDto.fromEntity(ac.category, false)
      );
    }

    return dto;
  }
}


