import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  parentId?: string | null;

  @ApiPropertyOptional({ type: () => CategoryResponseDto })
  parent?: CategoryResponseDto | null;

  @ApiPropertyOptional({ type: [CategoryResponseDto] })
  children?: CategoryResponseDto[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(entity: Category, includeRelations: boolean = false): CategoryResponseDto {
    const dto: CategoryResponseDto = {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description ?? null,
      parentId: entity.parentId ?? null,
      isActive: entity.isActive,
      order: entity.order,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (includeRelations) {
      if (entity.parent) {
        dto.parent = CategoryResponseDto.fromEntity(entity.parent, false);
      }
      if (entity.children && entity.children.length > 0) {
        dto.children = entity.children.map((child) => CategoryResponseDto.fromEntity(child, false));
      }
    }

    return dto;
  }
}

