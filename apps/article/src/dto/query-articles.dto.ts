import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsArray, IsNumberString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '../entities/article.entity';

export enum SortBy {
  TITLE = 'title',
  PRICE = 'price',
  STOCK = 'stock',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryArticlesDto {
  @ApiPropertyOptional({ description: 'Full-text search in title, description, and SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Single category ID (backward compatibility)' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of category IDs for filtering (can be comma-separated string or array)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // Handle comma-separated string
      const ids = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
      return ids.length > 0 ? ids : undefined;
    }
    return [value];
  })
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ description: 'Filter by active visibility' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Minimum price (decimal string)' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Maximum price (decimal string)' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Minimum stock level' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Maximum stock level' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'Filter articles created after this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter articles created before this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ enum: SortBy, default: SortBy.TITLE, description: 'Field to sort by' })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.TITLE;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC, description: 'Sort order' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({ minimum: 1, maximum: 200, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}


