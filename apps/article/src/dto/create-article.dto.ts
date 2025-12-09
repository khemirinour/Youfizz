import { IsEnum, IsInt, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Decimal string, e.g. 19.99' })
  @IsNumberString()
  price!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string; // Kept for backward compatibility

  @ApiPropertyOptional({ type: [String], description: 'Array of category IDs' })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: Object, description: 'Product specifications/attributes' })
  @IsOptional()
  specifications?: Record<string, any>;
}


