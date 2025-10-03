import { ApiProperty } from '@nestjs/swagger';
import { Article, ArticleStatus } from '../entities/article.entity';

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
  categoryId?: string | null;

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(entity: Article): ArticleResponseDto {
    return {
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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


