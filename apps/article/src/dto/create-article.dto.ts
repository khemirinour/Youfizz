import { IsEnum, IsInt, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

  @ApiPropertyOptional({ description: 'Decimal string, e.g. 15.99. Optional price after discount' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsNumberString()
  priceAfterDiscount?: string;

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

  @ApiPropertyOptional({ 
    type: Object, 
    description: 'Delivery prices per region. Key is region name, value is price as decimal string, e.g. {"Tunis": "5.00", "Sfax": "7.50"}' 
  })
  @IsOptional()
  deliveryPrices?: Record<string, string>;

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Available delivery regions for this article, e.g. ["Tunis", "Sfax", "Sousse"]' 
  })
  @IsOptional()
  deliveryRegions?: string[];
}


